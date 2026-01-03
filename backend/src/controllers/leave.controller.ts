import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

export const requestLeave = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { leaveType, startDate, endDate, remarks } = req.body;

        // Get employee
        const employee = await prisma.employee.findUnique({
            where: { userId: req.user.userId },
        });

        if (!employee) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }

        // Calculate number of days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Check leave balance
        const year = start.getFullYear();
        const allocation = await prisma.leaveAllocation.findFirst({
            where: {
                employeeId: employee.id,
                leaveType,
                year,
            },
        });

        if (!allocation) {
            res.status(400).json({ error: `No leave allocation found for ${leaveType} in ${year}` });
            return;
        }

        const remainingDays = allocation.allocatedDays - allocation.usedDays;

        if (days > remainingDays) {
            res.status(400).json({
                error: `Insufficient leave balance. Requested: ${days} days, Available: ${remainingDays} days`
            });
            return;
        }

        // Create leave request
        const leave = await prisma.leave.create({
            data: {
                employeeId: employee.id,
                leaveType,
                startDate: start,
                endDate: end,
                remarks,
                status: 'PENDING',
            },
        });

        res.status(201).json({
            message: 'Leave request submitted successfully',
            leave,
        });
    } catch (error) {
        console.error('Request leave error:', error);
        res.status(500).json({ error: 'Failed to submit leave request' });
    }
};

export const getLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { status, employeeId } = req.query;

        let whereClause: any = {};

        // Admin/HR can view all, employees can only view their own
        if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
            if (employeeId) {
                whereClause.employeeId = employeeId as string;
            }
        } else {
            // Get employee ID for current user
            const employee = await prisma.employee.findUnique({
                where: { userId: req.user.userId },
            });

            if (!employee) {
                res.status(404).json({ error: 'Employee not found' });
                return;
            }

            whereClause.employeeId = employee.id;
        }

        if (status) {
            whereClause.status = status;
        }

        const leaves = await prisma.leave.findMany({
            where: whereClause,
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({ leaves });
    } catch (error) {
        console.error('Get leaves error:', error);
        res.status(500).json({ error: 'Failed to fetch leave requests' });
    }
};

export const approveLeave = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { id } = req.params;

        // Get leave request
        const leave = await prisma.leave.findUnique({
            where: { id },
        });

        if (!leave) {
            res.status(404).json({ error: 'Leave request not found' });
            return;
        }

        if (leave.status !== 'PENDING') {
            res.status(400).json({ error: 'Leave request already processed' });
            return;
        }

        // Calculate days
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Update leave allocation and leave status in transaction
        const year = start.getFullYear();

        await prisma.$transaction([
            // Update leave status
            prisma.leave.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    approvedBy: req.user.userId,
                    approvedAt: new Date(),
                },
            }),
            // Update used days in allocation
            prisma.leaveAllocation.updateMany({
                where: {
                    employeeId: leave.employeeId,
                    leaveType: leave.leaveType,
                    year,
                },
                data: {
                    usedDays: {
                        increment: days,
                    },
                },
            }),
            // Mark attendance as leave for the date range
            ...Array.from({ length: days }, (_, i) => {
                const date = new Date(start);
                date.setDate(date.getDate() + i);
                date.setHours(0, 0, 0, 0);

                return prisma.attendance.upsert({
                    where: {
                        employeeId_date: {
                            employeeId: leave.employeeId,
                            date,
                        },
                    },
                    create: {
                        employeeId: leave.employeeId,
                        date,
                        status: 'LEAVE',
                    },
                    update: {
                        status: 'LEAVE',
                    },
                });
            }),
        ]);

        res.json({ message: 'Leave approved successfully' });
    } catch (error) {
        console.error('Approve leave error:', error);
        res.status(500).json({ error: 'Failed to approve leave' });
    }
};

export const rejectLeave = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const leave = await prisma.leave.findUnique({
            where: { id },
        });

        if (!leave) {
            res.status(404).json({ error: 'Leave request not found' });
            return;
        }

        if (leave.status !== 'PENDING') {
            res.status(400).json({ error: 'Leave request already processed' });
            return;
        }

        await prisma.leave.update({
            where: { id },
            data: {
                status: 'REJECTED',
                approvedBy: req.user!.userId,
                approvedAt: new Date(),
            },
        });

        res.json({ message: 'Leave rejected successfully' });
    } catch (error) {
        console.error('Reject leave error:', error);
        res.status(500).json({ error: 'Failed to reject leave' });
    }
};

export const getLeaveAllocations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { employeeId } = req.query;

        let targetEmployeeId: string;

        if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
            targetEmployeeId = (employeeId as string) || req.user.userId;

            // If employeeId is userId, convert to employeeId
            if (employeeId) {
                const emp = await prisma.employee.findFirst({
                    where: {
                        OR: [
                            { id: employeeId as string },
                            { userId: employeeId as string },
                        ],
                    },
                });

                if (emp) {
                    targetEmployeeId = emp.id;
                }
            }
        } else {
            const employee = await prisma.employee.findUnique({
                where: { userId: req.user.userId },
            });

            if (!employee) {
                res.status(404).json({ error: 'Employee not found' });
                return;
            }

            targetEmployeeId = employee.id;
        }

        const currentYear = new Date().getFullYear();

        const allocations = await prisma.leaveAllocation.findMany({
            where: {
                employeeId: targetEmployeeId,
                year: currentYear,
            },
        });

        res.json({ allocations });
    } catch (error) {
        console.error('Get leave allocations error:', error);
        res.status(500).json({ error: 'Failed to fetch leave allocations' });
    }
};

export const createLeaveAllocation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { employeeId, leaveType, allocatedDays, year } = req.body;

        // Check if allocation already exists
        const existing = await prisma.leaveAllocation.findFirst({
            where: {
                employeeId,
                leaveType,
                year: year || new Date().getFullYear(),
            },
        });

        if (existing) {
            res.status(400).json({ error: 'Leave allocation already exists for this type and year' });
            return;
        }

        const allocation = await prisma.leaveAllocation.create({
            data: {
                employeeId,
                leaveType,
                allocatedDays,
                year: year || new Date().getFullYear(),
            },
        });

        res.status(201).json({
            message: 'Leave allocation created successfully',
            allocation,
        });
    } catch (error) {
        console.error('Create leave allocation error:', error);
        res.status(500).json({ error: 'Failed to create leave allocation' });
    }
};

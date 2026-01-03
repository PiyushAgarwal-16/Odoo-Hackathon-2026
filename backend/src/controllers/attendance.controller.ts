import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

export const checkIn = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Get employee
        const employee = await prisma.employee.findUnique({
            where: { userId: req.user.userId },
        });

        if (!employee) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }

        // Check if already checked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                date: {
                    gte: today,
                },
            },
        });

        if (existingAttendance && existingAttendance.checkIn) {
            res.status(400).json({ error: 'Already checked in today' });
            return;
        }

        const checkInTime = new Date();

        // Create or update attendance record
        const attendance = existingAttendance
            ? await prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                    checkIn: checkInTime,
                    status: 'PRESENT',
                },
            })
            : await prisma.attendance.create({
                data: {
                    employeeId: employee.id,
                    date: today,
                    checkIn: checkInTime,
                    status: 'PRESENT',
                },
            });

        res.json({
            message: 'Checked in successfully',
            attendance,
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ error: 'Check-in failed' });
    }
};

export const checkOut = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Get employee
        const employee = await prisma.employee.findUnique({
            where: { userId: req.user.userId },
        });

        if (!employee) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }

        // Find today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                date: {
                    gte: today,
                },
            },
        });

        if (!attendance) {
            res.status(400).json({ error: 'No check-in found for today' });
            return;
        }

        if (attendance.checkOut) {
            res.status(400).json({ error: 'Already checked out today' });
            return;
        }

        if (!attendance.checkIn) {
            res.status(400).json({ error: 'Please check in first' });
            return;
        }

        const checkOutTime = new Date();

        // Calculate work hours
        const checkInTime = new Date(attendance.checkIn);
        const totalMinutes = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60));

        // Subtract break time
        const breakTimeMinutes = employee.breakTimeHours * 60;
        const workMinutes = Math.max(0, totalMinutes - breakTimeMinutes);
        const workHours = parseFloat((workMinutes / 60).toFixed(2));

        // Calculate extra hours (if work hours > 9)
        const standardHours = 9;
        const extraHours = Math.max(0, parseFloat((workHours - standardHours).toFixed(2)));

        const updatedAttendance = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOut: checkOutTime,
                workHours,
                extraHours,
            },
        });

        res.json({
            message: 'Checked out successfully',
            attendance: updatedAttendance,
        });
    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({ error: 'Check-out failed' });
    }
};

export const getAttendances = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { employeeId, startDate, endDate, month, year } = req.query;

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

        // Date filters
        if (startDate && endDate) {
            whereClause.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string),
            };
        } else if (month && year) {
            const monthNum = parseInt(month as string);
            const yearNum = parseInt(year as string);
            const firstDay = new Date(yearNum, monthNum - 1, 1);
            const lastDay = new Date(yearNum, monthNum, 0, 23, 59, 59);

            whereClause.date = {
                gte: firstDay,
                lte: lastDay,
            };
        }

        const attendances = await prisma.attendance.findMany({
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
                date: 'desc',
            },
        });

        res.json({ attendances });
    } catch (error) {
        console.error('Get attendances error:', error);
        res.status(500).json({ error: 'Failed to fetch attendances' });
    }
};

export const getTodayAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Get employee
        const employee = await prisma.employee.findUnique({
            where: { userId: req.user.userId },
        });

        if (!employee) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                date: {
                    gte: today,
                },
            },
        });

        res.json({ attendance });
    } catch (error) {
        console.error('Get today attendance error:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s attendance' });
    }
};

export const getAttendanceStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Get employee
        const employee = await prisma.employee.findUnique({
            where: { userId: req.user.userId },
        });

        if (!employee) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }

        // Get current month stats
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const attendances = await prisma.attendance.findMany({
            where: {
                employeeId: employee.id,
                date: {
                    gte: firstDayOfMonth,
                    lte: lastDayOfMonth,
                },
            },
        });

        const totalDays = attendances.length;
        const presentDays = attendances.filter(a => a.status === 'PRESENT').length;
        const absentDays = attendances.filter(a => a.status === 'ABSENT').length;
        const halfDays = attendances.filter(a => a.status === 'HALF_DAY').length;
        const leaveDays = attendances.filter(a => a.status === 'LEAVE').length;

        const totalWorkHours = attendances.reduce((sum, a) => sum + a.workHours, 0);
        const totalExtraHours = attendances.reduce((sum, a) => sum + a.extraHours, 0);

        res.json({
            stats: {
                totalDays,
                presentDays,
                absentDays,
                halfDays,
                leaveDays,
                totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
                totalExtraHours: parseFloat(totalExtraHours.toFixed(2)),
            },
        });
    } catch (error) {
        console.error('Get attendance stats error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance stats' });
    }
};

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { calculateSalaryComponents, validateSalaryComponents } from '../utils/salary';

export const getSalaryInfo = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { employeeId } = req.params;

        // Check permissions
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
        });

        if (!employee) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }

        // Employees can only view their own salary
        if (req.user.role === 'EMPLOYEE' && employee.userId !== req.user.userId) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        const salaryInfo = await prisma.salaryInfo.findUnique({
            where: { employeeId },
        });

        if (!salaryInfo) {
            res.status(404).json({ error: 'Salary information not found' });
            return;
        }

        res.json({ salaryInfo });
    } catch (error) {
        console.error('Get salary info error:', error);
        res.status(500).json({ error: 'Failed to fetch salary information' });
    }
};

export const updateSalaryInfo = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { employeeId } = req.params;
        const { monthlyWage } = req.body;

        // Validate monthly wage
        if (!monthlyWage || monthlyWage <= 0) {
            res.status(400).json({ error: 'Monthly wage must be greater than 0' });
            return;
        }

        // Check if employee exists
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
        });

        if (!employee) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }

        // Calculate all salary components
        const components = calculateSalaryComponents(monthlyWage);

        // Validate components
        const validation = validateSalaryComponents(components);
        if (!validation.valid) {
            res.status(400).json({ error: validation.message });
            return;
        }

        // Upsert salary info
        const salaryInfo = await prisma.salaryInfo.upsert({
            where: { employeeId },
            update: components,
            create: {
                employeeId,
                ...components,
            },
        });

        res.json({
            message: 'Salary information updated successfully',
            salaryInfo,
        });
    } catch (error) {
        console.error('Update salary info error:', error);
        res.status(500).json({ error: 'Failed to update salary information' });
    }
};

export const calculateSalary = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { monthlyWage } = req.body;

        if (!monthlyWage || monthlyWage <= 0) {
            res.status(400).json({ error: 'Monthly wage must be greater than 0' });
            return;
        }

        const components = calculateSalaryComponents(monthlyWage);

        const validation = validateSalaryComponents(components);
        if (!validation.valid) {
            res.status(400).json({ error: validation.message });
            return;
        }

        res.json({ components });
    } catch (error) {
        console.error('Calculate salary error:', error);
        res.status(500).json({ error: 'Failed to calculate salary' });
    }
};
// ... existing methods ...

export const getSalarySlip = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { employeeId } = req.params;
        const { month, year } = req.query;

        // Check permissions (Admin, HR, or Self)
        if (req.user.role !== 'ADMIN' && req.user.role !== 'HR') {
            const employee = await prisma.employee.findUnique({
                where: { userId: req.user.userId },
            });
            if (!employee || employee.id !== employeeId) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
        }

        const now = new Date();
        const targetYear = year ? parseInt(year as string) : now.getFullYear();
        const targetMonth = month ? parseInt(month as string) : now.getMonth(); // 0-indexed

        const firstDay = new Date(targetYear, targetMonth, 1);
        const lastDay = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
        const totalDaysInMonth = lastDay.getDate();

        // Get salary info (contractual)
        const salaryInfo = await prisma.salaryInfo.findUnique({
            where: { employeeId },
        });

        if (!salaryInfo) {
            res.status(404).json({ error: 'Salary information not found' });
            return;
        }

        // Get attendance records
        const attendances = await prisma.attendance.findMany({
            where: {
                employeeId,
                date: {
                    gte: firstDay,
                    lte: lastDay,
                },
            },
        });

        // Get approved leaves to check for Paid/Unpaid status
        // We need leaves that overlap with this month
        const leaves = await prisma.leave.findMany({
            where: {
                employeeId,
                status: 'APPROVED',
                OR: [
                    {
                        startDate: { lte: lastDay },
                        endDate: { gte: firstDay },
                    }
                ]
            },
        });

        let payableDays = 0;
        const attendanceMap = new Map();
        attendances.forEach(a => {
            const day = new Date(a.date).getDate();
            attendanceMap.set(day, a);
        });

        for (let day = 1; day <= totalDaysInMonth; day++) {
            const currentDate = new Date(targetYear, targetMonth, day);
            const attendance = attendanceMap.get(day);
            const dayOfWeek = currentDate.getDay(); // 0 = Sun, 6 = Sat

            if (attendance) {
                if (attendance.status === 'PRESENT') {
                    payableDays += 1;
                } else if (attendance.status === 'HALF_DAY') {
                    payableDays += 0.5;
                } else if (attendance.status === 'LEAVE') {
                    // Check if it's a paid leave
                    const isPaidLeave = leaves.some(leave => {
                        const start = new Date(leave.startDate);
                        const end = new Date(leave.endDate);
                        // Normalize dates to ignore time
                        start.setHours(0, 0, 0, 0);
                        end.setHours(23, 59, 59, 999);
                        const current = new Date(currentDate);
                        current.setHours(0, 0, 0, 0);

                        return current >= start && current <= end && (leave.leaveType === 'PAID' || leave.leaveType === 'SICK');
                    });

                    if (isPaidLeave) {
                        payableDays += 1;
                    }
                    // Unpaid leave adds 0
                }
                // Absent adds 0
            } else {
                // No record
                // Check if weekend (Sat/Sun) => Paid
                // Assuming 5 day work week (Sat=6, Sun=0)
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    payableDays += 1;
                } else {
                    // Weekday with no record => Absent (Unpaid)
                    // Or check if it's a Holiday? (Out of scope for now)
                }
            }
        }

        const calculatedComponents = calculateSalaryComponents(
            salaryInfo.monthlyWage,
            payableDays,
            totalDaysInMonth
        );

        res.json({
            meta: {
                month: targetMonth + 1, // display 1-indexed
                year: targetYear,
                totalDays: totalDaysInMonth,
                payableDays,
            },
            contractualSalary: salaryInfo,
            payableSalary: calculatedComponents
        });

    } catch (error) {
        console.error('Get salary slip error:', error);
        res.status(500).json({ error: 'Failed to generate salary slip' });
    }
};

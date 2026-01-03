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

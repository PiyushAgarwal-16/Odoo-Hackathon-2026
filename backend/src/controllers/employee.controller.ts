import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

export const getEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Admin/HR can see all employees, employees can only see themselves
        if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
            const employees = await prisma.employee.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            loginId: true,
                            email: true,
                            role: true,
                        },
                    },
                    manager: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            res.json({ employees });
        } else {
            // Employee can only see their own profile
            const employee = await prisma.employee.findUnique({
                where: { userId: req.user.userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            loginId: true,
                            email: true,
                            role: true,
                        },
                    },
                    manager: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });

            res.json({ employees: employee ? [employee] : [] });
        }
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
};

export const getEmployeeById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        loginId: true,
                        email: true,
                        role: true,
                    },
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                bankDetails: true,
                salaryInfo: true,
                skills: true,
                certifications: true,
            },
        });

        if (!employee) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }

        res.json({ employee });
    } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
};

export const updateEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Check if employee exists
        const employee = await prisma.employee.findUnique({
            where: { id },
        });

        if (!employee) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }

        // Employees can only edit limited fields
        if (req.user.role === 'EMPLOYEE' && employee.userId !== req.user.userId) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        // Define allowed fields for employees
        const employeeAllowedFields = ['phone', 'residingAddress', 'personalEmail', 'profilePicture'];

        let fieldsToUpdate: any = {};

        if (req.user.role === 'EMPLOYEE') {
            // Only allow specific fields for employees
            for (const field of employeeAllowedFields) {
                if (updateData[field] !== undefined) {
                    fieldsToUpdate[field] = updateData[field];
                }
            }
        } else {
            // Admin can update all fields
            fieldsToUpdate = { ...updateData };
            // Remove fields that shouldn't be updated directly
            delete fieldsToUpdate.id;
            delete fieldsToUpdate.userId;
            delete fieldsToUpdate.employeeCode;
            delete fieldsToUpdate.createdAt;
            delete fieldsToUpdate.updatedAt;
        }

        const updatedEmployee = await prisma.employee.update({
            where: { id },
            data: fieldsToUpdate,
            include: {
                user: {
                    select: {
                        id: true,
                        loginId: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        res.json({
            message: 'Employee updated successfully',
            employee: updatedEmployee
        });
    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({ error: 'Failed to update employee' });
    }
};

export const getSkills = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const skills = await prisma.skill.findMany({
            where: { employeeId: id },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ skills });
    } catch (error) {
        console.error('Get skills error:', error);
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
};

export const addSkill = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { skillName } = req.body;

        const skill = await prisma.skill.create({
            data: {
                employeeId: id,
                skillName,
            },
        });

        res.status(201).json({
            message: 'Skill added successfully',
            skill
        });
    } catch (error) {
        console.error('Add skill error:', error);
        res.status(500).json({ error: 'Failed to add skill' });
    }
};

export const removeSkill = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { skillId } = req.params;

        await prisma.skill.delete({
            where: { id: skillId },
        });

        res.json({ message: 'Skill removed successfully' });
    } catch (error) {
        console.error('Remove skill error:', error);
        res.status(500).json({ error: 'Failed to remove skill' });
    }
};

export const getCertifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const certifications = await prisma.certification.findMany({
            where: { employeeId: id },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ certifications });
    } catch (error) {
        console.error('Get certifications error:', error);
        res.status(500).json({ error: 'Failed to fetch certifications' });
    }
};

export const addCertification = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { certName, issueDate, expiryDate } = req.body;

        const certification = await prisma.certification.create({
            data: {
                employeeId: id,
                certName,
                issueDate: issueDate ? new Date(issueDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            },
        });

        res.status(201).json({
            message: 'Certification added successfully',
            certification
        });
    } catch (error) {
        console.error('Add certification error:', error);
        res.status(500).json({ error: 'Failed to add certification' });
    }
};

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const employee = await prisma.employee.findUnique({
            where: { userId: req.user.userId },
            include: {
                user: {
                    select: {
                        id: true,
                        loginId: true,
                        email: true,
                        role: true,
                    },
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                bankDetails: true,
                salaryInfo: true,
                skills: true,
                certifications: true,
            },
        });

        if (!employee) {
            res.status(404).json({ error: 'Employee profile not found' });
            return;
        }

        res.json({ employee });
    } catch (error) {
        console.error('Get my profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const updateBankDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { accountNumber, bankName, ifscCode } = req.body;

        // Check if employee exists
        const employee = await prisma.employee.findUnique({
            where: { id },
        });

        if (!employee) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }

        // Upsert bank details
        const bankDetails = await prisma.bankDetails.upsert({
            where: { employeeId: id },
            update: {
                accountNumber,
                bankName,
                ifscCode,
            },
            create: {
                employeeId: id,
                accountNumber,
                bankName,
                ifscCode,
            },
        });

        res.json({
            message: 'Bank details updated successfully',
            bankDetails,
        });
    } catch (error) {
        console.error('Update bank details error:', error);
        res.status(500).json({ error: 'Failed to update bank details' });
    }
};

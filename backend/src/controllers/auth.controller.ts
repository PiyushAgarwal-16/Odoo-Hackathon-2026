import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { hashPassword, comparePassword, generateRandomPassword, validatePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateLoginId } from '../utils/loginId';
import { AppError } from '../middleware/error';

export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            firstName,
            lastName,
            email,
            role = 'EMPLOYEE',
            dateOfJoining,
            phone,
            department,
            jobPosition,
        } = req.body;

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }

        // Generate login ID
        const joiningDate = dateOfJoining ? new Date(dateOfJoining) : new Date();
        const loginId = await generateLoginId(firstName, lastName, joiningDate);

        // Generate random password
        const generatedPassword = generateRandomPassword();
        const hashedPassword = await hashPassword(generatedPassword);

        // Create user and employee in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    loginId,
                    email,
                    password: hashedPassword,
                    role,
                },
            });

            const employee = await tx.employee.create({
                data: {
                    userId: user.id,
                    employeeCode: loginId,
                    firstName,
                    lastName,
                    phone,
                    department,
                    jobPosition,
                    dateOfJoining: joiningDate,
                },
            });

            return { user, employee };
        });

        res.status(201).json({
            message: 'Employee created successfully',
            loginId,
            generatedPassword,
            employee: {
                id: result.employee.id,
                firstName: result.employee.firstName,
                lastName: result.employee.lastName,
                email: result.user.email,
                role: result.user.role,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create employee' });
    }
};

export const signin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { loginId, password } = req.body;

        // Find user by loginId or email
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { loginId },
                    { email: loginId },
                ],
            },
            include: {
                employee: true,
            },
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            loginId: user.loginId,
            role: user.role,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Save refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            isFirstLogin: user.isFirstLogin,
            user: {
                id: user.id,
                loginId: user.loginId,
                email: user.email,
                role: user.role,
                employeeId: user.employee?.id,
                firstName: user.employee?.firstName,
                lastName: user.employee?.lastName,
            },
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token required' });
            return;
        }

        // Verify refresh token
        const payload = verifyRefreshToken(refreshToken);

        // Check if token matches stored token
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user || user.refreshToken !== refreshToken) {
            res.status(401).json({ error: 'Invalid refresh token' });
            return;
        }

        // Generate new access token
        const tokenPayload = {
            userId: user.id,
            loginId: user.loginId,
            role: user.role,
        };

        const accessToken = generateAccessToken(tokenPayload);

        res.json({ accessToken });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Clear refresh token
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { refreshToken: null },
        });

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { currentPassword, newPassword } = req.body;

        // Validate new password
        const validation = validatePassword(newPassword);
        if (!validation.valid) {
            res.status(400).json({ error: validation.message });
            return;
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Verify current password
        const isPasswordValid = await comparePassword(currentPassword, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Current password is incorrect' });
            return;
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password and set isFirstLogin to false
        await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                password: hashedPassword,
                isFirstLogin: false,
            },
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Password change failed' });
    }
};

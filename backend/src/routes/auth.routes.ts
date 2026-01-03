import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { checkAdmin } from '../middleware/role';
import { validate } from '../middleware/validation';

const router = Router();

// Signup (Admin only - create new employee)
router.post(
    '/signup',
    authenticate,
    checkAdmin,
    [
        body('firstName').trim().notEmpty().withMessage('First name is required'),
        body('lastName').trim().notEmpty().withMessage('Last name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('role').optional().isIn(['ADMIN', 'HR', 'EMPLOYEE']).withMessage('Invalid role'),
        body('dateOfJoining').optional().isISO8601().withMessage('Invalid date format'),
    ],
    validate,
    authController.signup
);

// Signin
router.post(
    '/signin',
    [
        body('loginId').trim().notEmpty().withMessage('Login ID or email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    authController.signin
);

// Refresh token
router.post(
    '/refresh',
    [
        body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    ],
    validate,
    authController.refreshToken
);

// Logout
router.post('/logout', authenticate, authController.logout);

// Change password
router.post(
    '/change-password',
    authenticate,
    [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword').notEmpty().withMessage('New password is required'),
    ],
    validate,
    authController.changePassword
);

export default router;

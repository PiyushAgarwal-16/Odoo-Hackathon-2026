import { Router } from 'express';
import { body, param } from 'express-validator';
import * as salaryController from '../controllers/salary.controller';
import { authenticate } from '../middleware/auth';
import { checkAdmin, checkAdminOrSelf } from '../middleware/role';
import { validate } from '../middleware/validation';

const router = Router();

// Get salary info
router.get(
    '/:employeeId',
    authenticate,
    checkAdminOrSelf,
    param('employeeId').notEmpty().withMessage('Employee ID is required'),
    validate,
    salaryController.getSalaryInfo
);

// Update salary info (Admin only)
router.put(
    '/:employeeId',
    authenticate,
    checkAdmin,
    [
        param('employeeId').notEmpty().withMessage('Employee ID is required'),
        body('monthlyWage').isFloat({ min: 1 }).withMessage('Monthly wage must be greater than 0'),
    ],
    validate,
    salaryController.updateSalaryInfo
);

// Calculate salary components (Admin only - for preview)
router.post(
    '/calculate',
    authenticate,
    checkAdmin,
    [
        body('monthlyWage').isFloat({ min: 1 }).withMessage('Monthly wage must be greater than 0'),
    ],
    validate,
    salaryController.calculateSalary
);

// Get salary slip (Payable Salary)
router.get(
    '/:employeeId/slip',
    authenticate,
    checkAdminOrSelf,
    param('employeeId').notEmpty().withMessage('Employee ID is required'),
    validate,
    salaryController.getSalarySlip
);

export default router;

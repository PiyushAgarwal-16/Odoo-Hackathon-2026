import { Router } from 'express';
import { body, query } from 'express-validator';
import * as leaveController from '../controllers/leave.controller';
import { authenticate } from '../middleware/auth';
import { checkAdmin } from '../middleware/role';
import { validate } from '../middleware/validation';

const router = Router();

// Request leave (Employee)
router.post(
    '/',
    authenticate,
    [
        body('leaveType').isIn(['PAID', 'SICK', 'UNPAID']).withMessage('Invalid leave type'),
        body('startDate').isISO8601().withMessage('Valid start date is required'),
        body('endDate').isISO8601().withMessage('Valid end date is required'),
        body('remarks').optional().isString(),
    ],
    validate,
    leaveController.requestLeave
);

// Get leave requests
router.get(
    '/',
    authenticate,
    [
        query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED']),
        query('employeeId').optional().isString(),
    ],
    validate,
    leaveController.getLeaves
);

// Approve leave (Admin/HR)
router.put('/:id/approve', authenticate, checkAdmin, leaveController.approveLeave);

// Reject leave (Admin/HR)
router.put('/:id/reject', authenticate, checkAdmin, leaveController.rejectLeave);

// Get leave allocations
router.get(
    '/allocations',
    authenticate,
    [
        query('employeeId').optional().isString(),
    ],
    validate,
    leaveController.getLeaveAllocations
);

// Create leave allocation (Admin/HR)
router.post(
    '/allocations',
    authenticate,
    checkAdmin,
    [
        body('employeeId').notEmpty().withMessage('Employee ID is required'),
        body('leaveType').isIn(['PAID', 'SICK', 'UNPAID']).withMessage('Invalid leave type'),
        body('allocatedDays').isFloat({ min: 0 }).withMessage('Allocated days must be a positive number'),
        body('year').optional().isInt().withMessage('Year must be a valid integer'),
    ],
    validate,
    leaveController.createLeaveAllocation
);

export default router;

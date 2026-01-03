import { Router } from 'express';
import { body } from 'express-validator';
import * as employeeController from '../controllers/employee.controller';
import { authenticate } from '../middleware/auth';
import { checkAdmin, checkAdminOrSelf } from '../middleware/role';
import { validate } from '../middleware/validation';

const router = Router();

// Get all employees (Admin: all employees, Employee: self only)
router.get('/', authenticate, employeeController.getEmployees);

// Get my profile
router.get('/me', authenticate, employeeController.getMyProfile);

// Get employee by ID
router.get('/:id', authenticate, checkAdminOrSelf, employeeController.getEmployeeById);

// Update employee
router.put(
    '/:id',
    authenticate,
    checkAdminOrSelf,
    employeeController.updateEmployee
);

// Bank details
router.put(
    '/:id/bank-details',
    authenticate,
    checkAdmin,
    [
        body('accountNumber').notEmpty().withMessage('Account number is required'),
        body('bankName').notEmpty().withMessage('Bank name is required'),
        body('ifscCode').notEmpty().withMessage('IFSC code is required'),
    ],
    validate,
    employeeController.updateBankDetails
);

// Skills
router.get('/:id/skills', authenticate, checkAdminOrSelf, employeeController.getSkills);

router.post(
    '/:id/skills',
    authenticate,
    checkAdminOrSelf,
    [
        body('skillName').trim().notEmpty().withMessage('Skill name is required'),
    ],
    validate,
    employeeController.addSkill
);

router.delete('/:id/skills/:skillId', authenticate, checkAdminOrSelf, employeeController.removeSkill);

// Certifications
router.get('/:id/certifications', authenticate, checkAdminOrSelf, employeeController.getCertifications);

router.post(
    '/:id/certifications',
    authenticate,
    checkAdminOrSelf,
    [
        body('certName').trim().notEmpty().withMessage('Certification name is required'),
        body('issueDate').optional().isISO8601().withMessage('Invalid date format'),
        body('expiryDate').optional().isISO8601().withMessage('Invalid date format'),
    ],
    validate,
    employeeController.addCertification
);

export default router;

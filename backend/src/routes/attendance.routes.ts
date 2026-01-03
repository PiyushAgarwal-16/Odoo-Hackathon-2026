import { Router } from 'express';
import { query } from 'express-validator';
import * as attendanceController from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Check-in
router.post('/check-in', authenticate, attendanceController.checkIn);

// Check-out
router.post('/check-out', authenticate, attendanceController.checkOut);

// Get today's attendance
router.get('/today', authenticate, attendanceController.getTodayAttendance);

// Get attendances (with filters)
router.get(
    '/',
    authenticate,
    [
        query('employeeId').optional().isString(),
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        query('month').optional().isInt({ min: 1, max: 12 }),
        query('year').optional().isInt(),
    ],
    validate,
    attendanceController.getAttendances
);

// Get attendance stats
router.get('/stats', authenticate, attendanceController.getAttendanceStats);

export default router;

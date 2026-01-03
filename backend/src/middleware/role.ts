import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const checkAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    if (req.user.role !== 'ADMIN' && req.user.role !== 'HR') {
        res.status(403).json({ error: 'Access denied. Admin or HR role required.' });
        return;
    }

    next();
};

export const checkEmployee = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    next();
};

export const checkAdminOrSelf = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const targetUserId = req.params.id || req.params.employeeId;

    // Admin/HR can access any user, employees can only access themselves
    if (req.user.role === 'ADMIN' || req.user.role === 'HR' || req.user.userId === targetUserId) {
        next();
        return;
    }

    res.status(403).json({ error: 'Access denied' });
};

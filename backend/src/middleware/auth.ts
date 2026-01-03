import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        loginId: string;
        role: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        const payload = verifyAccessToken(token);
        req.user = payload;

        next();
    } catch (error) {
        if (error instanceof Error && error.name === 'TokenExpiredError') {
            res.status(401).json({ error: 'Token expired' });
            return;
        }

        res.status(401).json({ error: 'Invalid token' });
    }
};

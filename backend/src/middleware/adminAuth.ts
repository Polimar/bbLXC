import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
    userId?: string;
}

export const adminAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { isAdmin: true, username: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ 
                error: 'Admin access required',
                message: 'You do not have permission to access this resource'
            });
        }

        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
    userId?: string;
}

export const premiumAuth = async (
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
            select: {
                isAdmin: true,
                accountType: true,
                premiumExpiresAt: true,
                username: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Admin users have access to all premium features
        if (user.isAdmin) {
            return next();
        }

        // Check if user has premium account
        if (user.accountType !== 'PREMIUM') {
            return res.status(403).json({
                error: 'Premium access required',
                message: 'This feature is only available for premium users. Please upgrade your account.',
                upgradeUrl: '/upgrade'
            });
        }

        // Check if premium subscription is still valid
        if (user.premiumExpiresAt && new Date(user.premiumExpiresAt) < new Date()) {
            return res.status(403).json({
                error: 'Premium subscription expired',
                message: 'Your premium subscription has expired. Please renew to continue using premium features.',
                upgradeUrl: '/upgrade'
            });
        }

        next();
    } catch (error) {
        console.error('Premium auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

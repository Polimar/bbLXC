import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
    userId?: string;
}

export class AdminController {
    // Get all users with pagination and filters
    static async getUsers(req: AuthRequest, res: Response) {
        try {
            const { page = 1, limit = 20, search, accountType, isAdmin } = req.query;

            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};

            if (search) {
                where.OR = [
                    { username: { contains: String(search), mode: 'insensitive' } },
                    { email: { contains: String(search), mode: 'insensitive' } }
                ];
            }

            if (accountType) {
                where.accountType = accountType;
            }

            if (isAdmin !== undefined) {
                where.isAdmin = isAdmin === 'true';
            }

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        accountType: true,
                        isAdmin: true,
                        isOnline: true,
                        lastSeen: true,
                        premiumExpiresAt: true,
                        createdAt: true,
                        _count: {
                            select: {
                                games: true,
                                ownedQuestionSets: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.user.count({ where })
            ]);

            res.json({
                users,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }

    // Update user role (FREE/PREMIUM)
    static async updateUserRole(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { accountType, premiumExpiresAt } = req.body;

            if (!['FREE', 'PREMIUM'].includes(accountType)) {
                return res.status(400).json({ error: 'Invalid account type' });
            }

            const user = await prisma.user.update({
                where: { id },
                data: {
                    accountType,
                    premiumExpiresAt: accountType === 'PREMIUM'
                        ? (premiumExpiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) // 1 year default
                        : null
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    accountType: true,
                    premiumExpiresAt: true
                }
            });

            res.json({
                message: 'User role updated successfully',
                user
            });
        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({ error: 'Failed to update user role' });
        }
    }

    // Grant/revoke admin privileges
    static async updateAdminStatus(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { isAdmin } = req.body;

            if (typeof isAdmin !== 'boolean') {
                return res.status(400).json({ error: 'isAdmin must be a boolean' });
            }

            // Prevent removing admin from self
            if (req.userId === id && !isAdmin) {
                return res.status(400).json({
                    error: 'Cannot remove admin privileges from yourself'
                });
            }

            const user = await prisma.user.update({
                where: { id },
                data: { isAdmin },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    isAdmin: true
                }
            });

            res.json({
                message: `Admin privileges ${isAdmin ? 'granted' : 'revoked'} successfully`,
                user
            });
        } catch (error) {
            console.error('Update admin status error:', error);
            res.status(500).json({ error: 'Failed to update admin status' });
        }
    }

    // Delete user
    static async deleteUser(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            // Prevent deleting self
            if (req.userId === id) {
                return res.status(400).json({
                    error: 'Cannot delete your own account'
                });
            }

            await prisma.user.delete({
                where: { id }
            });

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }

    // Get system statistics
    static async getStats(req: AuthRequest, res: Response) {
        try {
            const [
                totalUsers,
                premiumUsers,
                freeUsers,
                adminUsers,
                totalGames,
                totalQuestionSets,
                activeUsers
            ] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { accountType: 'PREMIUM' } }),
                prisma.user.count({ where: { accountType: 'FREE' } }),
                prisma.user.count({ where: { isAdmin: true } }),
                prisma.game.count(),
                prisma.questionSet.count(),
                prisma.user.count({
                    where: {
                        lastSeen: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                        }
                    }
                })
            ]);

            res.json({
                users: {
                    total: totalUsers,
                    premium: premiumUsers,
                    free: freeUsers,
                    admin: adminUsers,
                    active24h: activeUsers
                },
                games: {
                    total: totalGames
                },
                questionSets: {
                    total: totalQuestionSets
                }
            });
        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({ error: 'Failed to fetch statistics' });
        }
    }
}

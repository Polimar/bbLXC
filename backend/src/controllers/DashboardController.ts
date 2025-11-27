import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
    userId?: string;
}

export class DashboardController {
    // FREE user dashboard
    static async getFreeDashboard(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;

            // Get user's game participations
            const gamePlayers = await prisma.gamePlayer.findMany({
                where: { userId },
                include: {
                    game: {
                        include: {
                            questionSet: {
                                select: { name: true, category: true, difficulty: true }
                            },
                            players: {
                                include: {
                                    user: {
                                        select: { username: true }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { joinedAt: 'desc' },
                take: 50
            });

            // Calculate personal stats
            const finishedGames = gamePlayers.filter(gp => gp.game.status === 'FINISHED');
            const gamesPlayed = finishedGames.length;

            let wins = 0;
            let totalScore = 0;
            let bestScore = 0;

            finishedGames.forEach(gp => {
                totalScore += gp.score;
                if (gp.score > bestScore) bestScore = gp.score;

                // Check if this player won (highest score)
                const allPlayers = gp.game.players;
                const maxScore = Math.max(...allPlayers.map(p => p.score));
                if (gp.score === maxScore && gp.score > 0) wins++;
            });

            const averageScore = gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0;
            const losses = gamesPlayed - wins;

            // Recent games (last 5)
            const recentGames = gamePlayers.slice(0, 5).map(gp => ({
                id: gp.game.id,
                code: gp.game.code,
                status: gp.game.status,
                questionSet: gp.game.questionSet.name,
                category: gp.game.questionSet.category,
                difficulty: gp.game.questionSet.difficulty,
                playerCount: gp.game.players.length,
                myScore: gp.score,
                createdAt: gp.game.createdAt
            }));

            // Active public games (waiting or in progress)
            const activeGames = await prisma.game.findMany({
                where: {
                    status: { in: ['WAITING', 'IN_PROGRESS'] },
                    isPrivate: false
                },
                include: {
                    questionSet: {
                        select: { name: true, category: true, difficulty: true }
                    },
                    players: {
                        include: {
                            user: {
                                select: { username: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            });

            const formattedActiveGames = activeGames.map(game => ({
                id: game.id,
                code: game.code,
                status: game.status,
                questionSet: game.questionSet.name,
                category: game.questionSet.category,
                difficulty: game.questionSet.difficulty,
                currentPlayers: game.players.length,
                maxPlayers: game.maxPlayers,
                players: game.players.map(p => p.user.username),
                createdAt: game.createdAt
            }));

            res.json({
                personalStats: {
                    gamesPlayed,
                    wins,
                    losses,
                    averageScore,
                    bestScore,
                    currentStreak: 0 // TODO: Implement streak tracking
                },
                recentGames,
                activeGames: formattedActiveGames
            });
        } catch (error) {
            console.error('Free dashboard error:', error);
            res.status(500).json({ error: 'Failed to load dashboard' });
        }
    }

    // PREMIUM user dashboard
    static async getPremiumDashboard(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;

            // Get all FREE dashboard data first
            const freeData = await DashboardController.getFreeDashboardData(userId);

            // Get user's custom question sets
            const myQuestionSets = await prisma.questionSet.findMany({
                where: { ownerId: userId },
                include: {
                    _count: {
                        select: { questions: true, games: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Get custom games created by user
            const myCustomGames = await prisma.game.findMany({
                where: {
                    players: {
                        some: {
                            userId,
                            isLeader: true
                        }
                    },
                    questionSet: {
                        ownerId: userId
                    }
                },
                include: {
                    questionSet: {
                        select: { name: true, category: true }
                    },
                    players: {
                        include: {
                            user: {
                                select: { username: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            });

            // Performance by category
            const gamePlayers = await prisma.gamePlayer.findMany({
                where: {
                    userId,
                    game: { status: 'FINISHED' }
                },
                include: {
                    game: {
                        include: {
                            questionSet: {
                                select: { category: true }
                            }
                        }
                    }
                }
            });

            const categoryPerformance = new Map<string, { total: number, count: number }>();
            gamePlayers.forEach(gp => {
                const category = gp.game.questionSet.category;
                const current = categoryPerformance.get(category) || { total: 0, count: 0 };
                current.total += gp.score;
                current.count += 1;
                categoryPerformance.set(category, current);
            });

            const performanceByCategory = Array.from(categoryPerformance.entries()).map(([category, data]) => ({
                category,
                avgScore: Math.round(data.total / data.count)
            }));

            // Score trend (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentGames = await prisma.gamePlayer.findMany({
                where: {
                    userId,
                    game: {
                        status: 'FINISHED',
                        createdAt: { gte: thirtyDaysAgo }
                    }
                },
                include: {
                    game: {
                        select: { createdAt: true }
                    }
                },
                orderBy: { game: { createdAt: 'asc' } }
            });

            const scoreTrend = recentGames.map(gp => ({
                date: gp.game.createdAt.toISOString().split('T')[0],
                score: gp.score
            }));

            res.json({
                ...freeData,
                advancedStats: {
                    performanceByCategory,
                    accuracyPercentage: 0, // TODO: Track correct answers
                    avgResponseTime: 0, // TODO: Track response times
                    streakHistory: []
                },
                myQuestionSets: myQuestionSets.map(qs => ({
                    id: qs.id,
                    name: qs.name,
                    category: qs.category,
                    difficulty: qs.difficulty,
                    questionCount: qs._count.questions,
                    gamesPlayed: qs._count.games,
                    createdAt: qs.createdAt
                })),
                myCustomGames: myCustomGames.map(game => ({
                    id: game.id,
                    code: game.code,
                    status: game.status,
                    questionSet: game.questionSet.name,
                    category: game.questionSet.category,
                    playerCount: game.players.length,
                    createdAt: game.createdAt
                })),
                performanceCharts: {
                    scoreTrend,
                    categoryPerformance: performanceByCategory
                }
            });
        } catch (error) {
            console.error('Premium dashboard error:', error);
            res.status(500).json({ error: 'Failed to load dashboard' });
        }
    }

    // ADMIN dashboard
    static async getAdminDashboard(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;

            // Get PREMIUM dashboard data
            const premiumData = await DashboardController.getPremiumDashboardData(userId);

            // System overview
            const totalUsers = await prisma.user.count();
            const freeUsers = await prisma.user.count({ where: { accountType: 'FREE' } });
            const premiumUsers = await prisma.user.count({ where: { accountType: 'PREMIUM' } });
            const adminUsers = await prisma.user.count({ where: { isAdmin: true } });

            const waitingGames = await prisma.game.count({ where: { status: 'WAITING' } });
            const inProgressGames = await prisma.game.count({ where: { status: 'IN_PROGRESS' } });
            const finishedGames = await prisma.game.count({ where: { status: 'FINISHED' } });

            const systemQuestionSets = await prisma.questionSet.count({ where: { ownerId: null } });
            const customQuestionSets = await prisma.questionSet.count({ where: { ownerId: { not: null } } });

            // Recent registrations
            const recentRegistrations = await prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    accountType: true,
                    isAdmin: true,
                    createdAt: true
                }
            });

            // Live games
            const liveGames = await prisma.game.findMany({
                where: {
                    status: { in: ['WAITING', 'IN_PROGRESS'] }
                },
                include: {
                    questionSet: {
                        select: { name: true, category: true }
                    },
                    players: {
                        include: {
                            user: {
                                select: { username: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 20
            });

            // Games per day (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const gamesPerDay = await prisma.game.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: { gte: thirtyDaysAgo }
                },
                _count: true
            });

            // User growth (last 30 days)
            const userGrowth = await prisma.user.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: { gte: thirtyDaysAgo }
                },
                _count: true
            });

            // Popular categories
            const popularCategories = await prisma.game.groupBy({
                by: ['questionSetId'],
                _count: true,
                orderBy: {
                    _count: {
                        questionSetId: 'desc'
                    }
                },
                take: 10
            });

            const categoriesWithNames = await Promise.all(
                popularCategories.map(async (cat) => {
                    const qs = await prisma.questionSet.findUnique({
                        where: { id: cat.questionSetId },
                        select: { category: true }
                    });
                    return {
                        category: qs?.category || 'Unknown',
                        count: cat._count
                    };
                })
            );

            res.json({
                ...premiumData,
                systemOverview: {
                    totalUsers: {
                        free: freeUsers,
                        premium: premiumUsers,
                        admin: adminUsers
                    },
                    activeUsers: 0, // TODO: Track via WebSocket
                    totalGames: {
                        waiting: waitingGames,
                        inProgress: inProgressGames,
                        finished: finishedGames
                    },
                    totalQuestionSets: {
                        system: systemQuestionSets,
                        custom: customQuestionSets
                    }
                },
                realtimeActivity: {
                    liveGames: liveGames.map(game => ({
                        id: game.id,
                        code: game.code,
                        status: game.status,
                        questionSet: game.questionSet.name,
                        category: game.questionSet.category,
                        playerCount: game.players.length,
                        maxPlayers: game.maxPlayers,
                        createdAt: game.createdAt
                    })),
                    recentRegistrations,
                    activeConnections: 0 // TODO: Track via WebSocket
                },
                platformAnalytics: {
                    gamesPerDay: gamesPerDay.map(g => ({
                        date: g.createdAt.toISOString().split('T')[0],
                        count: g._count
                    })),
                    userGrowth: userGrowth.map(u => ({
                        date: u.createdAt.toISOString().split('T')[0],
                        count: u._count
                    })),
                    popularCategories: categoriesWithNames
                }
            });
        } catch (error) {
            console.error('Admin dashboard error:', error);
            res.status(500).json({ error: 'Failed to load dashboard' });
        }
    }

    // Helper method to get FREE dashboard data
    private static async getFreeDashboardData(userId: string) {
        const gamePlayers = await prisma.gamePlayer.findMany({
            where: { userId },
            include: {
                game: {
                    include: {
                        questionSet: {
                            select: { name: true, category: true, difficulty: true }
                        },
                        players: {
                            include: {
                                user: {
                                    select: { username: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { joinedAt: 'desc' },
            take: 50
        });

        const finishedGames = gamePlayers.filter(gp => gp.game.status === 'FINISHED');
        const gamesPlayed = finishedGames.length;

        let wins = 0;
        let totalScore = 0;
        let bestScore = 0;

        finishedGames.forEach(gp => {
            totalScore += gp.score;
            if (gp.score > bestScore) bestScore = gp.score;

            const allPlayers = gp.game.players;
            const maxScore = Math.max(...allPlayers.map(p => p.score));
            if (gp.score === maxScore && gp.score > 0) wins++;
        });

        const averageScore = gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0;
        const losses = gamesPlayed - wins;

        const recentGames = gamePlayers.slice(0, 5).map(gp => ({
            id: gp.game.id,
            code: gp.game.code,
            status: gp.game.status,
            questionSet: gp.game.questionSet.name,
            category: gp.game.questionSet.category,
            difficulty: gp.game.questionSet.difficulty,
            playerCount: gp.game.players.length,
            myScore: gp.score,
            createdAt: gp.game.createdAt
        }));

        const activeGames = await prisma.game.findMany({
            where: {
                status: { in: ['WAITING', 'IN_PROGRESS'] },
                isPrivate: false
            },
            include: {
                questionSet: {
                    select: { name: true, category: true, difficulty: true }
                },
                players: {
                    include: {
                        user: {
                            select: { username: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return {
            personalStats: {
                gamesPlayed,
                wins,
                losses,
                averageScore,
                bestScore,
                currentStreak: 0
            },
            recentGames,
            activeGames: activeGames.map(game => ({
                id: game.id,
                code: game.code,
                status: game.status,
                questionSet: game.questionSet.name,
                category: game.questionSet.category,
                difficulty: game.questionSet.difficulty,
                currentPlayers: game.players.length,
                maxPlayers: game.maxPlayers,
                players: game.players.map(p => p.user.username),
                createdAt: game.createdAt
            }))
        };
    }

    // Helper method to get PREMIUM dashboard data
    private static async getPremiumDashboardData(userId: string) {
        const freeData = await DashboardController.getFreeDashboardData(userId);

        const myQuestionSets = await prisma.questionSet.findMany({
            where: { ownerId: userId },
            include: {
                _count: {
                    select: { questions: true, games: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const myCustomGames = await prisma.game.findMany({
            where: {
                players: {
                    some: {
                        userId,
                        isLeader: true
                    }
                },
                questionSet: {
                    ownerId: userId
                }
            },
            include: {
                questionSet: {
                    select: { name: true, category: true }
                },
                players: {
                    include: {
                        user: {
                            select: { username: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        const gamePlayers = await prisma.gamePlayer.findMany({
            where: {
                userId,
                game: { status: 'FINISHED' }
            },
            include: {
                game: {
                    include: {
                        questionSet: {
                            select: { category: true }
                        }
                    }
                }
            }
        });

        const categoryPerformance = new Map<string, { total: number, count: number }>();
        gamePlayers.forEach(gp => {
            const category = gp.game.questionSet.category;
            const current = categoryPerformance.get(category) || { total: 0, count: 0 };
            current.total += gp.score;
            current.count += 1;
            categoryPerformance.set(category, current);
        });

        const performanceByCategory = Array.from(categoryPerformance.entries()).map(([category, data]) => ({
            category,
            avgScore: Math.round(data.total / data.count)
        }));

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentGames = await prisma.gamePlayer.findMany({
            where: {
                userId,
                game: {
                    status: 'FINISHED',
                    createdAt: { gte: thirtyDaysAgo }
                }
            },
            include: {
                game: {
                    select: { createdAt: true }
                }
            },
            orderBy: { game: { createdAt: 'asc' } }
        });

        const scoreTrend = recentGames.map(gp => ({
            date: gp.game.createdAt.toISOString().split('T')[0],
            score: gp.score
        }));

        return {
            ...freeData,
            advancedStats: {
                performanceByCategory,
                accuracyPercentage: 0,
                avgResponseTime: 0,
                streakHistory: []
            },
            myQuestionSets: myQuestionSets.map(qs => ({
                id: qs.id,
                name: qs.name,
                category: qs.category,
                difficulty: qs.difficulty,
                questionCount: qs._count.questions,
                gamesPlayed: qs._count.games,
                createdAt: qs.createdAt
            })),
            myCustomGames: myCustomGames.map(game => ({
                id: game.id,
                code: game.code,
                status: game.status,
                questionSet: game.questionSet.name,
                category: game.questionSet.category,
                playerCount: game.players.length,
                maxPlayers: game.maxPlayers,
                timePerQuestion: game.timePerQuestion,
                rounds: game.totalRounds,
                players: game.players.map(p => ({
                    username: p.user.username,
                    score: p.score
                })),
                createdAt: game.createdAt
            })),
            performanceCharts: {
                scoreTrend,
                categoryPerformance: performanceByCategory
            }
        };
    }
}

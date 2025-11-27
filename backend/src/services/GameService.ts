import { GameState, Player, Question } from '../types/game';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { Server } from 'socket.io';

class GameService {
    private games: Map<string, GameState> = new Map();
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private io: Server | null = null;

    setIO(io: Server) {
        this.io = io;
    }

    async createGame(hostId: string, hostName: string, questionSetId?: string): Promise<GameState> {
        const gameId = uuidv4();
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        // If no questionSetId, find a default one or system one
        let targetQuestionSetId = questionSetId;
        if (!targetQuestionSetId) {
            const defaultSet = await prisma.questionSet.findFirst({
                where: { ownerId: null } // System set
            });
            targetQuestionSetId = defaultSet?.id;
        }

        if (!targetQuestionSetId) {
            throw new Error('No question set available');
        }

        // Create in DB
        const game = await prisma.game.create({
            data: {
                id: gameId,
                code,
                questionSetId: targetQuestionSetId,
                status: 'WAITING',
                players: {
                    create: {
                        userId: hostId,
                        isLeader: true
                    }
                }
            },
            include: {
                questionSet: { include: { questions: true } },
                players: { include: { user: true } }
            }
        });

        const newGame: GameState = {
            id: game.id,
            code: game.code,
            hostId,
            players: [{
                id: hostId,
                username: hostName,
                score: 0,
                isConnected: true
            }],
            status: 'WAITING',
            currentQuestionIndex: 0,
            timeRemaining: 0,
            totalQuestions: game.questionSet.questions.length
        };

        // Load questions
        const questions = game.questionSet.questions.map(q => {
            // Transform options from string array to object array
            const optionsArray = Array.isArray(q.options) ? q.options : [];
            const formattedOptions = optionsArray.map((opt: any, index: number) => ({
                id: String(index),
                text: typeof opt === 'string' ? opt : opt.text || 'Opzione non disponibile'
            }));

            return {
                id: q.id,
                text: q.text,
                options: formattedOptions,
                correctAnswer: q.correctAnswer,
                timeLimit: q.timeLimit,
                points: q.points
            };
        });
        (newGame as any).questions = questions;

        this.games.set(code, newGame);
        return newGame;
    }

    async loadGameFromDB(code: string): Promise<GameState | null> {
        try {
            const game = await prisma.game.findUnique({
                where: { code },
                include: {
                    players: { include: { user: true } },
                    questionSet: { include: { questions: true } }
                }
            });

            if (!game) return null;

            // Map to GameState
            const gameState: GameState = {
                id: game.id,
                code: game.code,
                hostId: game.players.find(p => p.isLeader)?.userId || '',
                players: game.players.map(p => ({
                    id: p.userId,
                    username: p.user.username,
                    score: p.score,
                    isConnected: false
                })),
                status: game.status as 'WAITING' | 'IN_PROGRESS' | 'FINISHED',
                currentQuestionIndex: game.currentRound,
                timeRemaining: 0
            };

            // Load questions respecting custom settings
            let questions = game.questionSet.questions.map(q => {
                // Transform options from string array to object array
                const optionsArray = Array.isArray(q.options) ? q.options : [];
                const formattedOptions = optionsArray.map((opt: any, index: number) => ({
                    id: String(index),
                    text: typeof opt === 'string' ? opt : opt.text || 'Opzione non disponibile'
                }));

                return {
                    id: q.id,
                    text: q.text,
                    options: formattedOptions,
                    correctAnswer: q.correctAnswer,
                    timeLimit: game.timePerQuestion || q.timeLimit,
                    points: q.points
                };
            });

            // Limit rounds if specified
            if (game.totalRounds && game.totalRounds > 0) {
                questions = questions.slice(0, game.totalRounds);
            }

            (gameState as any).questions = questions;
            gameState.totalQuestions = questions.length;

            // If in progress, set current question
            if (gameState.status === 'IN_PROGRESS') {
                gameState.currentQuestion = questions[gameState.currentQuestionIndex];
            }

            this.games.set(code, gameState);
            return gameState;
        } catch (error) {
            console.error('Error loading game from DB:', error);
            return null;
        }
    }

    async joinGame(code: string, playerId: string, username: string): Promise<GameState | null> {
        let game = this.games.get(code);

        if (!game) {
            game = await this.loadGameFromDB(code) || undefined;
        }

        if (!game) return null;

        // If game is finished, reset it to WAITING for a new round
        if (game.status === 'FINISHED') {
            game.status = 'WAITING';
            game.currentQuestionIndex = 0;
            game.timeRemaining = 0;
            delete game.currentQuestion;

            // Reset all player scores
            game.players.forEach(p => p.score = 0);

            // Update DB
            await prisma.game.update({
                where: { id: game.id },
                data: { status: 'WAITING' }
            });

            // Update player scores in DB
            await Promise.all(game.players.map(p =>
                prisma.gamePlayer.updateMany({
                    where: { gameId: game.id, userId: p.id },
                    data: { score: 0 }
                })
            ));
        }

        if (game.status !== 'WAITING' && game.status !== 'IN_PROGRESS') return null;

        const existingPlayer = game.players.find(p => p.id === playerId);
        if (existingPlayer) {
            existingPlayer.isConnected = true;
            return game;
        }

        if (game.status !== 'WAITING') return null; // New players can only join if WAITING

        // Add to DB
        try {
            await prisma.gamePlayer.create({
                data: {
                    gameId: game.id,
                    userId: playerId
                }
            });
        } catch (e) {
            console.log('Player already in DB or error:', e);
        }

        game.players.push({
            id: playerId,
            username,
            score: 0,
            isConnected: true
        });

        return game;
    }

    async getGame(code: string): Promise<GameState | undefined> {
        if (this.games.has(code)) {
            return this.games.get(code);
        }
        const game = await this.loadGameFromDB(code);
        return game || undefined;
    }

    async startGame(code: string): Promise<GameState | null> {
        let game = this.games.get(code);
        if (!game) {
            game = await this.loadGameFromDB(code) || undefined;
        }
        if (!game) return null;

        game.status = 'IN_PROGRESS';

        // Randomize questions using Fisher-Yates shuffle
        const questions = (game as any).questions as Question[];
        if (questions && questions.length > 0) {
            const shuffled = [...questions];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            (game as any).questions = shuffled;
        }

        // Update DB
        await prisma.game.update({
            where: { code },
            data: {
                status: 'IN_PROGRESS',
                startedAt: new Date()
            }
        });

        game.currentQuestionIndex = 0;
        const firstQuestion = (game as any).questions[0];
        game.currentQuestion = firstQuestion;
        game.timeRemaining = firstQuestion.timeLimit;

        // Initialize answered players tracking
        (game as any).answeredPlayers = new Set<string>();

        // Start the timer
        this.startTimer(code);

        return game;
    }

    private startTimer(code: string) {
        const game = this.games.get(code);
        if (!game || !game.currentQuestion) return;

        // Clear existing timer
        if (this.timers.has(code)) {
            clearInterval(this.timers.get(code)!);
        }

        game.timeRemaining = game.currentQuestion.timeLimit;

        const timer = setInterval(() => {
            game.timeRemaining--;

            if (game.timeRemaining <= 0) {
                clearInterval(timer);
                this.timers.delete(code);
                this.handleTimeout(code);
            }
        }, 1000);

        this.timers.set(code, timer);
    }

    private async handleTimeout(code: string) {
        const game = this.games.get(code);
        if (!game) return;

        // Apply penalty to players who didn't answer
        const answeredPlayers = (game as any).answeredPlayers as Set<string> || new Set();

        game.players.forEach(player => {
            if (!answeredPlayers.has(player.id)) {
                // Player didn't answer, apply penalty
                player.score -= 25;

                // Update DB score
                prisma.gamePlayer.updateMany({
                    where: { gameId: game.id, userId: player.id },
                    data: { score: player.score }
                }).catch(e => console.error('Failed to update penalty score in DB:', e));
            }
        });

        if (this.io) {
            this.io.to(code).emit('time_expired');

            // Notify score updates
            this.io.to(code).emit('players_updated', game.players);

            // Wait a moment then auto-advance
            setTimeout(async () => {
                const nextGame = this.nextQuestion(code);
                if (nextGame) {
                    if (nextGame.status === 'FINISHED') {
                        this.io?.to(code).emit('game_over', nextGame);
                    } else {
                        this.io?.to(code).emit('next_question', nextGame);
                    }
                }
            }, 3000);
        }
    }

    submitAnswer(
        code: string,
        playerId: string,
        answerId: string,
        timeUsed: number
    ): {
        correct: boolean,
        score: number,
        newTotalScore: number,
        allAnswered: boolean,
        breakdown: {
            basePoints: number;
            timeBonus: number;
            penalty: number;
        }
    } | null {
        const game = this.games.get(code);
        if (!game || !game.currentQuestion) return null;

        if (!(game as any).answeredPlayers) {
            (game as any).answeredPlayers = new Set();
        }

        const answeredPlayers = (game as any).answeredPlayers as Set<string>;
        if (answeredPlayers.has(playerId)) return null;

        answeredPlayers.add(playerId);

        const isCorrect = answerId === game.currentQuestion.correctAnswer;
        const timeLimit = game.currentQuestion.timeLimit;

        let points = 0;
        let basePoints = 0;
        let timeBonus = 0;
        let penalty = 0;

        if (isCorrect) {
            basePoints = game.currentQuestion.points;
            const timePercentage = (timeUsed / timeLimit) * 100;
            let bonusPercentage = 0;

            if (timePercentage < 10) bonusPercentage = 50;
            else if (timePercentage < 25) bonusPercentage = 40;
            else if (timePercentage < 40) bonusPercentage = 30;
            else if (timePercentage < 60) bonusPercentage = 20;
            else if (timePercentage < 80) bonusPercentage = 10;

            timeBonus = Math.round((basePoints * bonusPercentage) / 100);
            points = basePoints + timeBonus;
        } else {
            penalty = 25;
            points = -penalty;
        }

        const player = game.players.find(p => p.id === playerId);
        if (player) {
            player.score += points;

            // Update player score in DB
            prisma.gamePlayer.updateMany({
                where: {
                    gameId: game.id,
                    userId: playerId
                },
                data: {
                    score: player.score
                }
            }).catch(e => console.error('Failed to update score in DB:', e));

            // Check if all players have answered
            const allAnswered = answeredPlayers.size === game.players.length;

            // If all answered, reveal the correct answer before advancing
            if (allAnswered && this.io) {
                this.io.to(code).emit('correct_answer_reveal', {
                    correctAnswerId: game.currentQuestion.correctAnswer,
                    correctAnswerText: game.currentQuestion.options.find(
                        (opt: any) => opt.id === game.currentQuestion!.correctAnswer
                    )?.text || 'Unknown'
                });
            }

            return {
                correct: isCorrect,
                score: points,
                newTotalScore: player.score,
                allAnswered,
                breakdown: {
                    basePoints,
                    timeBonus,
                    penalty
                }
            };
        }
        return null;
    }

    nextQuestion(code: string): GameState | null {
        const game = this.games.get(code);
        if (!game) return null;

        // Clear timer if manually advanced
        if (this.timers.has(code)) {
            clearInterval(this.timers.get(code)!);
            this.timers.delete(code);
        }

        const questions = (game as any).questions as Question[];
        if (!questions) return null;

        (game as any).answeredPlayers = new Set();

        const nextIndex = game.currentQuestionIndex + 1;

        if (nextIndex < questions.length) {
            game.currentQuestionIndex = nextIndex;
            game.currentQuestion = questions[nextIndex];

            // Update DB round
            prisma.game.update({
                where: { id: game.id },
                data: { currentRound: nextIndex }
            }).catch(e => console.error('Failed to update round in DB:', e));

            this.startTimer(code);
            return game;
        } else {
            game.status = 'FINISHED';
            game.currentQuestion = undefined;

            // Update DB status
            prisma.game.update({
                where: { id: game.id },
                data: {
                    status: 'FINISHED',
                    endedAt: new Date()
                }
            }).catch(e => console.error('Failed to update game status in DB:', e));

            return game;
        }
    }

    removePlayer(code: string, playerId: string) {
        const game = this.games.get(code);
        if (game) {
            game.players = game.players.filter(p => p.id !== playerId);
            if (game.players.length === 0) {
                this.games.delete(code);
                if (this.timers.has(code)) {
                    clearInterval(this.timers.get(code)!);
                    this.timers.delete(code);
                }
            }
        }
    }
}

export const gameService = new GameService();

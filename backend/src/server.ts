import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { gameService } from './services/GameService';
import gameRoutes from './routes/game';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import premiumRoutes from './routes/premium';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/games', gameRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date() });
});


// Socket.io setup
io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', async ({ gameCode, playerId }: { gameCode: string, playerId: string }) => {
        socket.join(gameCode);
        console.log(`User ${playerId} joined room ${gameCode}`);

        // Notify others in the room
        const game = await gameService.getGame(gameCode);
        if (game) {
            io.to(gameCode).emit('player_joined', game.players);
        }
    });

    socket.on('start_game', async ({ gameCode }: { gameCode: string }) => {
        const game = await gameService.startGame(gameCode);
        if (game) {
            io.to(gameCode).emit('game_started', game);
        }
    });

    socket.on('submit_answer', async ({ gameCode, playerId, answerId, timeUsed }: {
        gameCode: string,
        playerId: string,
        answerId: string,
        timeUsed: number
    }) => {
        const result = gameService.submitAnswer(gameCode, playerId, answerId, timeUsed);
        if (result) {
            // Notify the player of their result with detailed breakdown
            socket.emit('answer_result', {
                correct: result.correct,
                score: result.score,
                newTotalScore: result.newTotalScore,
                breakdown: result.breakdown
            });

            // Notify everyone of score update
            const game = await gameService.getGame(gameCode);
            if (game) {
                io.to(gameCode).emit('players_updated', game.players);
            }

            // Check if all players have answered
            if (result.allAnswered) {
                // Add a small delay so players can see their result before moving on
                setTimeout(() => {
                    const nextGame = gameService.nextQuestion(gameCode);
                    if (nextGame) {
                        if (nextGame.status === 'FINISHED') {
                            io.to(gameCode).emit('game_over', nextGame);
                        } else {
                            io.to(gameCode).emit('next_question', nextGame);
                        }
                    }
                }, 2000); // 2 second delay
            }
        }
    });

    // Manual next question (e.g. from host)
    socket.on('next_question', ({ gameCode }: { gameCode: string }) => {
        const game = gameService.nextQuestion(gameCode);
        if (game) {
            if (game.status === 'FINISHED') {
                io.to(gameCode).emit('game_over', game);
            } else {
                io.to(gameCode).emit('next_question', game);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // TODO: Handle player disconnect (remove from game or mark offline)
    });
});

// Inject IO into GameService
gameService.setIO(io);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

import { useState, useEffect, useCallback } from 'react'
import { Box, Container, Typography, Stack, Chip, Snackbar, Alert, Button } from '@mui/material'
import io from 'socket.io-client'
import { motion } from 'framer-motion'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { Lobby } from './Lobby'
import { GameRoom } from './GameRoom'
import BoltIcon from '@mui/icons-material/Bolt';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const socket = io('/', {
    path: '/socket.io',
});

interface Player {
    id: string;
    username: string;
    score: number;
}

interface Question {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    timeLimit: number;
}

interface GameState {
    id: string;
    code: string;
    hostId: string;
    players: Player[];
    status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
    currentQuestion?: Question;
}

export const GameInterface = () => {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [playerId, setPlayerId] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [correctAnswerId, setCorrectAnswerId] = useState<string | null>(null);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        function onPlayerJoined(player: Player) {
            setGameState(prev => prev ? { ...prev, players: [...prev.players, player] } : null);
        }

        function onPlayersUpdated(players: Player[]) {
            setGameState(prev => prev ? { ...prev, players } : null);
        }

        function onGameStarted(game: GameState) {
            setGameState(game);
            setCorrectAnswerId(null);
            setShowCorrectAnswer(false);
        }

        function onNextQuestion(game: GameState) {
            setGameState(game);
            setCorrectAnswerId(null);
            setShowCorrectAnswer(false);
        }

        function onGameOver(game: GameState) {
            setGameState(game);
        }

        function onCorrectAnswerReveal(data: { correctAnswerId: string }) {
            setCorrectAnswerId(data.correctAnswerId);
            setShowCorrectAnswer(true);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('player_joined', onPlayerJoined);
        socket.on('players_updated', onPlayersUpdated);
        socket.on('game_started', onGameStarted);
        socket.on('next_question', onNextQuestion);
        socket.on('game_over', onGameOver);
        socket.on('correct_answer_reveal', onCorrectAnswerReveal);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('player_joined', onPlayerJoined);
            socket.off('players_updated', onPlayersUpdated);
            socket.off('game_started', onGameStarted);
            socket.off('next_question', onNextQuestion);
            socket.off('game_over', onGameOver);
            socket.off('correct_answer_reveal', onCorrectAnswerReveal);
        };
    }, []);

    const handleCreateGame = useCallback(async (username: string) => {
        try {
            // Use logged in user ID if available, otherwise fallback (though we should enforce login)
            const hostId = user?.id || Math.random().toString(36).substr(2, 9);
            setPlayerId(hostId);

            const res = await fetch('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hostId, hostName: username }),
            });

            if (!res.ok) throw new Error('Failed to create game');

            const game = await res.json();
            setGameState(game);
            socket.emit('join_room', { gameCode: game.code, playerId: hostId });
        } catch (err: any) {
            setError(err.message);
        }
    }, [user]);

    const handleJoinGame = useCallback(async (code: string, username: string) => {
        try {
            const tempId = user?.id || Math.random().toString(36).substr(2, 9);
            setPlayerId(tempId);

            const res = await fetch('/api/games/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, playerId: tempId, username }),
            });

            if (!res.ok) throw new Error('Failed to join game');

            const game = await res.json();
            setGameState(game);
            socket.emit('join_room', { gameCode: game.code, playerId: tempId });
        } catch (err: any) {
            setError(err.message);
        }
    }, [user]);

    const handleStartGame = useCallback(() => {
        if (gameState) {
            socket.emit('start_game', { gameCode: gameState.code });
        }
    }, [gameState]);

    const handleAnswer = useCallback((answerId: string) => {
        if (gameState) {
            socket.emit('submit_answer', { gameCode: gameState.code, playerId, answerId });
        }
    }, [gameState, playerId]);

    const handleTimeExpired = useCallback(() => {
        if (gameState) {
            socket.emit('time_expired', { gameCode: gameState.code });
        }
    }, [gameState]);

    const handlePlayAgain = useCallback(() => {
        setGameState(null);
        setPlayerId('');
    }, []);

    return (
        <>
            <AnimatedBackground />
            <Container maxWidth="md" sx={{ py: 4, position: 'relative', minHeight: '100vh' }}>
                <Box sx={{ textAlign: 'center', mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        <Typography variant="h3" gutterBottom sx={{
                            background: 'linear-gradient(135deg, #D946EF 0%, #8B5CF6 50%, #00D4FF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0px 0px 20px rgba(217, 70, 239, 0.5)',
                            fontWeight: 900,
                            letterSpacing: '-0.02em'
                        }}>
                            BrainBrawler
                        </Typography>

                        {(!gameState || gameState.status !== 'IN_PROGRESS') && (
                            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                                <Chip
                                    icon={<BoltIcon />}
                                    label={isConnected ? "Online" : "Offline"}
                                    color={isConnected ? "success" : "error"}
                                    variant="filled"
                                    size="small"
                                />
                                {user ? (
                                    <>
                                        <Chip label={`Hi, ${user.username}`} color="primary" variant="outlined" onDelete={logout} />
                                        {user.isAdmin && (
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() => navigate('/admin')}
                                            >
                                                Admin Panel
                                            </Button>
                                        )}
                                        {(user.accountType === 'PREMIUM' || user.isAdmin) && (
                                            <Button
                                                variant="contained"
                                                sx={{ bgcolor: '#FFD700', color: '#000' }}
                                                size="small"
                                                onClick={() => navigate('/premium')}
                                            >
                                                Premium Panel
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <Button variant="outlined" size="small" onClick={() => navigate('/login')}>Login</Button>
                                )}
                            </Stack>
                        )}
                    </motion.div>
                </Box>

                {!gameState ? (
                    <Lobby onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} initialUsername={user?.username || ''} />
                ) : (
                    <GameRoom
                        gameState={gameState}
                        isHost={gameState.hostId === playerId}
                        onStartGame={handleStartGame}
                        onAnswer={handleAnswer}
                        onTimeExpired={handleTimeExpired}
                        onPlayAgain={handlePlayAgain}
                        correctAnswerId={correctAnswerId || undefined}
                        showCorrectAnswer={showCorrectAnswer}
                    />
                )}

                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={() => setError('')}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    )
}

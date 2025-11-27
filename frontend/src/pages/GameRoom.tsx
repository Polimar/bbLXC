import { Box, Typography, Card, CardContent, Grid, Button, Chip, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { QuestionCard } from '../components/QuestionCard';
import { Results } from './Results';

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
    code: string;
    players: Player[];
    status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
    currentQuestion?: Question;
    currentQuestionIndex?: number;
    totalQuestions?: number;
}

interface GameRoomProps {
    gameState: GameState;
    isHost: boolean;
    onStartGame: () => void;
    onAnswer: (answerId: string) => void;
    onTimeExpired: () => void;
    onPlayAgain: () => void;
    correctAnswerId?: string;
    showCorrectAnswer?: boolean;
}

export const GameRoom = ({ gameState, isHost, onStartGame, onAnswer, onTimeExpired, onPlayAgain, correctAnswerId, showCorrectAnswer }: GameRoomProps) => {
    const { code, players, status, currentQuestion, currentQuestionIndex, totalQuestions } = gameState;

    if (status === 'FINISHED') {
        return <Results players={players} onPlayAgain={onPlayAgain} />;
    }

    if (status === 'IN_PROGRESS' && currentQuestion) {
        return (
            <QuestionCard
                question={currentQuestion}
                onAnswer={onAnswer}
                onTimeExpired={onTimeExpired}
                questionNumber={currentQuestionIndex !== undefined ? currentQuestionIndex + 1 : undefined}
                totalQuestions={totalQuestions}
                correctAnswerId={correctAnswerId}
                showCorrectAnswer={showCorrectAnswer}
            />
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <Card sx={{ mb: 4, background: 'rgba(139, 92, 246, 0.1)' }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            GAME CODE
                        </Typography>
                        <Typography variant="h2" sx={{ letterSpacing: 8, fontWeight: 900, color: '#D946EF' }}>
                            {code}
                        </Typography>
                    </CardContent>
                </Card>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                                    Players ({players?.length || 0})
                                </Typography>
                                <Grid container spacing={2}>
                                    {players?.map((player) => (
                                        <Grid item key={player.id}>
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <Chip
                                                    avatar={<Avatar>{player.username?.[0] || '?'}</Avatar>}
                                                    label={player.username || 'Unknown'}
                                                    variant="outlined"
                                                    sx={{ p: 1 }}
                                                />
                                            </motion.div>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                {isHost ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        fullWidth
                                        onClick={onStartGame}
                                        sx={{ py: 2, fontSize: '1.2rem' }}
                                    >
                                        Start Game
                                    </Button>
                                ) : (
                                    <Typography variant="body1" align="center" color="text.secondary">
                                        Waiting for host to start...
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    );
};

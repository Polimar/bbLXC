import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, Stack, Alert, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface LobbyProps {
    onCreateGame: (username: string) => void;
    onJoinGame: (code: string, username: string) => void;
    initialUsername?: string;
}

export const Lobby = ({ onCreateGame, onJoinGame, initialUsername = '' }: LobbyProps) => {
    const [username, setUsername] = useState(initialUsername);
    const [gameCode, setGameCode] = useState('');
    const { user, isPremium } = useAuth();

    useEffect(() => {
        if (initialUsername) {
            setUsername(initialUsername);
        }
    }, [initialUsername]);

    const handleCreateGame = () => {
        if (!isPremium) {
            alert('Creating games is a premium feature. Please upgrade to premium or ask an admin to grant you premium access.');
            return;
        }
        onCreateGame(username);
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 800 }}>
                            Enter the Arena
                        </Typography>

                        {user && user.accountType === 'FREE' && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                You have a FREE account. Upgrade to PREMIUM to create games and custom question sets!
                            </Alert>
                        )}

                        <Stack spacing={3}>
                            <TextField
                                label="Username"
                                variant="outlined"
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            <Box sx={{ position: 'relative', my: 2 }}>
                                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', width: '100%' }} />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        position: 'absolute',
                                        top: -10,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        bgcolor: 'background.paper',
                                        px: 1
                                    }}
                                >
                                    OR
                                </Typography>
                            </Box>

                            <Tooltip
                                title={!isPremium ? "Premium feature - Upgrade to create games" : ""}
                                arrow
                            >
                                <span>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        fullWidth
                                        disabled={!username}
                                        onClick={handleCreateGame}
                                        sx={{
                                            opacity: !isPremium ? 0.6 : 1
                                        }}
                                    >
                                        Create New Game {!isPremium && '🔒'}
                                    </Button>
                                </span>
                            </Tooltip>

                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="Game Code"
                                    variant="outlined"
                                    value={gameCode}
                                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                                    sx={{ flex: 1 }}
                                />
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    disabled={!username || !gameCode}
                                    onClick={() => onJoinGame(gameCode, username)}
                                >
                                    Join
                                </Button>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </motion.div>
        </Box>
    );
};

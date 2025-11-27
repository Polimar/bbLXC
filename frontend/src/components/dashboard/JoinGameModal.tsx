import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface JoinGameModalProps {
    open: boolean;
    onClose: () => void;
    token: string;
}

export const JoinGameModal: React.FC<JoinGameModalProps> = ({ open, onClose, token }) => {
    const [gameCode, setGameCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleJoin = async () => {
        if (!gameCode.trim()) {
            setError('Please enter a game code');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/game/join/${gameCode}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to join game');
            }

            // Navigate to game page
            navigate(`/game/${gameCode}`);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setGameCode('');
        setError(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    background: 'rgba(26, 26, 46, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    minWidth: 400
                }
            }}
        >
            <DialogTitle>Join Game</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                        Enter the game code to join an active game
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Game Code"
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                        disabled={loading}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            },
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                        }}
                    />
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleJoin}
                    variant="contained"
                    disabled={loading}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        }
                    }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Join Game'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

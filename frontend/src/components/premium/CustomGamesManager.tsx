import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Chip,
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
    Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface CustomGame {
    id: string;
    code: string;
    status: string;
    questionSet: string;
    category: string;
    playerCount: number;
    maxPlayers: number;
    timePerQuestion: number;
    rounds: number;
    players: { username: string, score: number }[];
    createdAt: string;
}

interface CustomGamesManagerProps {
    games: CustomGame[];
    onUpdate: () => void;
}

export const CustomGamesManager: React.FC<CustomGamesManagerProps> = ({ games, onUpdate }) => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [editGame, setEditGame] = useState<CustomGame | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Edit form state
    const [editForm, setEditForm] = useState({
        maxPlayers: 8,
        totalRounds: 10,
        timePerQuestion: 30
    });

    const handleOpenEdit = (game: CustomGame) => {
        setEditGame(game);
        setEditForm({
            maxPlayers: game.maxPlayers,
            totalRounds: game.rounds,
            timePerQuestion: game.timePerQuestion
        });
    };

    const handleUpdateGame = async () => {
        if (!editGame) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/premium/games/${editGame.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update game');
            }

            setEditGame(null);
            onUpdate();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGame = async () => {
        if (!deleteId) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/premium/games/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete game');
            }

            setDeleteId(null);
            onUpdate();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStartGame = async (gameId: string, code: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/premium/games/${gameId}/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to start game');
            }

            // Navigate to game room
            navigate(`/game/${code}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <Card sx={{
            height: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white'
        }}>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsEsportsIcon color="primary" />
                    My Custom Games
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {games.length === 0 ? (
                    <Typography color="text.secondary">You haven't created any custom games yet</Typography>
                ) : (
                    <List>
                        {games.map((game) => (
                            <ListItem
                                key={game.id}
                                sx={{
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 1,
                                    mb: 1,
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    '&:hover': {
                                        background: 'rgba(255, 255, 255, 0.05)'
                                    }
                                }}
                            >
                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {game.questionSet}
                                                </Typography>
                                                <Chip
                                                    label={game.status}
                                                    size="small"
                                                    color={game.status === 'WAITING' ? 'warning' : game.status === 'IN_PROGRESS' ? 'success' : 'default'}
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box component="span" sx={{ mt: 0.5, display: 'block' }}>
                                                <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                                                    Code: <span style={{ color: '#fff', fontFamily: 'monospace' }}>{game.code}</span>
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                                                    Players: {game.playerCount}/{game.maxPlayers} • Rounds: {game.rounds} • Time: {game.timePerQuestion}s
                                                </Typography>
                                            </Box>
                                        }
                                        secondaryTypographyProps={{ component: 'div' }}
                                    />
                                    <Box>
                                        {game.status === 'WAITING' && (
                                            <>
                                                <Tooltip title="Start Game">
                                                    <IconButton
                                                        color="success"
                                                        onClick={() => handleStartGame(game.id, game.code)}
                                                        disabled={loading}
                                                    >
                                                        <PlayArrowIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit Settings">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleOpenEdit(game)}
                                                        disabled={loading}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Game">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => setDeleteId(game.id)}
                                                        disabled={loading}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                        {game.status === 'IN_PROGRESS' && (
                                            <Button
                                                variant="outlined"
                                                color="success"
                                                size="small"
                                                onClick={() => navigate(`/game/${game.code}`)}
                                            >
                                                Rejoin
                                            </Button>
                                        )}
                                    </Box>
                                </Box>

                                {game.players && game.players.length > 0 && (
                                    <Box sx={{ mt: 1, width: '100%' }}>
                                        <Typography variant="caption" color="text.secondary">Joined Players:</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                            {game.players.map((p, i) => (
                                                <Chip key={i} label={p.username} size="small" variant="outlined" sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }} />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>

            {/* Edit Dialog */}
            <Dialog open={!!editGame} onClose={() => setEditGame(null)}>
                <DialogTitle>Edit Game Settings</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
                        <TextField
                            label="Max Players (2-10)"
                            type="number"
                            value={editForm.maxPlayers}
                            onChange={(e) => setEditForm({ ...editForm, maxPlayers: parseInt(e.target.value) })}
                            InputProps={{ inputProps: { min: 2, max: 10 } }}
                            fullWidth
                        />
                        <TextField
                            label="Total Rounds (10-50)"
                            type="number"
                            value={editForm.totalRounds}
                            onChange={(e) => setEditForm({ ...editForm, totalRounds: parseInt(e.target.value) })}
                            InputProps={{ inputProps: { min: 10, max: 50 } }}
                            fullWidth
                        />
                        <TextField
                            label="Time Per Question (10-60s)"
                            type="number"
                            value={editForm.timePerQuestion}
                            onChange={(e) => setEditForm({ ...editForm, timePerQuestion: parseInt(e.target.value) })}
                            InputProps={{ inputProps: { min: 10, max: 60 } }}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditGame(null)}>Cancel</Button>
                    <Button onClick={handleUpdateGame} variant="contained" disabled={loading}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
                <DialogTitle>Delete Game?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this game? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteId(null)}>Cancel</Button>
                    <Button onClick={handleDeleteGame} color="error" variant="contained" disabled={loading}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

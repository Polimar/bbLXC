import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Button,
    Chip,
    Box,
    CircularProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ActiveGame {
    id: string;
    code: string;
    status: string;
    questionSet: string;
    category: string;
    difficulty: string;
    currentPlayers: number;
    maxPlayers: number;
    players: string[];
}

interface ActiveGamesListProps {
    games: ActiveGame[];
}

export const ActiveGamesList: React.FC<ActiveGamesListProps> = ({ games }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [joining, setJoining] = useState<string | null>(null);

    const handleJoinGame = async (code: string) => {
        if (!user) {
            navigate('/login');
            return;
        }

        setJoining(code);
        try {
            const res = await fetch('/api/games/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    playerId: user.id,
                    username: user.username
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to join game');
            }

            // Navigate directly to game room
            navigate(`/game/${code}`);
        } catch (err) {
            console.error('Join game error:', err);
            alert('Failed to join game');
        } finally {
            setJoining(null);
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
                    <PlayArrowIcon color="secondary" />
                    Active Public Games
                </Typography>

                {games.length === 0 ? (
                    <Typography color="text.secondary">No active games at the moment</Typography>
                ) : (
                    <List>
                        {games.map((game) => (
                            <ListItem
                                key={game.id}
                                sx={{
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 1,
                                    mb: 1,
                                    '&:hover': {
                                        background: 'rgba(255, 255, 255, 0.05)'
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                {game.questionSet}
                                            </Typography>
                                            <Chip
                                                label={game.category}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    background: 'rgba(217, 70, 239, 0.2)',
                                                    color: '#d946ef'
                                                }}
                                            />
                                            <Chip
                                                label={game.difficulty}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    background: 'rgba(139, 92, 246, 0.2)',
                                                    color: '#8b5cf6'
                                                }}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                Code: <span style={{ color: '#fff', fontFamily: 'monospace' }}>{game.code}</span>
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <PeopleIcon fontSize="small" />
                                                {game.currentPlayers}/{game.maxPlayers} Players
                                            </Typography>
                                        </Box>
                                    }
                                    secondaryTypographyProps={{ component: 'div' }}
                                />
                                <ListItemSecondaryAction>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        size="small"
                                        onClick={() => handleJoinGame(game.code)}
                                        disabled={game.currentPlayers >= game.maxPlayers || joining === game.code}
                                    >
                                        {joining === game.code ? <CircularProgress size={20} /> : game.currentPlayers >= game.maxPlayers ? 'Full' : 'Join'}
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};

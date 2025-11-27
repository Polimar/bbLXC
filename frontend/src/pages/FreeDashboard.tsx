import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Container,
    Paper,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { StatCard } from '../components/dashboard/StatCard';
import { ActiveGamesList } from '../components/dashboard/ActiveGamesList';
import CasinoIcon from '@mui/icons-material/Casino';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';

interface DashboardData {
    personalStats: {
        gamesPlayed: number;
        wins: number;
        averageScore: number;
        bestScore: number;
        currentStreak: number;
    };
    recentGames: any[];
    activeGames: any[];
}

export const FreeDashboard: React.FC = () => {
    const { user, token } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/api/dashboard/free', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                const dashboardData = await res.json();
                setData(dashboardData);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#1a1a2e' }}>
                <CircularProgress color="secondary" />
            </Box>
        );
    }

    if (error || !data) {
        return (
            <Box sx={{ p: 3, bgcolor: '#1a1a2e', minHeight: '100vh', color: 'white' }}>
                <Alert severity="error">{error || 'No data available'}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a2e', position: 'relative', overflow: 'hidden' }}>
            <AnimatedBackground />

            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                            Dashboard
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Welcome back, {user?.username}! Ready to play?
                        </Typography>
                    </Box>
                    <Paper sx={{ p: 1, px: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 1 }}>
                            Free Account
                        </Typography>
                    </Paper>
                </Box>

                {/* Stats Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Games"
                            value={data.personalStats.gamesPlayed}
                            icon={<CasinoIcon />}
                            color="#3b82f6"
                            delay={0.1}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Wins"
                            value={data.personalStats.wins}
                            icon={<EmojiEventsIcon />}
                            color="#eab308"
                            delay={0.2}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Average Score"
                            value={Math.round(data.personalStats.averageScore)}
                            icon={<StarIcon />}
                            color="#ec4899"
                            delay={0.3}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Best Score"
                            value={data.personalStats.bestScore}
                            icon={<GroupIcon />}
                            color="#8b5cf6"
                            delay={0.4}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Active Public Games */}
                    <Grid item xs={12} md={8}>
                        <ActiveGamesList games={data.activeGames} />
                    </Grid>

                    {/* Recent Games */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{
                            height: '100%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white'
                        }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                                {data.recentGames.length === 0 ? (
                                    <Typography color="text.secondary">No recent games</Typography>
                                ) : (
                                    <List>
                                        {data.recentGames.map((game, index) => (
                                            <ListItem key={index} disableGutters sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <ListItemText
                                                    primary={game.questionSet}
                                                    secondary={
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(game.playedAt).toLocaleDateString()} • Score: {game.score}
                                                        </Typography>
                                                    }
                                                />
                                                <Chip
                                                    label={game.rank === 1 ? 'Winner' : `#${game.rank}`}
                                                    size="small"
                                                    color={game.rank === 1 ? 'warning' : 'default'}
                                                    variant="outlined"
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

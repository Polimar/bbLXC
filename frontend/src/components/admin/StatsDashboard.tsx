import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import QuizIcon from '@mui/icons-material/Quiz';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface Stats {
    users: {
        total: number;
        premium: number;
        free: number;
        admin: number;
        active24h: number;
    };
    games: {
        total: number;
    };
    questionSets: {
        total: number;
    };
}

export const StatsDashboard: React.FC = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error('Failed to load stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    if (loading) return <Typography>Loading statistics...</Typography>;
    if (!stats) return <Typography>Failed to load statistics</Typography>;

    const statCards = [
        {
            title: 'Total Users',
            value: stats.users.total,
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            color: '#D946EF',
            subtitle: `${stats.users.active24h} active in last 24h`
        },
        {
            title: 'Premium Users',
            value: stats.users.premium,
            icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
            color: '#FFD700',
            subtitle: `${stats.users.free} free users`
        },
        {
            title: 'Question Sets',
            value: stats.questionSets.total,
            icon: <QuizIcon sx={{ fontSize: 40 }} />,
            color: '#8B5CF6',
            subtitle: 'Total question sets'
        },
        {
            title: 'Games Played',
            value: stats.games.total,
            icon: <SportsEsportsIcon sx={{ fontSize: 40 }} />,
            color: '#6366F1',
            subtitle: 'All time'
        },
    ];

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>System Statistics</Typography>

            <Grid container spacing={3}>
                {statCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            sx={{
                                bgcolor: 'rgba(0,0,0,0.3)',
                                border: `1px solid ${card.color}40`,
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 8px 24px ${card.color}40`
                                }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {card.title}
                                        </Typography>
                                        <Typography variant="h3" sx={{ color: card.color, fontWeight: 'bold', my: 1 }}>
                                            {card.value}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {card.subtitle}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ color: card.color, opacity: 0.5 }}>
                                        {card.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Paper sx={{ mt: 4, p: 3, bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>User Distribution</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Admin Users</Typography>
                        <Typography variant="h5" sx={{ color: '#FF6943' }}>{stats.users.admin}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Premium Users</Typography>
                        <Typography variant="h5" sx={{ color: '#FFD700' }}>{stats.users.premium}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Free Users</Typography>
                        <Typography variant="h5" sx={{ color: '#6366F1' }}>{stats.users.free}</Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

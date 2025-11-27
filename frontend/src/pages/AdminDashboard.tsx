import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Grid, Typography, Paper, List, ListItem, ListItemText, Chip, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { StatCard } from '../components/dashboard/StatCard';
import { AnimatedBackground } from '../components/AnimatedBackground';
import PeopleIcon from '@mui/icons-material/People';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export const AdminDashboard: React.FC = () => {
    const { token } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/dashboard/admin', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to load');
        }).then(setData).catch(() => setError('Failed to load dashboard')).finally(() => setLoading(false));
    }, []);

    if (loading) return <Box sx={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AnimatedBackground /><Typography variant="h4">Loading...</Typography></Box>;
    if (error || !data) return <Box sx={{ position: 'relative', minHeight: '100vh', p: 4 }}><AnimatedBackground /><Alert severity="error">{error}</Alert></Box>;

    return (
        <Box sx={{ position: 'relative', minHeight: '100vh', p: 4 }}>
            <AnimatedBackground />
            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 1600, margin: '0 auto' }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #F44336, #9C27B0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
                        Admin Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">System monitoring and management</Typography>
                </Box>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Total Users" value={data.systemOverview.totalUsers.free + data.systemOverview.totalUsers.premium + data.systemOverview.totalUsers.admin} icon={<PeopleIcon />} color="#2196F3" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Premium Users" value={data.systemOverview.totalUsers.premium} icon={<AdminPanelSettingsIcon />} color="#FFD700" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Active Games" value={data.systemOverview.totalGames.waiting + data.systemOverview.totalGames.inProgress} icon={<SportsEsportsIcon />} color="#4CAF50" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Question Sets" value={data.systemOverview.totalQuestionSets.system + data.systemOverview.totalQuestionSets.custom} icon={<QuizIcon />} color="#9C27B0" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Waiting Games" value={data.systemOverview.totalGames.waiting} icon={<SportsEsportsIcon />} color="#FF9800" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="In Progress" value={data.systemOverview.totalGames.inProgress} icon={<SportsEsportsIcon />} color="#00BCD4" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Finished Games" value={data.systemOverview.totalGames.finished} icon={<TrendingUpIcon />} color="#607D8B" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Custom Sets" value={data.systemOverview.totalQuestionSets.custom} icon={<QuizIcon />} color="#E91E63" /></Grid>
                </Grid>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <Paper sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(244,67,54,0.3)' }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#F44336' }}>Live Games</Typography>
                                {data.realtimeActivity.liveGames.length === 0 ? (
                                    <Typography color="text.secondary">No active games</Typography>
                                ) : (
                                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                                        {data.realtimeActivity.liveGames.map((game: any) => (
                                            <ListItem key={game.id} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 1, borderRadius: 1 }}>
                                                <ListItemText
                                                    primary={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><Typography>{game.code}</Typography><Chip label={game.status} size="small" color={game.status === 'WAITING' ? 'warning' : 'success'} /><Chip label={game.category} size="small" /></Box>}
                                                    secondary={`${game.playerCount}/${game.maxPlayers} players • ${game.questionSet}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Paper>
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <Paper sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(156,39,176,0.3)' }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#9C27B0' }}>Recent Registrations</Typography>
                                {data.realtimeActivity.recentRegistrations.length === 0 ? (
                                    <Typography color="text.secondary">No recent registrations</Typography>
                                ) : (
                                    <List>
                                        {data.realtimeActivity.recentRegistrations.map((user: any) => (
                                            <ListItem key={user.id} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 1, borderRadius: 1 }}>
                                                <ListItemText
                                                    primary={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><Typography>{user.username}</Typography><Chip label={user.accountType} size="small" color={user.accountType === 'PREMIUM' ? 'warning' : 'default'} />{user.isAdmin && <Chip label="ADMIN" size="small" color="error" />}</Box>}
                                                    secondary={user.email}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Paper>
                        </motion.div>
                    </Grid>

                    <Grid item xs={12}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Paper sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(33,150,243,0.3)' }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#2196F3' }}>Popular Categories</Typography>
                                <Grid container spacing={2}>
                                    {data.platformAnalytics.popularCategories.map((cat: any, idx: number) => (
                                        <Grid item xs={12} sm={6} md={4} key={idx}>
                                            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                                                <Typography variant="h6" color="#FFD700">{cat.count}</Typography>
                                                <Typography variant="body2" color="text.secondary">{cat.category}</Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </motion.div>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

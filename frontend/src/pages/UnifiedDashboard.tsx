import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Container,
    Paper,
    Tabs,
    Tab,
    Button,
    Fab
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { StatCard } from '../components/dashboard/StatCard';
import { ActiveGamesList } from '../components/dashboard/ActiveGamesList';
import { FriendsManagement } from '../components/dashboard/FriendsManagement';
import { JoinGameModal } from '../components/dashboard/JoinGameModal';
import { CustomGamesManager } from '../components/premium/CustomGamesManager';
import { MyQuestionSets } from '../components/premium/MyQuestionSets';
import { AIGenerateQuestions } from '../components/premium/AIGenerateQuestions';
import { UserManagement } from '../components/admin/UserManagement';
import { QuestionSetManager } from '../components/admin/QuestionSetManager';
import { StatsDashboard } from '../components/admin/StatsDashboard';
import CasinoIcon from '@mui/icons-material/Casino';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';

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
    myCustomGames?: any[];
    questionSets?: any[];
}

export const UnifiedDashboard: React.FC = () => {
    const { user, token, isAdmin, isPremium, logout } = useAuth();
    const [currentTab, setCurrentTab] = useState(0);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joinModalOpen, setJoinModalOpen] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const endpoint = isAdmin ? '/api/dashboard/premium' : isPremium ? '/api/dashboard/premium' : '/api/dashboard/free';
            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
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

    useEffect(() => {
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

    // Define tabs based on user role
    const tabs = [
        { label: 'Overview', roles: ['FREE', 'PREMIUM', 'ADMIN'] },
        { label: 'Friends', roles: ['FREE', 'PREMIUM', 'ADMIN'] },
        { label: 'My Games', roles: ['PREMIUM', 'ADMIN'] },
        { label: 'Question Sets', roles: ['PREMIUM', 'ADMIN'] },
        { label: 'AI Generator', roles: ['PREMIUM', 'ADMIN'] },
        { label: 'User Management', roles: ['ADMIN'] },
        { label: 'Question Management', roles: ['ADMIN'] },
        { label: 'System Stats', roles: ['ADMIN'] },
    ];

    const userRole = isAdmin ? 'ADMIN' : isPremium ? 'PREMIUM' : 'FREE';
    const visibleTabs = tabs.filter(tab => tab.roles.includes(userRole));

    const getRoleBadge = () => {
        if (isAdmin) {
            return (
                <Paper sx={{ p: 1, px: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettingsIcon fontSize="small" /> Administrator
                    </Typography>
                </Paper>
            );
        }
        if (isPremium) {
            return (
                <Paper sx={{ p: 1, px: 2, bgcolor: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#ffd700', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon fontSize="small" /> Premium Member
                    </Typography>
                </Paper>
            );
        }
        return (
            <Paper sx={{ p: 1, px: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Free Account
                </Typography>
            </Paper>
        );
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a2e', position: 'relative', overflow: 'hidden' }}>
            <AnimatedBackground />

            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                            {isAdmin ? 'Admin Dashboard' : isPremium ? 'Premium Dashboard' : 'Dashboard'}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Welcome back, {user?.username}!
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {getRoleBadge()}
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            onClick={logout}
                            sx={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Box>

                {/* Stats Grid - Always visible */}
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

                {/* Tabs Navigation */}
                <Paper sx={{ mb: 3, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Tabs
                        value={currentTab}
                        onChange={(_, newValue) => setCurrentTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', fontWeight: 500 },
                            '& .Mui-selected': { color: '#667eea' },
                            '& .MuiTabs-indicator': { backgroundColor: '#667eea' }
                        }}
                    >
                        {visibleTabs.map((tab, index) => (
                            <Tab key={index} label={tab.label} />
                        ))}
                    </Tabs>
                </Paper>

                {/* Tab Content */}
                <Box>
                    {/* Overview Tab */}
                    {currentTab === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <ActiveGamesList games={data.activeGames} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper sx={{
                                    p: 3,
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    textAlign: 'center'
                                }}>
                                    <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={() => setJoinModalOpen(true)}
                                        sx={{
                                            mt: 2,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                            }
                                        }}
                                    >
                                        Join Game
                                    </Button>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}

                    {/* Friends Tab */}
                    {currentTab === 1 && (
                        <FriendsManagement token={token!} />
                    )}

                    {/* My Games Tab (Premium/Admin) */}
                    {currentTab === 2 && isPremium && (
                        <CustomGamesManager
                            games={data.myCustomGames || []}
                            onUpdate={fetchDashboardData}
                        />
                    )}

                    {/* Question Sets Tab (Premium/Admin) */}
                    {currentTab === 3 && isPremium && (
                        <MyQuestionSets />
                    )}

                    {/* AI Generator Tab (Premium/Admin) */}
                    {currentTab === 4 && isPremium && (
                        <AIGenerateQuestions
                            onSuccess={() => {
                                // Optionally switch to Question Sets tab after generation
                                setCurrentTab(3);
                            }}
                            onCancel={() => {
                                // Stay on current tab
                            }}
                        />
                    )}

                    {/* User Management Tab (Admin) */}
                    {isAdmin && currentTab === visibleTabs.findIndex(t => t.label === 'User Management') && (
                        <UserManagement />
                    )}

                    {/* Question Management Tab (Admin) */}
                    {isAdmin && currentTab === visibleTabs.findIndex(t => t.label === 'Question Management') && (
                        <QuestionSetManager />
                    )}

                    {/* System Stats Tab (Admin) */}
                    {isAdmin && currentTab === visibleTabs.findIndex(t => t.label === 'System Stats') && (
                        <StatsDashboard />
                    )}
                </Box>
            </Container>

            {/* Floating Action Button for Join Game */}
            <Fab
                color="secondary"
                sx={{
                    position: 'fixed',
                    bottom: 32,
                    right: 32,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    }
                }}
                onClick={() => setJoinModalOpen(true)}
            >
                <AddIcon />
            </Fab>

            {/* Join Game Modal */}
            <JoinGameModal
                open={joinModalOpen}
                onClose={() => setJoinModalOpen(false)}
                token={token!}
            />
        </Box>
    );
};

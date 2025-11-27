import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Tabs, Tab, Typography, Paper, Button } from '@mui/material';
import { UserManagement } from '../components/admin/UserManagement';
import { QuestionSetManager } from '../components/admin/QuestionSetManager';
import { StatsDashboard } from '../components/admin/StatsDashboard';
import { AnimatedBackground } from '../components/AnimatedBackground';

export const AdminPanel: React.FC = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);

    if (!isAdmin) {
        navigate('/');
        return null;
    }

    return (
        <>
            <AnimatedBackground />
            <Container maxWidth="xl" sx={{ py: 4, position: 'relative', minHeight: '100vh' }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #FF6943 0%, #D946EF 50%, #8B5CF6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0px 0px 30px rgba(255, 105, 67, 0.5)',
                        }}
                    >
                        Admin Panel
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/')}
                        sx={{
                            borderColor: '#D946EF',
                            color: '#D946EF',
                            '&:hover': {
                                borderColor: '#FF6943',
                                bgcolor: 'rgba(255, 105, 67, 0.1)'
                            }
                        }}
                    >
                        Back to Game
                    </Button>
                </Box>

                <Paper sx={{
                    bgcolor: 'rgba(26, 11, 46, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(217, 70, 239, 0.2)',
                    borderRadius: 3
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => setActiveTab(newValue)}
                        sx={{
                            borderBottom: 1,
                            borderColor: 'rgba(217, 70, 239, 0.3)',
                            '& .MuiTab-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&.Mui-selected': {
                                    color: '#D946EF'
                                }
                            }
                        }}
                    >
                        <Tab label="Users" />
                        <Tab label="Question Sets" />
                        <Tab label="Statistics" />
                    </Tabs>

                    <Box sx={{ p: 3 }}>
                        {activeTab === 0 && <UserManagement />}
                        {activeTab === 1 && <QuestionSetManager />}
                        {activeTab === 2 && <StatsDashboard />}
                    </Box>
                </Paper>
            </Container>
        </>
    );
};

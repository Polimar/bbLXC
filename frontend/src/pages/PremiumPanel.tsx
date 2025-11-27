import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Tabs, Tab, Typography, Paper, Button } from '@mui/material';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { MyQuestionSets } from '../components/premium/MyQuestionSets';
import { CustomGameCreator } from '../components/premium/CustomGameCreator';

export const PremiumPanel: React.FC = () => {
    const { isPremium } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);

    if (!isPremium) {
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
                            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0px 0px 30px rgba(255, 215, 0, 0.5)',
                        }}
                    >
                        Premium Panel
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/')}
                        sx={{
                            borderColor: '#FFD700',
                            color: '#FFD700',
                            '&:hover': {
                                borderColor: '#FFA500',
                                bgcolor: 'rgba(255, 215, 0, 0.1)'
                            }
                        }}
                    >
                        Back to Game
                    </Button>
                </Box>

                <Paper sx={{
                    bgcolor: 'rgba(26, 11, 46, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    borderRadius: 3
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => setActiveTab(newValue)}
                        sx={{
                            borderBottom: 1,
                            borderColor: 'rgba(255, 215, 0, 0.3)',
                            '& .MuiTab-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&.Mui-selected': {
                                    color: '#FFD700'
                                }
                            }
                        }}
                    >
                        <Tab label="My Question Sets" />
                        <Tab label="Create Game" />
                        <Tab label="Statistics" />
                    </Tabs>

                    <Box sx={{ p: 3 }}>
                        {activeTab === 0 && <MyQuestionSets />}
                        {activeTab === 1 && <CustomGameCreator />}
                        {activeTab === 2 && (
                            <Typography>
                                Your Statistics (Coming Soon)
                                <br />
                                View your game history and performance stats.
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Container>
        </>
    );
};

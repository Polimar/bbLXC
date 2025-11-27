import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Switch,
    FormControlLabel,
    Alert,
    Grid
} from '@mui/material';

interface QuestionSet {
    id: string;
    name: string;
    _count: {
        questions: number;
    };
}

export const CustomGameCreator: React.FC = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
    const [selectedSetId, setSelectedSetId] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [totalRounds, setTotalRounds] = useState(10);
    const [timePerQuestion, setTimePerQuestion] = useState(30);
    const [isPrivate, setIsPrivate] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchQuestionSets = async () => {
            try {
                const res = await fetch('/api/premium/my-question-sets', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setQuestionSets(data.questionSets || []);
            } catch (err) {
                setError('Failed to load question sets');
            }
        };

        fetchQuestionSets();
    }, [token]);

    const handleCreateGame = async () => {
        if (!selectedSetId) {
            setError('Please select a question set');
            return;
        }

        try {
            const res = await fetch('/api/premium/games/custom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    questionSetId: selectedSetId,
                    maxPlayers,
                    totalRounds,
                    timePerQuestion,
                    isPrivate
                })
            });

            if (res.ok) {
                const data = await res.json();
                setSuccess(`Game created! Code: ${data.game.code}`);
                setTimeout(() => navigate('/'), 2000);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create game');
            }
        } catch (err) {
            setError('Failed to create game');
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Create Custom Game</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Paper sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Question Set</InputLabel>
                            <Select
                                value={selectedSetId}
                                onChange={(e) => setSelectedSetId(e.target.value)}
                                label="Question Set"
                            >
                                {questionSets.map((set) => (
                                    <MenuItem key={set.id} value={set.id}>
                                        {set.name} ({set._count.questions} questions)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography gutterBottom>Max Players: {maxPlayers}</Typography>
                        <Slider
                            value={maxPlayers}
                            onChange={(_, value) => setMaxPlayers(value as number)}
                            min={2}
                            max={10}
                            marks
                            valueLabelDisplay="auto"
                            sx={{ color: '#FFD700' }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography gutterBottom>Total Rounds: {totalRounds}</Typography>
                        <Slider
                            value={totalRounds}
                            onChange={(_, value) => setTotalRounds(value as number)}
                            min={10}
                            max={50}
                            step={5}
                            marks
                            valueLabelDisplay="auto"
                            sx={{ color: '#FFD700' }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography gutterBottom>Time per Question: {timePerQuestion}s</Typography>
                        <Slider
                            value={timePerQuestion}
                            onChange={(_, value) => setTimePerQuestion(value as number)}
                            min={10}
                            max={60}
                            step={5}
                            marks
                            valueLabelDisplay="auto"
                            sx={{ color: '#FFD700' }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#FFD700',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#FFD700',
                                        },
                                    }}
                                />
                            }
                            label="Private Game (invite code required)"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleCreateGame}
                            disabled={!selectedSetId}
                            sx={{
                                bgcolor: '#FFD700',
                                color: '#000',
                                '&:hover': { bgcolor: '#FFA500' },
                                '&:disabled': { bgcolor: 'rgba(255, 215, 0, 0.3)' }
                            }}
                        >
                            Create Game
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {questionSets.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    You need to create a question set first before creating a custom game.
                </Alert>
            )}
        </Box>
    );
};

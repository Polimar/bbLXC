import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { ManualQuestionEntry } from './ManualQuestionEntry';
import { BulkUploadQuestions } from './BulkUploadQuestions';
import { AIGenerateQuestions } from './AIGenerateQuestions';

interface QuestionSet {
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    _count: {
        questions: number;
        games: number;
    };
}

type CreationMethod = 'manual' | 'bulk' | 'ai' | null;

export const MyQuestionSets: React.FC = () => {
    const { token } = useAuth();
    const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [creationMethod, setCreationMethod] = useState<CreationMethod>(null);

    const fetchQuestionSets = async () => {
        try {
            const res = await fetch('/api/premium/my-question-sets', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setQuestionSets(data.questionSets || []);
        } catch (err) {
            setError('Failed to load question sets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestionSets();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question set?')) return;

        try {
            const res = await fetch(`/api/premium/question-sets/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                await fetchQuestionSets();
            } else {
                setError('Failed to delete question set');
            }
        } catch (err) {
            setError('Failed to delete question set');
        }
    };

    const handleSuccess = () => {
        setCreateDialogOpen(false);
        setCreationMethod(null);
        fetchQuestionSets();
    };

    const handleCancel = () => {
        setCreationMethod(null);
    };

    if (loading) return <Typography>Loading your question sets...</Typography>;

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">My Question Sets</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{ bgcolor: '#FFD700', color: '#000', '&:hover': { bgcolor: '#FFA500' } }}
                >
                    Create New Set
                </Button>
            </Box>

            {questionSets.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.2)' }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        No question sets yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Create your first custom question set to start creating personalized games!
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{ bgcolor: '#FFD700', color: '#000' }}
                    >
                        Create Your First Set
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {questionSets.map((set) => (
                        <Grid item xs={12} sm={6} md={4} key={set.id}>
                            <Card
                                sx={{
                                    bgcolor: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255, 215, 0, 0.2)',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 24px rgba(255, 215, 0, 0.3)'
                                    }
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 1, color: '#FFD700' }}>
                                        {set.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {set.description || 'No description'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <Chip
                                            label={set.category}
                                            size="small"
                                            sx={{ bgcolor: 'rgba(255, 215, 0, 0.2)' }}
                                        />
                                        <Chip
                                            label={set.difficulty}
                                            size="small"
                                            color={
                                                set.difficulty === 'EASY' ? 'success' :
                                                    set.difficulty === 'MEDIUM' ? 'warning' : 'error'
                                            }
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {set._count.questions} questions • {set._count.games} games played
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                    <Button size="small" startIcon={<EditIcon />}>
                                        Edit
                                    </Button>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(set.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog
                open={createDialogOpen}
                onClose={() => {
                    setCreateDialogOpen(false);
                    setCreationMethod(null);
                }}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    {creationMethod ? 'Create New Question Set' : 'Choose Creation Method'}
                </DialogTitle>
                <DialogContent>
                    {!creationMethod ? (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Choose how you want to create your question set:
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Card
                                        sx={{
                                            textAlign: 'center',
                                            p: 3,
                                            cursor: 'pointer',
                                            bgcolor: 'rgba(0,0,0,0.2)',
                                            border: '1px solid rgba(255, 215, 0, 0.2)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 215, 0, 0.1)',
                                                transform: 'translateY(-4px)',
                                                transition: 'all 0.2s'
                                            }
                                        }}
                                        onClick={() => setCreationMethod('manual')}
                                    >
                                        <Typography variant="h2" sx={{ mb: 2 }}>✏️</Typography>
                                        <Typography variant="h6" sx={{ mb: 1 }}>Manual Entry</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Create questions one by one with full control
                                        </Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Card
                                        sx={{
                                            textAlign: 'center',
                                            p: 3,
                                            cursor: 'pointer',
                                            bgcolor: 'rgba(0,0,0,0.2)',
                                            border: '1px solid rgba(255, 215, 0, 0.2)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 215, 0, 0.1)',
                                                transform: 'translateY(-4px)',
                                                transition: 'all 0.2s'
                                            }
                                        }}
                                        onClick={() => setCreationMethod('bulk')}
                                    >
                                        <Typography variant="h2" sx={{ mb: 2 }}>📤</Typography>
                                        <Typography variant="h6" sx={{ mb: 1 }}>Bulk Upload</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Upload multiple questions via JSON file
                                        </Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Card
                                        sx={{
                                            textAlign: 'center',
                                            p: 3,
                                            cursor: 'pointer',
                                            bgcolor: 'rgba(0,0,0,0.2)',
                                            border: '1px solid rgba(255, 215, 0, 0.2)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 215, 0, 0.1)',
                                                transform: 'translateY(-4px)',
                                                transition: 'all 0.2s'
                                            }
                                        }}
                                        onClick={() => setCreationMethod('ai')}
                                    >
                                        <Typography variant="h2" sx={{ mb: 2 }}>🤖</Typography>
                                        <Typography variant="h6" sx={{ mb: 1 }}>AI Generate</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Use AI to automatically create questions
                                        </Typography>
                                    </Card>
                                </Grid>
                            </Grid>
                        </>
                    ) : (
                        <>
                            {creationMethod === 'manual' && (
                                <ManualQuestionEntry onSuccess={handleSuccess} onCancel={handleCancel} />
                            )}
                            {creationMethod === 'bulk' && (
                                <BulkUploadQuestions onSuccess={handleSuccess} onCancel={handleCancel} />
                            )}
                            {creationMethod === 'ai' && (
                                <AIGenerateQuestions onSuccess={handleSuccess} onCancel={handleCancel} />
                            )}
                        </>
                    )}
                </DialogContent>
                {!creationMethod && (
                    <DialogActions>
                        <Button onClick={() => setCreateDialogOpen(false)}>Close</Button>
                    </DialogActions>
                )}
            </Dialog>
        </Box>
    );
};

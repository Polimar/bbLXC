import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Alert,
    IconButton,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface QuestionSet {
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    isPublic: boolean;
    isPremium: boolean;
    _count: {
        questions: number;
        games: number;
    };
}

export const QuestionSetManager: React.FC = () => {
    const { token } = useAuth();
    const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSet, setSelectedSet] = useState<QuestionSet | null>(null);

    const fetchQuestionSets = async () => {
        try {
            const res = await fetch('/api/question-sets', {
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
            const res = await fetch(`/api/question-sets/${id}`, {
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

    if (loading) return <Typography>Loading...</Typography>;

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Question Sets</Typography>
                <Button
                    variant="contained"
                    onClick={() => {
                        setSelectedSet(null);
                        setDialogOpen(true);
                    }}
                    sx={{ bgcolor: '#D946EF' }}
                >
                    Create New Set
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Difficulty</TableCell>
                            <TableCell>Questions</TableCell>
                            <TableCell>Games</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {questionSets.map((set) => (
                            <TableRow key={set.id}>
                                <TableCell>{set.name}</TableCell>
                                <TableCell>{set.category}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={set.difficulty}
                                        color={
                                            set.difficulty === 'EASY' ? 'success' :
                                                set.difficulty === 'MEDIUM' ? 'warning' : 'error'
                                        }
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{set._count.questions}</TableCell>
                                <TableCell>{set._count.games}</TableCell>
                                <TableCell>
                                    {set.isPremium && <Chip label="Premium" color="warning" size="small" sx={{ mr: 0.5 }} />}
                                    {set.isPublic && <Chip label="Public" color="info" size="small" />}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setSelectedSet(set);
                                            setDialogOpen(true);
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(set.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{selectedSet ? 'Edit Question Set' : 'Create Question Set'}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Question set creation form will be implemented here.
                        For now, use the API directly or the bulk upload feature.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

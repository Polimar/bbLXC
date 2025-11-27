import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Box,
    TextField,
    Button,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Paper,
    Alert,
    Divider,
    Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
    timeLimit: number;
}

interface ManualQuestionEntryProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const ManualQuestionEntry: React.FC<ManualQuestionEntryProps> = ({ onSuccess, onCancel }) => {
    const { token } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
    const [questions, setQuestions] = useState<Question[]>([
        { question: '', options: ['', '', '', ''], correctAnswer: 0, timeLimit: 30 }
    ]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const addQuestion = () => {
        setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, timeLimit: 30 }]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    const handleSubmit = async () => {
        if (!name || !category) {
            setError('Name and category are required');
            return;
        }

        if (questions.length === 0) {
            setError('At least one question is required');
            return;
        }

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question) {
                setError(`Question ${i + 1}: Question text is required`);
                return;
            }
            if (q.options.some(o => !o)) {
                setError(`Question ${i + 1}: All options must be filled`);
                return;
            }
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/premium/question-sets/manual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    description,
                    category,
                    difficulty,
                    questions
                })
            });

            if (res.ok) {
                onSuccess();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create question set');
            }
        } catch (err) {
            setError('Failed to create question set');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Manual Question Entry</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: '#FFD700' }}>Question Set Details</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={2}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Difficulty</InputLabel>
                            <Select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value as any)}
                                label="Difficulty"
                            >
                                <MenuItem value="EASY">Easy</MenuItem>
                                <MenuItem value="MEDIUM">Medium</MenuItem>
                                <MenuItem value="HARD">Hard</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">Questions ({questions.length})</Typography>
                <Button startIcon={<AddIcon />} onClick={addQuestion} variant="outlined" sx={{ borderColor: '#FFD700', color: '#FFD700' }}>
                    Add Question
                </Button>
            </Box>

            {questions.map((q, qIndex) => (
                <Paper key={qIndex} sx={{ p: 3, mb: 2, bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#FFD700' }}>Question {qIndex + 1}</Typography>
                        {questions.length > 1 && (
                            <IconButton size="small" color="error" onClick={() => removeQuestion(qIndex)}>
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Box>

                    <TextField
                        fullWidth
                        label="Question"
                        value={q.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        multiline
                        rows={2}
                        sx={{ mb: 2 }}
                    />

                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Options</Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        {q.options.map((option, oIndex) => (
                            <Grid item xs={12} sm={6} key={oIndex}>
                                <TextField
                                    fullWidth
                                    label={`Option ${oIndex + 1}`}
                                    value={option}
                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderColor: q.correctAnswer === oIndex ? '#4CAF50' : undefined,
                                            bgcolor: q.correctAnswer === oIndex ? 'rgba(76, 175, 80, 0.1)' : undefined
                                        }
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Correct Answer</InputLabel>
                                <Select
                                    value={q.correctAnswer}
                                    onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                                    label="Correct Answer"
                                >
                                    {q.options.map((_, i) => (
                                        <MenuItem key={i} value={i}>Option {i + 1}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Time Limit (seconds)"
                                value={q.timeLimit}
                                onChange={(e) => updateQuestion(qIndex, 'timeLimit', parseInt(e.target.value))}
                                inputProps={{ min: 10, max: 120 }}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            ))}

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={onCancel} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    sx={{ bgcolor: '#FFD700', color: '#000', '&:hover': { bgcolor: '#FFA500' } }}
                >
                    {loading ? 'Creating...' : 'Create Question Set'}
                </Button>
            </Box>
        </Box>
    );
};

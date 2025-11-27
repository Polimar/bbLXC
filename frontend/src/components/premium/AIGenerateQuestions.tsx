import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Box,
    Button,
    Typography,
    Alert,
    Paper,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface AIGenerateQuestionsProps {
    onSuccess: () => void;
    onCancel: () => void;
}

type AIProvider = 'openai' | 'anthropic' | 'google' | 'ollama';

const AI_PROVIDERS = [
    { value: 'openai', label: 'OpenAI (GPT-4, GPT-3.5)', requiresKey: true },
    { value: 'anthropic', label: 'Anthropic (Claude)', requiresKey: true },
    { value: 'google', label: 'Google (Gemini)', requiresKey: true },
    { value: 'ollama', label: 'Ollama (Local)', requiresKey: false }
];

const DEFAULT_PROMPT = `Generate {count} multiple-choice trivia questions about {topic}.

For each question:
- Provide 4 options
- Mark the correct answer
- Set appropriate time limit (30-60 seconds based on difficulty)
- Make questions engaging and educational

Difficulty level: {difficulty}

Return the response in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "timeLimit": 30
    }
  ]
}`;

export const AIGenerateQuestions: React.FC<AIGenerateQuestionsProps> = ({ onSuccess, onCancel }) => {
    const { token } = useAuth();
    const [provider, setProvider] = useState<AIProvider>('openai');
    const [apiKey, setApiKey] = useState('');
    const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
    const [ollamaModel, setOllamaModel] = useState('llama2');

    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
    const [topic, setTopic] = useState('');
    const [questionCount, setQuestionCount] = useState(10);
    const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const selectedProvider = AI_PROVIDERS.find(p => p.value === provider);

    const handleGenerate = async () => {
        if (!name || !category || !topic) {
            setError('Name, category, and topic are required');
            return;
        }

        if (selectedProvider?.requiresKey && !apiKey) {
            setError('API key is required for this provider');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Replace placeholders in prompt
            const finalPrompt = customPrompt
                .replace('{count}', questionCount.toString())
                .replace('{topic}', topic)
                .replace('{difficulty}', difficulty);

            const res = await fetch('/api/premium/question-sets/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    category,
                    difficulty,
                    provider,
                    apiKey: provider !== 'ollama' ? apiKey : undefined,
                    ollamaUrl: provider === 'ollama' ? ollamaUrl : undefined,
                    ollamaModel: provider === 'ollama' ? ollamaModel : undefined,
                    prompt: finalPrompt,
                    questionCount
                })
            });

            if (res.ok) {
                onSuccess();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to generate questions');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate questions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
                <AutoAwesomeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                AI Generate Questions
            </Typography>

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
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Number of Questions"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                            inputProps={{ min: 5, max: 50 }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: '#FFD700' }}>AI Provider Configuration</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>AI Provider</InputLabel>
                            <Select
                                value={provider}
                                onChange={(e) => setProvider(e.target.value as AIProvider)}
                                label="AI Provider"
                            >
                                {AI_PROVIDERS.map((p) => (
                                    <MenuItem key={p.value} value={p.value}>
                                        {p.label}
                                        {!p.requiresKey && <Chip label="No API Key" size="small" sx={{ ml: 1 }} />}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {provider === 'ollama' ? (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Ollama URL"
                                    value={ollamaUrl}
                                    onChange={(e) => setOllamaUrl(e.target.value)}
                                    placeholder="http://localhost:11434"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Model Name"
                                    value={ollamaModel}
                                    onChange={(e) => setOllamaModel(e.target.value)}
                                    placeholder="llama2, mistral, etc."
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Alert severity="info">
                                    Make sure Ollama is running locally. You can start it with: <code>ollama serve</code>
                                </Alert>
                            </Grid>
                        </>
                    ) : (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="password"
                                label="API Key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={`Enter your ${selectedProvider?.label} API key`}
                                required
                            />
                        </Grid>
                    )}
                </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: '#FFD700' }}>Generation Parameters</Typography>
                <TextField
                    fullWidth
                    label="Topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., World History, Science, Movies, etc."
                    required
                    sx={{ mb: 2 }}
                />

                <Accordion sx={{ bgcolor: 'rgba(0,0,0,0.3)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Custom Prompt (Advanced)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="caption">
                                Available placeholders: <code>{'{count}'}</code>, <code>{'{topic}'}</code>, <code>{'{difficulty}'}</code>
                            </Typography>
                        </Alert>
                        <TextField
                            fullWidth
                            multiline
                            rows={12}
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            sx={{
                                '& .MuiInputBase-input': {
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem'
                                }
                            }}
                        />
                        <Button
                            size="small"
                            onClick={() => setCustomPrompt(DEFAULT_PROMPT)}
                            sx={{ mt: 1 }}
                        >
                            Reset to Default
                        </Button>
                    </AccordionDetails>
                </Accordion>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={onCancel} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleGenerate}
                    variant="contained"
                    disabled={loading}
                    startIcon={<AutoAwesomeIcon />}
                    sx={{ bgcolor: '#FFD700', color: '#000', '&:hover': { bgcolor: '#FFA500' } }}
                >
                    {loading ? 'Generating...' : 'Generate Questions'}
                </Button>
            </Box>
        </Box>
    );
};

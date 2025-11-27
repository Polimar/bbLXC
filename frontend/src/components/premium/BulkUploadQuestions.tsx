import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Box,
    Button,
    Typography,
    Alert,
    Paper,
    TextField
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface BulkUploadQuestionsProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const EXAMPLE_JSON = {
    "name": "Science Trivia",
    "description": "General science questions",
    "category": "Science",
    "difficulty": "MEDIUM",
    "questions": [
        {
            "question": "What is the chemical symbol for gold?",
            "options": ["Au", "Ag", "Fe", "Cu"],
            "correctAnswer": 0,
            "timeLimit": 30
        },
        {
            "question": "What planet is known as the Red Planet?",
            "options": ["Venus", "Mars", "Jupiter", "Saturn"],
            "correctAnswer": 1,
            "timeLimit": 30
        },
        {
            "question": "What is the speed of light?",
            "options": ["299,792 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"],
            "correctAnswer": 0,
            "timeLimit": 45
        }
    ]
};

export const BulkUploadQuestions: React.FC<BulkUploadQuestionsProps> = ({ onSuccess, onCancel }) => {
    const { token } = useAuth();
    const [jsonContent, setJsonContent] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showExample, setShowExample] = useState(true);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setJsonContent(content);
            setShowExample(false);
        };
        reader.readAsText(file);
    };

    const handleSubmit = async () => {
        if (!jsonContent) {
            setError('Please upload a JSON file or paste JSON content');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Validate JSON
            const data = JSON.parse(jsonContent);

            console.log('Sending data:', data); // Debug log

            const res = await fetch('/api/premium/question-sets/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                onSuccess();
            } else {
                const errorData = await res.json();
                console.error('Backend error:', errorData); // Debug log
                const errorMessage = errorData.message
                    ? `${errorData.error}: ${errorData.message}`
                    : errorData.error || 'Failed to upload questions';
                setError(errorMessage);
            }
        } catch (err: any) {
            console.error('Upload error:', err); // Debug log
            if (err instanceof SyntaxError) {
                setError('Invalid JSON format: ' + err.message);
            } else {
                setError(err.message || 'Failed to upload questions');
            }
        } finally {
            setLoading(false);
        }
    };

    const copyExample = () => {
        const exampleStr = JSON.stringify(EXAMPLE_JSON, null, 2);
        navigator.clipboard.writeText(exampleStr);
        setJsonContent(exampleStr);
        setShowExample(false);
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Bulk Upload Questions</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: '#FFD700' }}>Upload JSON File</Typography>

                <Box sx={{ mb: 3 }}>
                    <input
                        accept=".json"
                        style={{ display: 'none' }}
                        id="json-file-upload"
                        type="file"
                        onChange={handleFileUpload}
                    />
                    <label htmlFor="json-file-upload">
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadFileIcon />}
                            sx={{ borderColor: '#FFD700', color: '#FFD700' }}
                        >
                            Choose JSON File
                        </Button>
                    </label>
                </Box>

                <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>OR</Typography>

                <TextField
                    fullWidth
                    multiline
                    rows={12}
                    label="Paste JSON Content"
                    value={jsonContent}
                    onChange={(e) => {
                        setJsonContent(e.target.value);
                        setShowExample(false);
                    }}
                    placeholder="Paste your JSON content here..."
                    sx={{
                        '& .MuiInputBase-input': {
                            fontFamily: 'monospace',
                            fontSize: '0.875rem'
                        }
                    }}
                />
            </Paper>

            {showExample && (
                <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: '#FFD700' }}>Example JSON Format</Typography>
                        <Button
                            size="small"
                            startIcon={<ContentCopyIcon />}
                            onClick={copyExample}
                            sx={{ color: '#FFD700' }}
                        >
                            Copy Example
                        </Button>
                    </Box>
                    <Box
                        component="pre"
                        sx={{
                            bgcolor: 'rgba(0,0,0,0.4)',
                            p: 2,
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.875rem',
                            fontFamily: 'monospace'
                        }}
                    >
                        {JSON.stringify(EXAMPLE_JSON, null, 2)}
                    </Box>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="caption">
                            <strong>Format Requirements:</strong><br />
                            • <code>name</code>: Question set name (required)<br />
                            • <code>category</code>: Category name (required)<br />
                            • <code>difficulty</code>: EASY, MEDIUM, or HARD<br />
                            • <code>questions</code>: Array of question objects<br />
                            • <code>correctAnswer</code>: Index (0-3) of the correct option<br />
                            • <code>timeLimit</code>: Seconds per question (10-120)
                        </Typography>
                    </Alert>
                </Paper>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={onCancel} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !jsonContent}
                    sx={{ bgcolor: '#FFD700', color: '#000', '&:hover': { bgcolor: '#FFA500' } }}
                >
                    {loading ? 'Uploading...' : 'Upload Questions'}
                </Button>
            </Box>
        </Box>
    );
};

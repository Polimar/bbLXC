import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
    id: string;
    text: string;
}

interface Question {
    id: string;
    text: string;
    options: Option[];
    timeLimit: number;
}

interface QuestionCardProps {
    question: Question;
    onAnswer: (answerId: string) => void;
    onTimeExpired: () => void;
    questionNumber?: number;
    totalQuestions?: number;
    correctAnswerId?: string;
    showCorrectAnswer?: boolean;
}

export const QuestionCard = ({ question, onAnswer, onTimeExpired, questionNumber, totalQuestions, correctAnswerId, showCorrectAnswer }: QuestionCardProps) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(question.timeLimit);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        setTimeLeft(question.timeLimit);
        setSelectedAnswer(null);

        // Clear any existing timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    onTimeExpired();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [question.id, onTimeExpired]);

    const handleAnswerClick = (id: string) => {
        if (selectedAnswer || showCorrectAnswer) return;
        setSelectedAnswer(id);

        // Stop the timer when player answers
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        onAnswer(id);
    };

    const getButtonColor = (optionId: string) => {
        if (!showCorrectAnswer) {
            return selectedAnswer === optionId ? "secondary" : "primary";
        }

        // Show correct/incorrect colors
        if (optionId === correctAnswerId) {
            return "success"; // Green for correct answer
        }
        if (selectedAnswer === optionId && selectedAnswer !== correctAnswerId) {
            return "error"; // Red for wrong answers
        }
        return "primary";
    };

    const getButtonVariant = (optionId: string) => {
        if (selectedAnswer === optionId || (showCorrectAnswer && optionId === correctAnswerId)) {
            return "contained";
        }
        return "outlined";
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card sx={{ mb: 4, overflow: 'visible' }}>
                        <CardContent sx={{ p: 4, textAlign: 'center' }}>
                            {(questionNumber && totalQuestions) && (
                                <Typography variant="subtitle2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
                                    Domanda {questionNumber} di {totalQuestions}
                                </Typography>
                            )}
                            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                                    {timeLeft}s
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={(timeLeft / question.timeLimit) * 100}
                                sx={{ mb: 4, height: 10, borderRadius: 5 }}
                            />

                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
                                {question.text}
                            </Typography>

                            <Grid container spacing={3}>
                                {question.options.map((option) => (
                                    <Grid item xs={12} md={6} key={option.id}>
                                        <Button
                                            variant={getButtonVariant(option.id)}
                                            color={getButtonColor(option.id)}
                                            fullWidth
                                            size="large"
                                            onClick={() => handleAnswerClick(option.id)}
                                            disabled={!!selectedAnswer || timeLeft === 0 || showCorrectAnswer}
                                            sx={{
                                                py: 3,
                                                px: 2,
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                height: '100%',
                                                minHeight: '80px',
                                                borderWidth: 2,
                                                color: '#FFFFFF',
                                                borderColor: selectedAnswer === option.id ? undefined : 'rgba(255, 255, 255, 0.3)',
                                                backgroundColor: selectedAnswer === option.id ? undefined : 'rgba(139, 92, 246, 0.15)',
                                                '&:hover': {
                                                    borderWidth: 2,
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                    backgroundColor: selectedAnswer === option.id ? undefined : 'rgba(139, 92, 246, 0.25)'
                                                },
                                                '&.Mui-disabled': {
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    borderColor: 'rgba(255, 255, 255, 0.2)'
                                                }
                                            }}
                                        >
                                            {option.text || 'Opzione non disponibile'}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>

                            {selectedAnswer && !showCorrectAnswer && (
                                <Typography variant="h6" sx={{ mt: 4, color: 'text.secondary', fontStyle: 'italic' }}>
                                    Waiting for other players...
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </Box>
    );
};

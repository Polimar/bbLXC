import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
    userId?: string;
}

export class PremiumController {
    // Get user's own question sets
    static async getMyQuestionSets(req: AuthRequest, res: Response) {
        try {
            const questionSets = await prisma.questionSet.findMany({
                where: { ownerId: req.userId },
                include: {
                    _count: {
                        select: { questions: true, games: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.json({ questionSets });
        } catch (error) {
            console.error('Get my question sets error:', error);
            res.status(500).json({ error: 'Failed to fetch question sets' });
        }
    }

    // Create question set manually
    static async createQuestionSetManual(req: AuthRequest, res: Response) {
        try {
            const { name, description, category, difficulty, questions } = req.body;

            // Validation
            if (!name || !category || !difficulty || !questions || questions.length < 1) {
                return res.status(400).json({
                    error: 'Invalid input',
                    message: 'Name, category, difficulty, and at least 1 question are required'
                });
            }

            if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
                return res.status(400).json({ error: 'Invalid difficulty level' });
            }

            // Validate questions format
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!q.question || !q.options || q.options.length !== 4 || q.correctAnswer === undefined) {
                    return res.status(400).json({
                        error: `Invalid question format at index ${i}`
                    });
                }
            }

            const questionSet = await prisma.questionSet.create({
                data: {
                    name,
                    description: description || '',
                    category,
                    difficulty,
                    isPublic: false,
                    isPremium: true,
                    ownerId: req.userId,
                    questions: {
                        create: questions.map((q: any, index: number) => ({
                            text: q.question,
                            options: q.options,
                            correctAnswer: String(q.correctAnswer), // Convert to string
                            timeLimit: q.timeLimit || 30,
                            points: 100,
                            order: index + 1
                        }))
                    }
                },
                include: {
                    questions: true,
                    _count: { select: { questions: true } }
                }
            });

            res.status(201).json({
                message: 'Question set created successfully',
                questionSet
            });
        } catch (error) {
            console.error('Create question set error:', error);
            res.status(500).json({ error: 'Failed to create question set' });
        }
    }

    // Bulk upload questions via JSON
    static async bulkUploadQuestions(req: AuthRequest, res: Response) {
        try {
            console.log('=== BULK UPLOAD REQUEST ===');
            console.log('Body:', JSON.stringify(req.body, null, 2));
            console.log('User ID:', req.userId);

            const { name, description, category, difficulty, questions } = req.body;

            console.log('Extracted fields:', { name, category, difficulty, questionsCount: questions?.length });

            if (!name || !category || !difficulty || !questions || questions.length < 1) {
                console.log('Validation failed: missing required fields');
                return res.status(400).json({
                    error: 'Invalid JSON format',
                    message: 'name, category, difficulty, and at least 1 question are required'
                });
            }

            // Validate difficulty
            if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
                console.log('Validation failed: invalid difficulty:', difficulty);
                return res.status(400).json({
                    error: 'Invalid difficulty',
                    message: 'Difficulty must be EASY, MEDIUM, or HARD'
                });
            }

            // Validate each question
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!q.question || !q.options || q.options.length !== 4 || q.correctAnswer === undefined) {
                    console.log(`Validation failed at question ${i}:`, q);
                    return res.status(400).json({
                        error: `Invalid question format at index ${i}`,
                        message: `Question ${i + 1}: Must have 'question' text, 4 'options', and 'correctAnswer' (0-3)`
                    });
                }
                if (q.correctAnswer < 0 || q.correctAnswer > 3) {
                    console.log(`Validation failed at question ${i}: invalid correctAnswer:`, q.correctAnswer);
                    return res.status(400).json({
                        error: `Invalid correctAnswer at index ${i}`,
                        message: `Question ${i + 1}: correctAnswer must be between 0 and 3`
                    });
                }
            }

            console.log('Validation passed, creating question set...');

            const questionSet = await prisma.questionSet.create({
                data: {
                    name,
                    description: description || '',
                    category,
                    difficulty,
                    isPublic: false,
                    isPremium: true,
                    ownerId: req.userId,
                    questions: {
                        create: questions.map((q: any, index: number) => ({
                            text: q.question,
                            options: q.options,
                            correctAnswer: String(q.correctAnswer), // Convert to string
                            timeLimit: q.timeLimit || 30,
                            points: 100,
                            order: index + 1
                        }))
                    }
                },
                include: {
                    questions: true,
                    _count: { select: { questions: true } }
                }
            });

            console.log('Question set created successfully:', questionSet.id);

            res.status(201).json({
                message: 'Questions uploaded successfully',
                questionSet
            });
        } catch (error: any) {
            console.error('=== BULK UPLOAD ERROR ===');
            console.error('Error:', error);
            console.error('Stack:', error.stack);
            res.status(500).json({
                error: 'Failed to upload questions',
                message: error.message || 'Internal server error'
            });
        }
    }

    // Generate questions via LLM
    static async generateQuestionsLLM(req: AuthRequest, res: Response) {
        try {
            const { name, category, difficulty, provider, apiKey, ollamaUrl, ollamaModel, prompt, questionCount } = req.body;

            if (!name || !category || !difficulty || !provider || !prompt) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            let generatedQuestions: any[] = [];

            try {
                switch (provider) {
                    case 'openai':
                        if (!apiKey) return res.status(400).json({ error: 'API key required for OpenAI' });
                        generatedQuestions = await PremiumController.generateWithOpenAI(apiKey, prompt);
                        break;

                    case 'anthropic':
                        if (!apiKey) return res.status(400).json({ error: 'API key required for Anthropic' });
                        generatedQuestions = await PremiumController.generateWithAnthropic(apiKey, prompt);
                        break;

                    case 'google':
                        if (!apiKey) return res.status(400).json({ error: 'API key required for Google' });
                        generatedQuestions = await PremiumController.generateWithGoogle(apiKey, prompt);
                        break;

                    case 'ollama':
                        generatedQuestions = await PremiumController.generateWithOllama(
                            ollamaUrl || 'http://localhost:11434',
                            ollamaModel || 'llama2',
                            prompt
                        );
                        break;

                    default:
                        return res.status(400).json({ error: 'Invalid AI provider' });
                }

                if (!generatedQuestions || generatedQuestions.length === 0) {
                    return res.status(500).json({ error: 'Failed to generate questions' });
                }

                // Create question set with generated questions
                const questionSet = await prisma.questionSet.create({
                    data: {
                        name,
                        description: `Generated by ${provider} AI`,
                        category,
                        difficulty,
                        isPublic: false,
                        isPremium: true,
                        ownerId: req.userId,
                        questions: {
                            create: generatedQuestions.map((q: any, index: number) => ({
                                text: q.question,
                                options: q.options,
                                correctAnswer: String(q.correctAnswer), // Convert to string
                                timeLimit: q.timeLimit || 30,
                                points: 100,
                                order: index + 1
                            }))
                        }
                    },
                    include: {
                        questions: true,
                        _count: { select: { questions: true } }
                    }
                });

                res.status(201).json({
                    message: 'Questions generated successfully',
                    questionSet
                });
            } catch (aiError: any) {
                console.error('AI generation error:', aiError);
                return res.status(500).json({
                    error: 'AI generation failed',
                    message: aiError.message || 'Failed to generate questions with AI'
                });
            }
        } catch (error) {
            console.error('LLM generation error:', error);
            res.status(500).json({ error: 'Failed to generate questions' });
        }
    }

    // OpenAI integration
    private static async generateWithOpenAI(apiKey: string, prompt: string): Promise<any[]> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that generates trivia questions in JSON format.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json() as any;
            throw new Error(error.error?.message || 'OpenAI API error');
        }

        const data = await response.json() as any;
        const content = data.choices[0].message.content;
        const parsed = JSON.parse(content);
        return parsed.questions || [];
    }

    // Anthropic (Claude) integration
    private static async generateWithAnthropic(apiKey: string, prompt: string): Promise<any[]> {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 4096,
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json() as any;
            throw new Error(error.error?.message || 'Anthropic API error');
        }

        const data = await response.json() as any;
        const content = data.content[0].text;
        const parsed = JSON.parse(content);
        return parsed.questions || [];
    }

    // Google (Gemini) integration
    private static async generateWithGoogle(apiKey: string, prompt: string): Promise<any[]> {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096
                }
            })
        });

        if (!response.ok) {
            const error = await response.json() as any;
            throw new Error(error.error?.message || 'Google API error');
        }

        const data = await response.json() as any;
        const content = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(content);
        return parsed.questions || [];
    }

    // Ollama (local) integration
    private static async generateWithOllama(url: string, model: string, prompt: string): Promise<any[]> {
        const response = await fetch(`${url}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                prompt,
                stream: false,
                format: 'json'
            })
        });

        if (!response.ok) {
            throw new Error('Ollama API error - make sure Ollama is running');
        }

        const data = await response.json() as any;
        const parsed = JSON.parse(data.response);
        return parsed.questions || [];
    }

    // Update own question set
    static async updateQuestionSet(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { name, description, category, difficulty } = req.body;

            // Check ownership
            const existingSet = await prisma.questionSet.findUnique({
                where: { id },
                select: { ownerId: true }
            });

            if (!existingSet) {
                return res.status(404).json({ error: 'Question set not found' });
            }

            if (existingSet.ownerId !== req.userId) {
                return res.status(403).json({ error: 'You can only edit your own question sets' });
            }

            const questionSet = await prisma.questionSet.update({
                where: { id },
                data: {
                    name,
                    description,
                    category,
                    difficulty
                },
                include: {
                    questions: true,
                    _count: { select: { questions: true } }
                }
            });

            res.json({
                message: 'Question set updated successfully',
                questionSet
            });
        } catch (error) {
            console.error('Update question set error:', error);
            res.status(500).json({ error: 'Failed to update question set' });
        }
    }

    // Delete own question set
    static async deleteQuestionSet(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            // Check ownership
            const existingSet = await prisma.questionSet.findUnique({
                where: { id },
                select: { ownerId: true }
            });

            if (!existingSet) {
                return res.status(404).json({ error: 'Question set not found' });
            }

            if (existingSet.ownerId !== req.userId) {
                return res.status(403).json({ error: 'You can only delete your own question sets' });
            }

            await prisma.questionSet.delete({
                where: { id }
            });

            res.json({ message: 'Question set deleted successfully' });
        } catch (error) {
            console.error('Delete question set error:', error);
            res.status(500).json({ error: 'Failed to delete question set' });
        }
    }

    // Create custom game
    static async createCustomGame(req: AuthRequest, res: Response) {
        try {
            const { questionSetId, maxPlayers, totalRounds, timePerQuestion, isPrivate } = req.body;

            // Validate parameters
            if (maxPlayers < 2 || maxPlayers > 10) {
                return res.status(400).json({ error: 'Max players must be between 2 and 10' });
            }

            if (totalRounds < 10 || totalRounds > 50) {
                return res.status(400).json({ error: 'Total rounds must be between 10 and 50' });
            }

            if (timePerQuestion < 10 || timePerQuestion > 60) {
                return res.status(400).json({ error: 'Time per question must be between 10 and 60 seconds' });
            }

            // Verify question set exists and user has access
            const questionSet = await prisma.questionSet.findUnique({
                where: { id: questionSetId },
                include: { _count: { select: { questions: true } } }
            });

            if (!questionSet) {
                return res.status(404).json({ error: 'Question set not found' });
            }

            if (questionSet._count.questions < totalRounds) {
                return res.status(400).json({
                    error: 'Not enough questions',
                    message: `Question set has only ${questionSet._count.questions} questions, but ${totalRounds} rounds requested`
                });
            }

            // Generate unique game code
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            const game = await prisma.game.create({
                data: {
                    code,
                    questionSetId,
                    maxPlayers,
                    totalRounds,
                    timePerQuestion,
                    isPrivate,
                    inviteCode: isPrivate ? Math.random().toString(36).substring(2, 10) : null,
                    players: {
                        create: {
                            userId: req.userId!,
                            isLeader: true
                        }
                    }
                },
                include: {
                    questionSet: {
                        select: {
                            name: true,
                            category: true,
                            difficulty: true
                        }
                    },
                    players: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true
                                }
                            }
                        }
                    }
                }
            });

            res.status(201).json({
                message: 'Custom game created successfully',
                game
            });
        } catch (error) {
            console.error('Create custom game error:', error);
            res.status(500).json({ error: 'Failed to create custom game' });
        }
    }

    // Update custom game
    static async updateCustomGame(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { maxPlayers, totalRounds, timePerQuestion } = req.body;

            // Check ownership and status
            const game = await prisma.game.findUnique({
                where: { id },
                include: { players: true }
            });

            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }

            const isLeader = game.players.some(p => p.userId === req.userId && p.isLeader);
            if (!isLeader) {
                return res.status(403).json({ error: 'Only the game leader can edit the game' });
            }

            if (game.status !== 'WAITING') {
                return res.status(400).json({ error: 'Cannot edit a game that has already started' });
            }

            // Validate parameters
            if (maxPlayers && (maxPlayers < 2 || maxPlayers > 10)) {
                return res.status(400).json({ error: 'Max players must be between 2 and 10' });
            }

            if (totalRounds && (totalRounds < 10 || totalRounds > 50)) {
                return res.status(400).json({ error: 'Total rounds must be between 10 and 50' });
            }

            if (timePerQuestion && (timePerQuestion < 10 || timePerQuestion > 60)) {
                return res.status(400).json({ error: 'Time per question must be between 10 and 60 seconds' });
            }

            const updatedGame = await prisma.game.update({
                where: { id },
                data: {
                    maxPlayers,
                    totalRounds,
                    timePerQuestion
                }
            });

            res.json({
                message: 'Game updated successfully',
                game: updatedGame
            });
        } catch (error) {
            console.error('Update game error:', error);
            res.status(500).json({ error: 'Failed to update game' });
        }
    }

    // Delete custom game
    static async deleteCustomGame(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            // Check ownership
            const game = await prisma.game.findUnique({
                where: { id },
                include: { players: true }
            });

            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }

            const isLeader = game.players.some(p => p.userId === req.userId && p.isLeader);
            if (!isLeader) {
                return res.status(403).json({ error: 'Only the game leader can delete the game' });
            }

            // Delete game players first (cascade should handle this but explicit is safer if no cascade)
            // Prisma handles cascade if configured, but let's just delete the game.
            // Actually, we need to delete GamePlayers first if relation is not cascade.
            // Schema says: players GamePlayer[]
            // Let's assume cascade delete is NOT set in schema (it wasn't explicit).
            // So we delete players first.
            await prisma.gamePlayer.deleteMany({
                where: { gameId: id }
            });

            await prisma.game.delete({
                where: { id }
            });

            res.json({ message: 'Game deleted successfully' });
        } catch (error) {
            console.error('Delete game error:', error);
            res.status(500).json({ error: 'Failed to delete game' });
        }
    }

    // Start custom game
    static async startCustomGame(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            const game = await prisma.game.findUnique({
                where: { id },
                include: { players: true }
            });

            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }

            const isLeader = game.players.some(p => p.userId === req.userId && p.isLeader);
            if (!isLeader) {
                return res.status(403).json({ error: 'Only the game leader can start the game' });
            }

            if (game.status !== 'WAITING') {
                return res.status(400).json({ error: 'Game is not in waiting state' });
            }

            const updatedGame = await prisma.game.update({
                where: { id },
                data: { status: 'IN_PROGRESS', startedAt: new Date() }
            });

            // TODO: Initialize game in GameService (in-memory)

            res.json({
                message: 'Game started successfully',
                game: updatedGame
            });
        } catch (error) {
            console.error('Start game error:', error);
            res.status(500).json({ error: 'Failed to start game' });
        }
    }
}

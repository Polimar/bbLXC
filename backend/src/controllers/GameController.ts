import { Request, Response } from 'express';
import { gameService } from '../services/GameService';

export const createGame = async (req: Request, res: Response) => {
    const { hostId, hostName } = req.body;
    if (!hostId || !hostName) {
        return res.status(400).json({ error: 'Missing hostId or hostName' });
    }

    try {
        const game = await gameService.createGame(hostId, hostName);
        res.json(game);
    } catch (error) {
        console.error('Create game error:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
};

export const joinGame = async (req: Request, res: Response) => {
    const { code, playerId, username } = req.body;
    if (!code || !playerId || !username) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const game = await gameService.joinGame(code, playerId, username);
        if (!game) {
            return res.status(404).json({ error: 'Game not found or already started' });
        }

        res.json(game);
    } catch (error) {
        console.error('Join game error:', error);
        res.status(500).json({ error: 'Failed to join game' });
    }
};

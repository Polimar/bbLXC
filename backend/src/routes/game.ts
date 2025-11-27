import { Router } from 'express';
import { createGame, joinGame } from '../controllers/GameController';

const router = Router();

router.post('/', createGame);
router.post('/join', joinGame);

export default router;

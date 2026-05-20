import { Router } from 'express';
import { chat } from '../controllers/assistant.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All assistant endpoints require a valid JWT
router.use(authenticate);

router.post('/chat', chat);

export default router;

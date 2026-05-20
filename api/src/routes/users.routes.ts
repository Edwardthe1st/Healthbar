import { Router } from 'express';
import { getMe, updateMe, deleteMe } from '../controllers/users.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.put('/me', updateMe);
router.delete('/me', deleteMe);

export default router;

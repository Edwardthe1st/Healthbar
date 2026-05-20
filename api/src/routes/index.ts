import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import foodsRoutes from './foods.routes';
import mealsRoutes from './meals.routes';
import logsRoutes from './logs.routes';
import nutritionRoutes from './nutrition.routes';
import assistantRoutes from './assistant.routes';

const router = Router();

// Health probe — no auth required
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/foods', foodsRoutes);
router.use('/meals', mealsRoutes);
router.use('/logs', logsRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/assistant', assistantRoutes);

export default router;

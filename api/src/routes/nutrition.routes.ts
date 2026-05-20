import { Router } from 'express';
import {
  getNutritionProfile,
  getNutritionToday,
  simulateMeal,
} from '../controllers/nutrition.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', getNutritionProfile);  // Full BMR/TDEE/macro profile
router.get('/today', getNutritionToday);       // Consumed vs targets for today
router.post('/simulate', simulateMeal);        // Simulate adding a meal

export default router;

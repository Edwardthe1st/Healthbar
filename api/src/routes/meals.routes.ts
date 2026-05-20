import { Router } from 'express';
import {
  listMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  recommendMeals,
} from '../controllers/meals.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// /meals/recommend must be declared BEFORE /meals/:id to avoid route shadowing
router.get('/recommend', recommendMeals);

router.get('/', listMeals);
router.get('/:id', getMealById);
router.post('/', createMeal);
router.put('/:id', updateMeal);
router.delete('/:id', deleteMeal);

export default router;

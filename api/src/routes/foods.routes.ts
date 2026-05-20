import { Router } from 'express';
import { searchFoods, searchExternal, getFoodById, createFood } from '../controllers/foods.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Static routes must be declared BEFORE /:id to avoid being shadowed
router.get('/external', searchExternal);  // GET /foods/external?q=  — Open Food Facts search
router.get('/', searchFoods);             // GET /foods?q=&limit=
router.get('/:id', getFoodById);
router.post('/', createFood);

export default router;

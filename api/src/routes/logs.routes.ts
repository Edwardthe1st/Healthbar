import { Router } from 'express';
import {
  getLogs,
  getOrCreateToday,
  addMealToLog,
  removeMealFromLog,
} from '../controllers/logs.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getLogs);                                  // GET /logs?date=YYYY-MM-DD
router.get('/today', getOrCreateToday);                    // GET /logs/today
router.post('/:id/meals', addMealToLog);                   // POST /logs/:id/meals
router.delete('/:id/meals/:mealLogId', removeMealFromLog); // DELETE /logs/:id/meals/:mealLogId

export default router;

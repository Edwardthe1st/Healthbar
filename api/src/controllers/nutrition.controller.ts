import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as nutritionService from '../services/nutritionService';

const simulateSchema = z.object({
  meal_id: z.string(),
});

const meta = { timestamp: new Date().toISOString(), version: '1.0' };

export async function getNutritionProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const profile = await nutritionService.getNutritionProfile(userId);
    res.json({ success: true, data: profile, meta });
  } catch (err) {
    next(err);
  }
}

export async function getNutritionToday(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const summary = await nutritionService.getTodaySummary(userId);
    res.json({ success: true, data: summary, meta });
  } catch (err) {
    next(err);
  }
}

export async function simulateMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { meal_id } = simulateSchema.parse(req.body);
    const simulation = await nutritionService.simulateMeal(userId, meal_id);
    if (!simulation) {
      res.status(404).json({ success: false, error: { code: 'MEAL_NOT_FOUND', message: 'Meal not found' } });
      return;
    }
    res.json({ success: true, data: simulation, meta });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors } });
      return;
    }
    next(err);
  }
}

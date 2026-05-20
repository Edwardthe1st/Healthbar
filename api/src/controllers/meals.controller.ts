import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as mealService from '../services/mealService';

const mealFoodSchema = z.object({
  food_id: z.string(),
  quantity_g: z.number().positive(),
});

const createMealSchema = z.object({
  name: z.string().min(1),
  foods: z.array(mealFoodSchema).min(1),
});

const updateMealSchema = z.object({
  name: z.string().min(1).optional(),
  foods: z.array(mealFoodSchema).optional(),
});

const meta = { timestamp: new Date().toISOString(), version: '1.0' };

export async function listMeals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const meals = await mealService.listMeals(userId);
    res.json({ success: true, data: meals, meta });
  } catch (err) {
    next(err);
  }
}

export async function getMealById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const meal = await mealService.getMealWithMacros(req.params['id'] as string, userId);
    if (!meal) {
      res.status(404).json({ success: false, error: { code: 'MEAL_NOT_FOUND', message: 'Meal not found' } });
      return;
    }
    res.json({ success: true, data: meal, meta });
  } catch (err) {
    next(err);
  }
}

export async function createMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const body = createMealSchema.parse(req.body);
    const meal = await mealService.createMeal(userId, body);
    res.status(201).json({ success: true, data: meal, meta });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors } });
      return;
    }
    next(err);
  }
}

export async function updateMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const body = updateMealSchema.parse(req.body);
    const meal = await mealService.updateMeal(req.params['id'] as string, userId, body);
    if (!meal) {
      res.status(404).json({ success: false, error: { code: 'MEAL_NOT_FOUND', message: 'Meal not found' } });
      return;
    }
    res.json({ success: true, data: meal, meta });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors } });
      return;
    }
    next(err);
  }
}

export async function deleteMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const deleted = await mealService.deleteMeal(req.params['id'] as string, userId);
    if (!deleted) {
      res.status(404).json({ success: false, error: { code: 'MEAL_NOT_FOUND', message: 'Meal not found' } });
      return;
    }
    res.json({ success: true, data: { deleted: true }, meta });
  } catch (err) {
    next(err);
  }
}

export async function recommendMeals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const recommendations = await mealService.recommendMeals(userId);
    res.json({ success: true, data: recommendations, meta });
  } catch (err) {
    next(err);
  }
}

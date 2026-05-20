import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as foodService from '../services/foodService';
import { searchOpenFoodFacts } from '../services/openFoodFacts.service';

const createFoodSchema = z.object({
  name: z.string().min(1),
  brand: z.string().nullable().optional(),
  calories_per_100g: z.number().nonnegative(),
  proteins_per_100g: z.number().nonnegative(),
  carbs_per_100g: z.number().nonnegative(),
  fats_per_100g: z.number().nonnegative(),
  fiber_per_100g: z.number().nonnegative(),
  sugar_per_100g: z.number().nonnegative().nullable().optional(),
  saturated_fats_per_100g: z.number().nonnegative().nullable().optional(),
  salt_per_100g: z.number().nonnegative().nullable().optional(),
  source: z.enum(['USDA', 'OPEN_FOOD_FACTS', 'CUSTOM']).default('CUSTOM'),
  external_id: z.string().nullable().optional(),
});

const meta = { timestamp: new Date().toISOString(), version: '1.0' };

// GET /foods?q=&limit=
export async function searchFoods(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = String(req.query['q'] ?? '');
    const limit = Math.min(Number(req.query['limit'] ?? 20), 100);
    const foods = await foodService.searchFoods(q, limit);
    res.json({ success: true, data: foods, meta });
  } catch (err) {
    next(err);
  }
}

// GET /foods/external?q=&limit=  — searches Open Food Facts in real time
export async function searchExternal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = String(req.query['q'] ?? '').trim();
    if (q.length < 2) {
      res.json({ success: true, data: [] });
      return;
    }
    const limit = Math.min(Number(req.query['limit'] ?? 20), 50);
    const foods = await searchOpenFoodFacts(q, limit);
    res.json({ success: true, data: foods, meta });
  } catch (err) {
    next(err);
  }
}

// GET /foods/:id
export async function getFoodById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const food = await foodService.findById(req.params['id'] as string);
    if (!food) {
      res.status(404).json({ success: false, error: { code: 'FOOD_NOT_FOUND', message: 'Food not found' } });
      return;
    }
    res.json({ success: true, data: food, meta });
  } catch (err) {
    next(err);
  }
}

// POST /foods — creates a food; if external_id already exists, returns the existing record
export async function createFood(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = createFoodSchema.parse(req.body);

    const food = body.external_id
      ? await foodService.upsertByExternalId(body as foodService.CreateFoodInput & { external_id: string })
      : await foodService.createFood(body);

    res.status(201).json({ success: true, data: food, meta });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors } });
      return;
    }
    next(err);
  }
}

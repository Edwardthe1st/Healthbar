import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as userService from '../services/userService';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  age: z.number().int().positive().max(150).optional(),
  weight_kg: z.number().positive().optional(),
  height_cm: z.number().positive().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  activity_level: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']).optional(),
  goal: z.enum(['LOSE_WEIGHT', 'MAINTAIN', 'GAIN_MUSCLE']).optional(),
}).strict();

const meta = { timestamp: new Date().toISOString(), version: '1.0' };

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.findById((req as AuthenticatedRequest).userId);
    res.json({ success: true, data: user, meta });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = updateSchema.parse(req.body);
    const user = await userService.updateUser((req as AuthenticatedRequest).userId, body);
    res.json({ success: true, data: user, meta });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors } });
      return;
    }
    next(err);
  }
}

export async function deleteMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.deleteUser((req as AuthenticatedRequest).userId);
    res.json({ success: true, data: { deleted: true }, meta });
  } catch (err) {
    next(err);
  }
}

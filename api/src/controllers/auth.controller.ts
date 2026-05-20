import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  age: z.number().int().positive().max(150),
  weight_kg: z.number().positive(),
  height_cm: z.number().positive(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  activity_level: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']),
  goal: z.enum(['LOSE_WEIGHT', 'MAINTAIN', 'GAIN_MUSCLE']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refresh_token: z.string(),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = registerSchema.parse(req.body);
    const result = await authService.register(body);
    res.status(201).json({ success: true, data: result, meta: { timestamp: new Date().toISOString(), version: '1.0' } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors } });
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.password);
    res.json({ success: true, data: result, meta: { timestamp: new Date().toISOString(), version: '1.0' } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors } });
      return;
    }
    if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' } });
      return;
    }
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refresh_token } = refreshSchema.parse(req.body);
    const result = await authService.refreshTokens(refresh_token);
    res.json({ success: true, data: result, meta: { timestamp: new Date().toISOString(), version: '1.0' } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors } });
      return;
    }
    if (err instanceof Error && err.message === 'INVALID_REFRESH_TOKEN') {
      res.status(401).json({ success: false, error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid or expired' } });
      return;
    }
    next(err);
  }
}

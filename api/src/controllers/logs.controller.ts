import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as logService from '../services/logService';

const addMealSchema = z.object({
  meal_id: z.string(),
  meal_time: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
});

const meta = { timestamp: new Date().toISOString(), version: '1.0' };

export async function getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const dateStr = req.query['date'] as string | undefined;
    const logs = await logService.getLogs(userId, dateStr);
    res.json({ success: true, data: logs, meta });
  } catch (err) {
    next(err);
  }
}

export async function getOrCreateToday(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const log = await logService.getOrCreateToday(userId);
    res.json({ success: true, data: log, meta });
  } catch (err) {
    next(err);
  }
}

export async function addMealToLog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const logId = req.params['id'] as string;
    const body = addMealSchema.parse(req.body);
    const entry = await logService.addMealToLog(logId, userId, body.meal_id, body.meal_time);
    if (!entry) {
      res.status(404).json({ success: false, error: { code: 'LOG_NOT_FOUND', message: 'Daily log not found' } });
      return;
    }
    res.status(201).json({ success: true, data: entry, meta });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors } });
      return;
    }
    next(err);
  }
}

export async function removeMealFromLog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id: logId, mealLogId } = req.params as { id: string; mealLogId: string };
    const deleted = await logService.removeMealFromLog(logId, mealLogId, userId);
    if (!deleted) {
      res.status(404).json({ success: false, error: { code: 'MEAL_LOG_NOT_FOUND', message: 'Meal log entry not found' } });
      return;
    }
    res.json({ success: true, data: { deleted: true }, meta });
  } catch (err) {
    next(err);
  }
}

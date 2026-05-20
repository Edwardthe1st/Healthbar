import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as assistantService from '../services/assistantService';

// ─── Validation ───────────────────────────────────────────────────────────────

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role:    z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(50), // prevent unbounded history
});

// ─── Controller ───────────────────────────────────────────────────────────────

/**
 * POST /assistant/chat
 *
 * Accepts a conversation history and forwards it (with the user's live
 * nutrition context) to the ML service → Ollama.
 */
export async function chat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { messages } = chatSchema.parse(req.body);

    const response = await assistantService.sendChat(userId, messages);
    res.json({ success: true, data: { response } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: err.errors },
      });
      return;
    }
    next(err);
  }
}

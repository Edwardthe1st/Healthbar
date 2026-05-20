/**
 * Builds the user context for NutriBot and forwards the conversation
 * to the ML service, which relays it to the local Ollama instance.
 */

import axios from 'axios';
import prisma from '../lib/prisma';
import * as logService from './logService';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? 'http://ml-service:8001';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface MealSummary {
  name: string;
  calories: number;
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
}

// ─── Context builder ──────────────────────────────────────────────────────────

/**
 * Fetches today's nutrition data and available meals for the given user,
 * and returns them as a flat dict to inject into the AI system prompt.
 */
async function buildUserContext(userId: string): Promise<Record<string, unknown>> {
  const [user, todayLog] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    logService.getOrCreateToday(userId),
  ]);

  const consumed = await logService.getConsumedMacros(todayLog.id);

  const remaining = {
    calories: Math.max(0, todayLog.target_calories - consumed.calories),
    proteins: Math.max(0, todayLog.target_proteins - consumed.proteins_g),
    carbs:    Math.max(0, todayLog.target_carbs    - consumed.carbs_g),
    fats:     Math.max(0, todayLog.target_fats     - consumed.fats_g),
  };

  // Fetch the user's meals and global templates (capped for prompt size)
  const meals = await prisma.meal.findMany({
    where: { OR: [{ user_id: userId }, { is_template: true, user_id: null }] },
    include: { meal_foods: { include: { food: true } } },
    take: 20,
    orderBy: { created_at: 'desc' },
  });

  const meals_summary: MealSummary[] = meals.map((meal) => {
    let calories = 0, proteins_g = 0, carbs_g = 0, fats_g = 0;
    for (const mf of meal.meal_foods) {
      const factor = mf.quantity_g / 100;
      calories   += mf.food.calories_per_100g  * factor;
      proteins_g += mf.food.proteins_per_100g  * factor;
      carbs_g    += mf.food.carbs_per_100g     * factor;
      fats_g     += mf.food.fats_per_100g      * factor;
    }
    return {
      name:       meal.name,
      calories:   Math.round(calories),
      proteins_g: Math.round(proteins_g),
      carbs_g:    Math.round(carbs_g),
      fats_g:     Math.round(fats_g),
    };
  });

  return {
    goal:                user.goal,
    remaining_calories:  remaining.calories,
    remaining_proteins:  remaining.proteins,
    remaining_carbs:     remaining.carbs,
    remaining_fats:      remaining.fats,
    meals_summary,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Sends the conversation (with fresh user context) to the ML service
 * and returns the assistant's reply.
 *
 * Timeout is set to 35 s (slightly above Ollama's own 30 s timeout)
 * so the upstream error message propagates cleanly.
 */
export async function sendChat(userId: string, messages: ChatMessage[]): Promise<string> {
  const user_context = await buildUserContext(userId);

  const { data } = await axios.post<{ response: string }>(
    `${ML_SERVICE_URL}/assistant/chat`,
    { messages, user_context },
    { timeout: 125_000 },
  );

  return data.response;
}

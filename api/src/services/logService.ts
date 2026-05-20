/**
 * Business logic for DailyLog management.
 *
 * IMPORTANT: When a log is created, targets are snapshotted from the user's
 * current profile (via ML service). They must never be recalculated retroactively.
 */

import { MealTime } from '@prisma/client';
import prisma from '../lib/prisma';
import * as mlService from './mlService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayDateOnly(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Compute target macros for a user by calling the ML service.
 * This is only called at DailyLog creation time to snapshot the targets.
 */
async function computeTargets(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const profile = await mlService.getNutritionProfile({
    weight_kg: user.weight_kg,
    height_cm: user.height_cm,
    age: user.age,
    gender: user.gender as 'MALE' | 'FEMALE' | 'OTHER',
    activity_level: user.activity_level as 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE',
    goal: user.goal as 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE',
  });
  return profile;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

const LOG_INCLUDE = {
  daily_log_meals: {
    include: {
      meal: {
        include: { meal_foods: { include: { food: true } } },
      },
    },
    orderBy: { logged_at: 'asc' as const },
  },
} as const;

export async function getLogs(userId: string, dateStr?: string) {
  const where: { user_id: string; date?: Date } = { user_id: userId };

  if (dateStr) {
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);
    where.date = date;
  }

  return prisma.dailyLog.findMany({
    where,
    include: LOG_INCLUDE,
    orderBy: { date: 'desc' },
  });
}

/**
 * Returns today's log for the user, creating it (with snapshotted targets)
 * if it doesn't yet exist.
 */
export async function getOrCreateToday(userId: string) {
  const today = todayDateOnly();

  const existing = await prisma.dailyLog.findUnique({
    where: { user_id_date: { user_id: userId, date: today } },
    include: LOG_INCLUDE,
  });

  if (existing) return existing;

  // Snapshot targets at creation time
  const targets = await computeTargets(userId);

  return prisma.dailyLog.create({
    data: {
      user_id: userId,
      date: today,
      target_calories: targets.target_calories,
      target_proteins: targets.target_proteins_g,
      target_carbs: targets.target_carbs_g,
      target_fats: targets.target_fats_g,
    },
    include: LOG_INCLUDE,
  });
}

/**
 * Sums all consumed macros for a given daily log.
 */
export async function getConsumedMacros(logId: string) {
  const entries = await prisma.dailyLogMeal.findMany({
    where: { daily_log_id: logId },
    include: {
      meal: { include: { meal_foods: { include: { food: true } } } },
    },
  });

  let calories = 0;
  let proteins_g = 0;
  let carbs_g = 0;
  let fats_g = 0;

  for (const entry of entries) {
    for (const mf of entry.meal.meal_foods) {
      const factor = mf.quantity_g / 100;
      calories += mf.food.calories_per_100g * factor;
      proteins_g += mf.food.proteins_per_100g * factor;
      carbs_g += mf.food.carbs_per_100g * factor;
      fats_g += mf.food.fats_per_100g * factor;
    }
  }

  return {
    calories: Math.round(calories * 10) / 10,
    proteins_g: Math.round(proteins_g * 10) / 10,
    carbs_g: Math.round(carbs_g * 10) / 10,
    fats_g: Math.round(fats_g * 10) / 10,
  };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function addMealToLog(
  logId: string,
  userId: string,
  mealId: string,
  mealTime: MealTime,
) {
  // Verify the log belongs to the requesting user
  const log = await prisma.dailyLog.findFirst({ where: { id: logId, user_id: userId } });
  if (!log) return null;

  return prisma.dailyLogMeal.create({
    data: { daily_log_id: logId, meal_id: mealId, meal_time: mealTime },
    include: { meal: { include: { meal_foods: { include: { food: true } } } } },
  });
}

export async function removeMealFromLog(
  logId: string,
  mealLogId: string,
  userId: string,
): Promise<boolean> {
  const entry = await prisma.dailyLogMeal.findFirst({
    where: { id: mealLogId, daily_log_id: logId, daily_log: { user_id: userId } },
  });
  if (!entry) return false;

  await prisma.dailyLogMeal.delete({ where: { id: mealLogId } });
  return true;
}

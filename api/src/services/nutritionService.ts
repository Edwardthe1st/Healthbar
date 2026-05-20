/**
 * Orchestrates nutrition-related queries by combining DB data with ML service calls.
 */

import prisma from '../lib/prisma';
import * as mlService from './mlService';
import * as logService from './logService';
import * as mealService from './mealService';

/**
 * Returns the full nutrition profile (BMR, TDEE, macro targets) for a user.
 * Always computed fresh from current user data — not from the DailyLog snapshot.
 */
export async function getNutritionProfile(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  return mlService.getNutritionProfile({
    weight_kg: user.weight_kg,
    height_cm: user.height_cm,
    age: user.age,
    gender: user.gender as 'MALE' | 'FEMALE' | 'OTHER',
    activity_level: user.activity_level as 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE',
    goal: user.goal as 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE',
  });
}

/**
 * Returns today's consumed macros versus the snapshotted targets from today's log.
 */
export async function getTodaySummary(userId: string) {
  const today = await logService.getOrCreateToday(userId);
  const consumed = await logService.getConsumedMacros(today.id);

  const targets = {
    calories: today.target_calories,
    proteins_g: today.target_proteins,
    carbs_g: today.target_carbs,
    fats_g: today.target_fats,
  };

  const remaining = await mlService.getRemainingMacros(targets, consumed);

  return { targets, consumed, remaining, log_id: today.id, date: today.date };
}

/**
 * Simulates the macro impact of adding a meal to today's log.
 * Returns projected consumed totals and remaining budget after the addition.
 */
export async function simulateMeal(userId: string, mealId: string) {
  const [today, consumed] = await Promise.all([
    logService.getOrCreateToday(userId),
    logService.getConsumedMacros((await logService.getOrCreateToday(userId)).id),
  ]);

  const mealData = await mealService.getMealWithMacros(mealId, userId);
  if (!mealData) return null;

  const mealMacros = mealData.macros;

  const targets = {
    calories: today.target_calories,
    proteins_g: today.target_proteins,
    carbs_g: today.target_carbs,
    fats_g: today.target_fats,
  };

  const projectedConsumed = {
    calories: consumed.calories + mealMacros.calories,
    proteins_g: consumed.proteins_g + mealMacros.proteins_g,
    carbs_g: consumed.carbs_g + mealMacros.carbs_g,
    fats_g: consumed.fats_g + mealMacros.fats_g,
  };

  const projectedRemaining = await mlService.getRemainingMacros(targets, projectedConsumed);

  return {
    meal: { id: mealData.id, name: mealData.name, macros: mealMacros },
    current: { consumed, remaining: await mlService.getRemainingMacros(targets, consumed) },
    projected: { consumed: projectedConsumed, remaining: projectedRemaining },
    targets,
  };
}

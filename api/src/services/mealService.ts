/**
 * Business logic for Meal management and recommendations.
 * Orchestrates DB queries + ML service calls.
 */

import prisma from '../lib/prisma';
import * as mlService from './mlService';
import * as logService from './logService';

const MEAL_INCLUDE = {
  meal_foods: {
    include: { food: true },
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compute macro totals for a meal (calling ML service). */
async function computeMealMacros(meal: { meal_foods: { food: { calories_per_100g: number; proteins_per_100g: number; carbs_per_100g: number; fats_per_100g: number; fiber_per_100g: number }; quantity_g: number }[] }) {
  const foods = meal.meal_foods.map((mf) => ({
    calories_per_100g: mf.food.calories_per_100g,
    proteins_per_100g: mf.food.proteins_per_100g,
    carbs_per_100g: mf.food.carbs_per_100g,
    fats_per_100g: mf.food.fats_per_100g,
    fiber_per_100g: mf.food.fiber_per_100g,
    quantity_g: mf.quantity_g,
  }));

  if (foods.length === 0) {
    return { calories: 0, proteins_g: 0, carbs_g: 0, fats_g: 0, fiber_g: 0 };
  }

  return mlService.getMealMacros(foods);
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Returns the user's own meals + all global templates.
 */
export async function listMeals(userId: string) {
  return prisma.meal.findMany({
    where: {
      OR: [{ user_id: userId }, { is_template: true, user_id: null }],
    },
    include: MEAL_INCLUDE,
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Returns a meal with its computed macros.
 * Only visible if it belongs to the user or is a global template.
 */
export async function getMealWithMacros(mealId: string, userId: string) {
  const meal = await prisma.meal.findFirst({
    where: {
      id: mealId,
      OR: [{ user_id: userId }, { is_template: true, user_id: null }],
    },
    include: MEAL_INCLUDE,
  });

  if (!meal) return null;

  const macros = await computeMealMacros(meal);
  return { ...meal, macros };
}

interface MealFoodInput {
  food_id: string;
  quantity_g: number;
}

/**
 * Creates a personal meal for the user with its food items.
 */
export async function createMeal(
  userId: string,
  input: { name: string; foods: MealFoodInput[] },
) {
  const meal = await prisma.meal.create({
    data: {
      name: input.name,
      user_id: userId,
      is_template: false,
      meal_foods: {
        create: input.foods.map((f) => ({
          food_id: f.food_id,
          quantity_g: f.quantity_g,
        })),
      },
    },
    include: MEAL_INCLUDE,
  });

  const macros = await computeMealMacros(meal);
  return { ...meal, macros };
}

/**
 * Updates a user's personal meal. Templates cannot be modified by users.
 */
export async function updateMeal(
  mealId: string,
  userId: string,
  input: { name?: string; foods?: MealFoodInput[] },
) {
  // Verify ownership (templates are excluded via user_id check)
  const existing = await prisma.meal.findFirst({
    where: { id: mealId, user_id: userId },
  });
  if (!existing) return null;

  const meal = await prisma.meal.update({
    where: { id: mealId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.foods
        ? {
            meal_foods: {
              deleteMany: {},
              create: input.foods.map((f) => ({
                food_id: f.food_id,
                quantity_g: f.quantity_g,
              })),
            },
          }
        : {}),
    },
    include: MEAL_INCLUDE,
  });

  const macros = await computeMealMacros(meal);
  return { ...meal, macros };
}

/**
 * Deletes a user's personal meal. Returns false if not found / not owned.
 */
export async function deleteMeal(mealId: string, userId: string): Promise<boolean> {
  const existing = await prisma.meal.findFirst({
    where: { id: mealId, user_id: userId },
  });
  if (!existing) return false;

  await prisma.meal.delete({ where: { id: mealId } });
  return true;
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generates ranked + similar meal recommendations for a user.
 *
 * Strategy:
 * 1. Compute today's remaining macro budget.
 * 2. Rank all available meals by budget fit (ML scorer).
 * 3. Find meals similar to the user's logged history (ML content-based).
 */
export async function recommendMeals(userId: string) {
  const today = await logService.getOrCreateToday(userId);

  // Aggregate consumed macros from today's log
  const consumed = await logService.getConsumedMacros(today.id);

  const targets = {
    calories: today.target_calories,
    proteins_g: today.target_proteins,
    carbs_g: today.target_carbs,
    fats_g: today.target_fats,
  };

  const remaining = await mlService.getRemainingMacros(targets, consumed);

  // Fetch all available meals with computed macros for ML input
  const allMeals = await listMeals(userId);
  const mealsWithMacros = await Promise.all(
    allMeals.map(async (m) => {
      const macros = await computeMealMacros(m);
      return { id: m.id, ...macros };
    }),
  );

  // Meals the user has previously logged (used as "liked" signal)
  const loggedMealIds = await prisma.dailyLogMeal.findMany({
    where: { daily_log: { user_id: userId } },
    select: { meal_id: true },
    distinct: ['meal_id'],
  });
  const likedMealIds = new Set(loggedMealIds.map((m) => m.meal_id));
  const likedMeals = mealsWithMacros.filter((m) => likedMealIds.has(m.id));

  const [ranked, similar] = await Promise.all([
    mlService.rankMeals(mealsWithMacros, remaining),
    mlService.findSimilarMeals(likedMeals, mealsWithMacros, 5),
  ]);

  return { ranked, similar, remaining_budget: remaining };
}

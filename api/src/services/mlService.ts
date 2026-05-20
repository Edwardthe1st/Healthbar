/**
 * HTTP client for the Python ML microservice.
 * The API Node.js layer passes all data; the ML service never touches the DB.
 */

import axios from 'axios';

const mlClient = axios.create({
  baseURL: process.env.ML_SERVICE_URL ?? 'http://localhost:8001',
  timeout: 10_000,
});

// ─── Types (mirror Python Pydantic models) ────────────────────────────────────

export interface NutritionProfileInput {
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  activity_level: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
  goal: 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE';
}

export interface NutritionProfileResult {
  bmr: number;
  tdee: number;
  target_calories: number;
  target_proteins_g: number;
  target_carbs_g: number;
  target_fats_g: number;
}

export interface FoodItem {
  calories_per_100g: number;
  proteins_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
  quantity_g: number;
}

export interface MealMacrosResult {
  calories: number;
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
}

export interface MacroBudget {
  calories: number;
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
}

export interface MealForML {
  id: string;
  calories: number;
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
}

export interface RankedMeal {
  meal_id: string;
  score: number;
  exceeds_budget: boolean;
}

export interface RecommendedMeal {
  meal_id: string;
  similarity: number;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function getNutritionProfile(input: NutritionProfileInput): Promise<NutritionProfileResult> {
  const { data } = await mlClient.post<NutritionProfileResult>('/nutrition/profile', input);
  return data;
}

export async function getMealMacros(foods: FoodItem[]): Promise<MealMacrosResult> {
  const { data } = await mlClient.post<MealMacrosResult>('/nutrition/meal-macros', { foods });
  return data;
}

export async function getRemainingMacros(
  targets: MacroBudget,
  consumed: MacroBudget,
): Promise<MacroBudget> {
  const { data } = await mlClient.post<MacroBudget>('/nutrition/remaining', { targets, consumed });
  return data;
}

export async function rankMeals(
  meals: MealForML[],
  remaining_macros: MacroBudget,
): Promise<RankedMeal[]> {
  const { data } = await mlClient.post<{ ranked: RankedMeal[] }>('/recommend/rank', {
    meals,
    remaining_macros,
  });
  return data.ranked;
}

export async function findSimilarMeals(
  liked_meals: MealForML[],
  candidate_meals: MealForML[],
  top_n = 5,
): Promise<RecommendedMeal[]> {
  const { data } = await mlClient.post<{ recommendations: RecommendedMeal[] }>('/recommend/similar', {
    liked_meals,
    candidate_meals,
    top_n,
  });
  return data.recommendations;
}

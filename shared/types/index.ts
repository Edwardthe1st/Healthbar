/**
 * Shared TypeScript types used across the API and (optionally) the mobile app.
 * Kept in sync with ml-service Pydantic models and Prisma enums.
 */

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
export type Goal = 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE';
export type FoodSource = 'USDA' | 'OPEN_FOOD_FACTS' | 'CUSTOM';
export type MealTime = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface MacroBudget {
  calories: number;
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
}

export interface NutritionProfile extends MacroBudget {
  bmr: number;
  tdee: number;
  target_calories: number;
  target_proteins_g: number;
  target_carbs_g: number;
  target_fats_g: number;
}

/** Standard API envelope */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: { timestamp: string; version: string };
}

export interface ApiError {
  success: false;
  error: { code: string; message: string | unknown[] };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

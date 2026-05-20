/**
 * Zustand store for today's daily log and nutrition summary.
 */

import { create } from 'zustand';
import type { Meal } from './mealsStore';

export type MealTime = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface DailyLogMeal {
  id: string;
  meal_id: string;
  meal_time: MealTime;
  logged_at: string;
  meal: Meal;
}

export interface DailyLog {
  id: string;
  date: string;
  target_calories: number;
  target_proteins: number;
  target_carbs: number;
  target_fats: number;
  daily_log_meals: DailyLogMeal[];
}

export interface MacroBudget {
  calories: number;
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
}

export interface NutritionSummary {
  targets: MacroBudget;
  consumed: MacroBudget;
  remaining: MacroBudget;
  log_id: string;
  date: string;
}

interface LogState {
  todayLog: DailyLog | null;
  nutritionSummary: NutritionSummary | null;
  isLoading: boolean;
  error: string | null;

  setTodayLog: (log: DailyLog) => void;
  setNutritionSummary: (summary: NutritionSummary) => void;
  addLogMeal: (entry: DailyLogMeal) => void;
  removeLogMeal: (mealLogId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

export const useLogStore = create<LogState>()((set) => ({
  todayLog: null,
  nutritionSummary: null,
  isLoading: false,
  error: null,

  setTodayLog: (log) => set({ todayLog: log }),

  setNutritionSummary: (nutritionSummary) => set({ nutritionSummary }),

  addLogMeal: (entry) =>
    set((s) => ({
      todayLog: s.todayLog
        ? {
            ...s.todayLog,
            daily_log_meals: [...s.todayLog.daily_log_meals, entry],
          }
        : null,
    })),

  removeLogMeal: (mealLogId) =>
    set((s) => ({
      todayLog: s.todayLog
        ? {
            ...s.todayLog,
            daily_log_meals: s.todayLog.daily_log_meals.filter((m) => m.id !== mealLogId),
          }
        : null,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set({ todayLog: null, nutritionSummary: null, isLoading: false, error: null }),
}));

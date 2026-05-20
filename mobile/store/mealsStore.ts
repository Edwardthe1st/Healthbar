/**
 * Zustand store for meals state.
 * Keeps a local cache of the user's meals with computed macros.
 */

import { create } from 'zustand';

export interface FoodInMeal {
  id: string;
  food_id: string;
  quantity_g: number;
  food: {
    id: string;
    name: string;
    brand: string | null;
    calories_per_100g: number;
    proteins_per_100g: number;
    carbs_per_100g: number;
    fats_per_100g: number;
    fiber_per_100g: number;
  };
}

export interface MealMacros {
  calories: number;
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
}

export interface Meal {
  id: string;
  name: string;
  user_id: string | null;
  is_template: boolean;
  meal_foods: FoodInMeal[];
  macros?: MealMacros;
}

export interface RecommendedMeal {
  meal_id: string;
  score?: number;
  similarity?: number;
  exceeds_budget?: boolean;
}

interface MealsState {
  meals: Meal[];
  recommendations: {
    ranked: RecommendedMeal[];
    similar: RecommendedMeal[];
    remaining_budget: { calories: number; proteins_g: number; carbs_g: number; fats_g: number } | null;
  };
  isLoading: boolean;
  error: string | null;

  setMeals: (meals: Meal[]) => void;
  addMeal: (meal: Meal) => void;
  updateMeal: (meal: Meal) => void;
  removeMeal: (id: string) => void;
  setRecommendations: (recs: MealsState['recommendations']) => void;
  setLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

const initialRecommendations = {
  ranked: [],
  similar: [],
  remaining_budget: null,
};

export const useMealsStore = create<MealsState>()((set) => ({
  meals: [],
  recommendations: initialRecommendations,
  isLoading: false,
  error: null,

  setMeals: (meals) => set({ meals }),

  addMeal: (meal) => set((s) => ({ meals: [meal, ...s.meals] })),

  updateMeal: (meal) =>
    set((s) => ({
      meals: s.meals.map((m) => (m.id === meal.id ? meal : m)),
    })),

  removeMeal: (id) =>
    set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),

  setRecommendations: (recs) => set({ recommendations: recs }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set({ meals: [], recommendations: initialRecommendations, isLoading: false, error: null }),
}));

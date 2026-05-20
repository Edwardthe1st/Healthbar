import { useState, useCallback } from 'react';
import { get, post, put, del } from './api';
import { useMealsStore, Meal } from '../store/mealsStore';

interface CreateMealInput {
  name: string;
  foods: { food_id: string; quantity_g: number }[];
}

export function useMeals() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setMeals, addMeal, updateMeal: storUpdate, removeMeal, setRecommendations } = useMealsStore();

  const fetchMeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const meals = await get<Meal[]>('/meals');
      setMeals(meals);
    } catch {
      setError('Impossible de charger les repas');
    } finally {
      setIsLoading(false);
    }
  }, [setMeals]);

  const createMeal = useCallback(async (input: CreateMealInput): Promise<Meal | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const meal = await post<Meal>('/meals', input);
      addMeal(meal);
      return meal;
    } catch {
      setError('Impossible de créer le repas');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [addMeal]);

  const updateMeal = useCallback(async (id: string, input: Partial<CreateMealInput>): Promise<Meal | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const meal = await put<Meal>(`/meals/${id}`, input);
      storUpdate(meal);
      return meal;
    } catch {
      setError('Impossible de modifier le repas');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [storUpdate]);

  const deleteMeal = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await del(`/meals/${id}`);
      removeMeal(id);
      return true;
    } catch {
      setError('Impossible de supprimer le repas');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [removeMeal]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const recs = await get<{
        ranked: { meal_id: string; score: number; exceeds_budget: boolean }[];
        similar: { meal_id: string; similarity: number }[];
        remaining_budget: { calories: number; proteins_g: number; carbs_g: number; fats_g: number };
      }>('/meals/recommend');
      setRecommendations(recs);
    } catch {
      // Recommendations are non-critical — fail silently
    }
  }, [setRecommendations]);

  return {
    fetchMeals,
    createMeal,
    updateMeal,
    deleteMeal,
    fetchRecommendations,
    isLoading,
    error,
  };
}

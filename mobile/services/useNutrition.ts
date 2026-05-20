import { useState, useCallback } from 'react';
import { get } from './api';
import { useLogStore, NutritionSummary } from '../store/logStore';

export interface NutritionProfile {
  bmr: number;
  tdee: number;
  target_calories: number;
  target_proteins_g: number;
  target_carbs_g: number;
  target_fats_g: number;
}

export function useNutrition() {
  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setNutritionSummary } = useLogStore();

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await get<NutritionProfile>('/nutrition/profile');
      setProfile(data);
    } catch {
      setError('Impossible de charger le profil nutritionnel');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTodaySummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const summary = await get<NutritionSummary>('/nutrition/today');
      setNutritionSummary(summary);
    } catch {
      setError('Impossible de charger le résumé du jour');
    } finally {
      setIsLoading(false);
    }
  }, [setNutritionSummary]);

  return { profile, fetchProfile, fetchTodaySummary, isLoading, error };
}

import { useState, useCallback } from 'react';
import { get, post, del } from './api';
import { useLogStore, DailyLog, DailyLogMeal, MealTime } from '../store/logStore';

export function useLogs() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setTodayLog, addLogMeal, removeLogMeal } = useLogStore();

  const fetchToday = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const log = await get<DailyLog>('/logs/today');
      setTodayLog(log);
    } catch {
      setError('Impossible de charger le journal');
    } finally {
      setIsLoading(false);
    }
  }, [setTodayLog]);

  const addMeal = useCallback(async (
    logId: string,
    mealId: string,
    mealTime: MealTime,
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const entry = await post<DailyLogMeal>(`/logs/${logId}/meals`, {
        meal_id: mealId,
        meal_time: mealTime,
      });
      addLogMeal(entry);
      return true;
    } catch {
      setError("Impossible d'ajouter le repas");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [addLogMeal]);

  const removeMeal = useCallback(async (logId: string, mealLogId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await del(`/logs/${logId}/meals/${mealLogId}`);
      removeLogMeal(mealLogId);
      return true;
    } catch {
      setError('Impossible de supprimer le repas');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [removeLogMeal]);

  return { fetchToday, addMeal, removeMeal, isLoading, error };
}

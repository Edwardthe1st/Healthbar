import { useState, useCallback } from 'react';
import { get, post } from './api';

export interface Food {
  id: string;
  name: string;
  brand: string | null;
  calories_per_100g: number;
  proteins_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
  // Extended metrics — present for processed foods
  sugar_per_100g: number | null;
  saturated_fats_per_100g: number | null;
  salt_per_100g: number | null;
  source: 'USDA' | 'OPEN_FOOD_FACTS' | 'CUSTOM';
}

/** OFF food returned by /foods/external — not yet saved to our DB */
export interface ExternalFood {
  external_id: string;
  name: string;
  brand: string | null;
  calories_per_100g: number;
  proteins_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
  sugar_per_100g: number | null;
  saturated_fats_per_100g: number | null;
  salt_per_100g: number | null;
  source: 'OPEN_FOOD_FACTS';
}

export function useFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [externalFoods, setExternalFoods] = useState<ExternalFood[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExternalLoading, setIsExternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Local DB search ──────────────────────────────────────────────────────

  const searchFoods = useCallback(async (query: string, limit = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await get<Food[]>('/foods', { q: query, limit });
      setFoods(results);
    } catch {
      setError('Impossible de rechercher des aliments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Open Food Facts search ───────────────────────────────────────────────

  const searchExternal = useCallback(async (query: string) => {
    setIsExternalLoading(true);
    try {
      const results = await get<ExternalFood[]>('/foods/external', { q: query, limit: 20 });
      setExternalFoods(results);
    } catch {
      setExternalFoods([]);
    } finally {
      setIsExternalLoading(false);
    }
  }, []);

  const clearExternal = useCallback(() => setExternalFoods([]), []);

  /**
   * Saves an OFF food to our local DB (upsert by external_id).
   * Returns the saved Food with its DB id, ready to use in meal creation.
   */
  const importExternalFood = useCallback(async (food: ExternalFood): Promise<Food | null> => {
    try {
      return await post<Food>('/foods', food);
    } catch {
      return null;
    }
  }, []);

  const clearResults = useCallback(() => setFoods([]), []);

  return {
    foods,
    externalFoods,
    searchFoods,
    searchExternal,
    importExternalFood,
    clearResults,
    clearExternal,
    isLoading,
    isExternalLoading,
    error,
  };
}

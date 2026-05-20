import { useState } from 'react';
import { post } from './api';
import { useUserStore, UserProfile } from '../store/userStore';
import { useMealsStore } from '../store/mealsStore';
import { useLogStore } from '../store/logStore';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  activity_level: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
  goal: 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE';
}

interface AuthResult {
  user: UserProfile;
  tokens: { access_token: string; refresh_token: string };
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuth, clearAuth } = useUserStore();
  const resetMeals = useMealsStore((s) => s.reset);
  const resetLog = useLogStore((s) => s.reset);

  async function register(input: RegisterInput): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await post<AuthResult>('/auth/register', input);
      setAuth(result.user, result.tokens.access_token, result.tokens.refresh_token);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await post<AuthResult>('/auth/login', { email, password });
      setAuth(result.user, result.tokens.access_token, result.tokens.refresh_token);
      return true;
    } catch {
      setError('Email ou mot de passe incorrect');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    clearAuth();
    resetMeals();
    resetLog();
  }

  return { register, login, logout, isLoading, error };
}

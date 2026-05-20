/**
 * Zustand store for authentication state and user profile.
 * Tokens are persisted via AsyncStorage; user data is kept in memory.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  activity_level: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
  goal: 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE';
}

interface UserState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;

  setAuth: (user: UserProfile, accessToken: string, refreshToken: string) => void;
  setUser: (user: UserProfile) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),

      isAuthenticated: () => get().accessToken !== null,
    }),
    {
      name: 'nutriapp-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist tokens and minimal user info — re-fetch full profile on app load
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);

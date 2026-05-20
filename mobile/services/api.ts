/**
 * Axios API client with JWT access/refresh token logic.
 *
 * On 401 responses the client automatically:
 * 1. Calls /auth/refresh with the stored refresh token.
 * 2. Updates both tokens in the Zustand store.
 * 3. Retries the original request once with the new access token.
 * 4. Signs the user out if the refresh also fails.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '../store/userStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach access token ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle token refresh ──────────────────────────────

let isRefreshing = false;
// Queue of callbacks waiting for the refresh to complete
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(newToken: string) {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const { refreshToken, setTokens, clearAuth } = useUserStore.getState();

    if (!refreshToken) {
      clearAuth();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the refresh resolves
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
        // The queue rejection path is handled by clearAuth above
        void reject;
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const { data } = await axios.post<{
        success: boolean;
        data: { access_token: string; refresh_token: string };
      }>(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });

      const { access_token, refresh_token } = data.data;
      setTokens(access_token, refresh_token);
      processQueue(access_token);

      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return api(originalRequest);
    } catch {
      clearAuth();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

// ─── Typed response unwrapper ─────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { timestamp: string; version: string };
}

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(url, { params });
  return data.data;
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, body);
  return data.data;
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.put<ApiResponse<T>>(url, body);
  return data.data;
}

export async function del<T>(url: string): Promise<T> {
  const { data } = await api.delete<ApiResponse<T>>(url);
  return data.data;
}

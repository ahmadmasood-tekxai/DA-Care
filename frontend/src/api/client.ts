/**
 * Central axios instance. Every API module (items.ts, auth.ts, etc.)
 * imports this instead of creating its own axios client, so auth headers,
 * base URL, and error normalization live in exactly one place.
 */
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL, AUTH_TOKEN_KEY, AUTH_USER_KEY, ROUTES } from '@/constants';
import type { ApiErrorResponse } from '@/types';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Normalized, human-readable error message extracted from any API failure. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const data = axiosError.response?.data;
    if (data?.errors && data.errors.length > 0) {
      return data.errors.map((e) => `${e.field}: ${e.message}`).join(', ');
    }
    if (data?.detail) return data.detail;
    if (axiosError.message) return axiosError.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

/** Signed-in areas and the login page each one falls back to. */
const SIGNED_IN_AREAS = [
  { prefix: '/admin', login: ROUTES.ADMIN_LOGIN },
  { prefix: ROUTES.ACCOUNT, login: ROUTES.LOGIN },
];

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // An expired session inside a signed-in area sends the user to the right login.
    // Public storefront requests never need auth, so they're left alone.
    const { pathname } = window.location;
    const area = SIGNED_IN_AREAS.find((a) => pathname.startsWith(a.prefix));
    if (error.response?.status === 401 && area) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      if (pathname !== area.login) window.location.href = `${area.login}?next=${encodeURIComponent(pathname)}`;
    }
    return Promise.reject(error);
  }
);

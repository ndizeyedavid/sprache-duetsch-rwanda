import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './auth-store';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim() || 'http://localhost:4000/api';

type Envelope<T> = { success: boolean; data: T };

type RefreshEnvelope = Envelope<{
  tokens: { accessToken: string; refreshToken: string };
}>;

type ApiErrorBody = { message?: string; error?: { message?: string; code?: string; details?: unknown } };

function isAxiosError(error: unknown): error is AxiosError<ApiErrorBody> {
  return error instanceof AxiosError;
}

/** Extract field-level errors from a 400/409 response shape. */
export function apiFieldErrors(error: unknown): Record<string, string> {
  if (!isAxiosError(error)) return {};
  const details = (error.response?.data as ApiErrorBody | undefined)?.error?.details as
    | { body?: { path: (string | number)[]; message: string }[] }
    | { target?: string[] }
    | undefined;
  const out: Record<string, string> = {};
  if (details && typeof details === "object" && "body" in details && Array.isArray((details as { body: unknown }).body)) {
    for (const issue of (details as { body: { path: (string | number)[]; message: string }[] }).body) {
      const key = issue.path.join(".");
      if (key) out[key] = issue.message;
    }
  }
  // Prisma P2002 duplicate — surface the unique field if available
  if (details && typeof details === "object" && "target" in details && Array.isArray((details as { target: unknown }).target)) {
    const target = (details as { target: string[] }).target.join(", ");
    if (target) out["_form"] = `Duplicate: ${target} already exists`;
  }
  return out;
}

/** Human-readable message from any API failure. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    const message = data?.error?.message ?? data?.message;
    if (typeof message === 'string' && message.length > 0) {
      // Append first field error if present for immediate clarity
      const fields = apiFieldErrors(error);
      const first = Object.entries(fields).find(([k]) => k !== "_form");
      if (first) return `${message}: ${first[0]} — ${first[1]}`;
      if (fields._form) return `${message}: ${fields._form}`;
      return message;
    }
    if (error.message === 'Network Error') {
      return 'Cannot reach the server. Check your connection and try again.';
    }
  }
  return fallback;
}

function attachAuthHeader(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return null;
      try {
        const { data } = await axios.post<RefreshEnvelope>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );
        setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
        return data.data.tokens.accessToken;
      } catch {
        clearTokens();
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/** The only axios instance in the app. Import this, never create another. */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => attachAuthHeader(config));

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || !error.config) throw error;
    const original = error.config as AxiosRequestConfig & { _retried?: boolean };
    const status = error.response?.status;
    const url = original.url ?? '';

    // Never retry the auth endpoints themselves — a 401 there means bad credentials.
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/refresh');
    if (status !== 401 || original._retried || isAuthCall) throw error;

    original._retried = true;
    const nextToken = await refreshAccessToken();
    if (!nextToken) throw error;

    return api({
      ...original,
      headers: { ...original.headers, Authorization: `Bearer ${nextToken}` },
    });
  },
);

/**
 * GET and unwrap the backend `{ success, data }` envelope.
 * Works for both single objects and paginated lists
 * (`{ success, data: [], meta }`), since both carry `data` at top level.
 */
export async function apiGet<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.get<Envelope<T>>(path, config);
  return data.data;
}

export async function apiPost<TResponse, TBody = unknown>(
  path: string,
  body?: TBody,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  const { data } = await api.post<Envelope<TResponse>>(path, body, config);
  return data.data;
}

export async function apiPatch<TResponse, TBody = unknown>(
  path: string,
  body?: TBody,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  const { data } = await api.patch<Envelope<TResponse>>(path, body, config);
  return data.data;
}

export async function apiPut<TResponse, TBody = unknown>(
  path: string,
  body?: TBody,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  const { data } = await api.put<Envelope<TResponse>>(path, body, config);
  return data.data;
}

export async function apiDelete<TResponse>(
  path: string,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  const { data } = await api.delete<Envelope<TResponse>>(path, config);
  return data.data;
}

/** GET a binary file (PDF/CSV) and trigger a browser download. */
export async function downloadFile(path: string, filename: string): Promise<void> {
  const response = await api.get(path, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

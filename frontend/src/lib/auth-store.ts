import { apiGet,apiPost } from './api';

const ACCESS_KEY = 'sparch.accessToken';
const REFRESH_KEY = 'sparch.refreshToken';

export type AuthRole =
  | 'STUDENT'
  | 'TEACHER'
  | 'ACADEMIC_ADMIN'
  | 'FINANCE_ADMIN'
  | 'SUPER_ADMIN';

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AuthRole;
  status: string;
  avatarUrl?: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type LoginResult = { user: AuthUser; tokens: AuthTokens };
type MeResult = { user: AuthUser };

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  campusId: string;
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'WEEKEND';
  intakeId?: string;
  intendedLevelId?: string;
};

/** Token storage lives here and nowhere else. */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY) ?? sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY) ?? sessionStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string, remember = localStorage.getItem(ACCESS_KEY) !== null): void {
  const storage = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  other.removeItem(ACCESS_KEY);
  other.removeItem(REFRESH_KEY);
  storage.setItem(ACCESS_KEY, accessToken);
  storage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

export function isSignedIn(): boolean {
  return getAccessToken() !== null;
}

export async function login(email: string, password: string, remember = true): Promise<AuthUser> {
  const result = await apiPost<LoginResult>('/auth/login', { email, password });
  setTokens(result.tokens.accessToken, result.tokens.refreshToken, remember);
  return result.user;
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const result = await apiPost<LoginResult>('/auth/register', payload);
  setTokens(result.tokens.accessToken, result.tokens.refreshToken);
  return result.user;
}

export async function fetchMe(): Promise<AuthUser> {
  const result = await apiGet<MeResult>('/auth/me');
  return result.user;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    await apiPost('/auth/logout', refreshToken ? { refreshToken } : {});
  } catch {
    // Best effort — still clear local tokens below.
  } finally {
    clearTokens();
  }
}

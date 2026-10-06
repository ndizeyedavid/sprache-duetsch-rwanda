import type { AuthTokens } from './auth-tokens.js';
import type { getUserProfile } from './get-user-profile.js';
export interface RegisterResult {
  user: Awaited<ReturnType<typeof getUserProfile>>;
  tokens: AuthTokens;
}

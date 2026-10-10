import { apiPost } from '.././api';
import type { UserRow } from './user-row';
export function createUser(body: Record<string, unknown>): Promise<UserRow> {
  return apiPost<UserRow>('/users', body);
}

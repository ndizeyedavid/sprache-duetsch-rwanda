import { apiPatch } from '.././api';
import type { UserRow } from './user-row';
export function updateUser(id: string, body: Record<string, unknown>): Promise<UserRow> {
  return apiPatch<UserRow>(`/users/${id}`, body);
}

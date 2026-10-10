import { apiPatch } from '.././api';
import type { UserRow } from './user-row';
export function updateUserRole(id: string, role: string): Promise<UserRow> {
  return apiPatch<UserRow>(`/users/${id}/role`, { role });
}

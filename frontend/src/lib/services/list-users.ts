import { apiGet } from '.././api';
import type { UserRow } from './user-row';
export function listUsers(params?: {
  role?: string;
  status?: string;
  search?: string;
}): Promise<UserRow[]> {
  const query = new URLSearchParams({ pageSize: '100' });
  if (params?.role) query.set('role', params.role);
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  return apiGet<UserRow[]>(`/users?${query.toString()}`);
}

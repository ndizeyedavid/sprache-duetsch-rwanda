import { apiPatch } from '.././api';
export function updateMyProfile(body: Record<string, unknown>): Promise<{ id: string; email: string; firstName: string; lastName: string; phone: string | null; avatarUrl: string | null }> {
  return apiPatch('/auth/me', body);
}

import { apiDelete } from '.././api';
export function deleteLevel(id: string): Promise<{ id: string; code: string }> {
  return apiDelete<{ id: string; code: string }>(`/levels/${id}`);
}

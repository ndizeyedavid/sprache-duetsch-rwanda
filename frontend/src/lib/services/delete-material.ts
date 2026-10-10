import { apiDelete } from '.././api';
export function deleteMaterial(id: string): Promise<unknown> {
  return apiDelete(`/content/materials/${id}`);
}

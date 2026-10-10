import { apiDelete } from '.././api';
export function deleteLesson(id: string): Promise<unknown> {
  return apiDelete(`/content/lessons/${id}`);
}

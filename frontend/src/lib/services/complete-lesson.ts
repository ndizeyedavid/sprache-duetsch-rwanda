import { apiPost } from '.././api';
export function completeLesson(id: string): Promise<unknown> {
  return apiPost(`/content/my/lessons/${id}/progress`, { status: 'COMPLETED' });
}

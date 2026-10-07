import { api,apiGet } from './api';

export type Coursebook = { filename: string; pages: number; sizeBytes: number };
export function getCoursebook(levelId: string) {
  return apiGet<Coursebook | null>(`/content/my/levels/${levelId}/coursebook`);
}
export async function getCoursebookPdf(levelId: string, signal: AbortSignal): Promise<Blob> {
  const response = await api.get<Blob>(`/content/my/levels/${levelId}/coursebook/pdf`, { responseType: 'blob', signal });
  return response.data;
}

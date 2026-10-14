import { api } from './api';

export type ActivityFile = { fileUrl: string; mimeType: string; sizeBytes: number };

/** Student upload for a lesson activity (speaking recording or document submission). */
export async function uploadActivityFile(activityId: string, file: File): Promise<ActivityFile> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<{ success: boolean; data: ActivityFile }>(`/content/activities/${activityId}/files`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

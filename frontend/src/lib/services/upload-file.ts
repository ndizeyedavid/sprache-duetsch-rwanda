import { api } from '.././api';
import type { UploadResult } from './upload-result';
export async function uploadFile(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<{ success: boolean; data: UploadResult }>('/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

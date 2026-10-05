import { api, apiGet, apiPost, apiPut, downloadFile } from './api';
import type { Attachment, Homework, HomeworkDetail, HomeworkInput, StaffHomeworkDetail, Submission, RosterStudent } from '../components/assignments/homework/types';
export const listMyHomework = () => apiGet<Homework[]>('/assignments/my');
export const getHomework = (id: string) => apiGet<HomeworkDetail>(`/assignments/my/${id}`);
export const listStaffHomework = () => apiGet<Homework[]>('/assignments');
export const getStaffHomework = (id: string) => apiGet<StaffHomeworkDetail>(`/assignments/${id}`);
export const saveHomework = (body: HomeworkInput, id?: string) => id ? apiPut<Homework>(`/assignments/${id}`, body) : apiPost<Homework>('/assignments', body);
export const saveHomeworkDraft = (id: string, body: { text: string; fileIds: string[]; version: string | null }) => apiPut<Submission>(`/assignments/my/${id}/draft`, body);
export const submitHomework = (id: string, body: { text: string; fileIds: string[]; version: string | null }) => apiPost<Submission>(`/assignments/my/${id}/submit`, body);
export const reviewHomework = (id: string, submissionId: string, body: { action: 'GRADE' | 'RETURN'; score?: number; feedback: string; rubricScores: number[] }) => apiPost<Submission>(`/assignments/${id}/submissions/${submissionId}/review`, body);
export async function uploadHomeworkFile(id: string, file: File): Promise<Attachment> {
  const form = new FormData(); form.append('file', file);
  const { data } = await api.post<{ data: Attachment }>(`/assignments/my/${id}/files`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data.data;
}
export const downloadHomeworkFile = (id: string, file: Attachment) => downloadFile(`/assignments/${id}/files/${file.id}`, file.originalName);

export const getHomeworkRoster = (classId: string) => apiGet<RosterStudent[]>(`/assignments/classes/${classId}/students`);

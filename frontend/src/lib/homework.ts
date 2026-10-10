import type { Attachment,Homework,HomeworkDetail,HomeworkInput,RosterStudent,StaffHomeworkDetail,Submission } from '../components/assignments/homework/types';
import { api,apiDelete,apiGet,apiPatch,apiPost,apiPut,downloadFile } from './api';
export const listMyHomework = () => apiGet<Homework[]>('/assignments/my');
export const getHomework = (id: string) => apiGet<HomeworkDetail>(`/assignments/my/${id}`);
export const listStaffHomework = () => apiGet<Homework[]>('/assignments');
export const getStaffHomework = (id: string) => apiGet<StaffHomeworkDetail>(`/assignments/${id}`);
export const saveHomework = (body: HomeworkInput, id?: string) => id ? apiPut<Homework>(`/assignments/${id}`, body) : apiPost<Homework>('/assignments', body);
export const saveHomeworkDraft = (id: string, body: { text: string; responses?: Record<string, unknown>; fileIds: string[]; version: string | null }) => apiPut<Submission>(`/assignments/my/${id}/draft`, body);
export const submitHomework = (id: string, body: { text: string; responses?: Record<string, unknown>; fileIds: string[]; version: string | null }) => apiPost<Submission>(`/assignments/my/${id}/submit`, body);
export const reviewHomework = (id: string, submissionId: string, body: { action: 'GRADE' | 'RETURN'; score?: number; feedback: string; rubricScores: number[]; questionScores?: number[] }) => apiPost<Submission>(`/assignments/${id}/submissions/${submissionId}/review`, body);
export async function uploadHomeworkFile(id: string, file: File): Promise<Attachment> {
  const form = new FormData(); form.append('file', file);
  const { data } = await api.post<{ data: Attachment }>(`/assignments/my/${id}/files`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data.data;
}
export const downloadHomeworkFile = (id: string, file: Attachment) => downloadFile(`/assignments/${id}/files/${file.id}`, file.originalName);

export const getHomeworkRoster = (classId: string) => apiGet<RosterStudent[]>(`/assignments/classes/${classId}/students`);

export const changeHomeworkStatus = (id: string, status: Homework['status']) => apiPatch(`/assignments/${id}/status`, { status });
export const duplicateHomework = (id: string) => apiPost<Homework>(`/assignments/${id}/duplicate`);
export const deleteHomework = (id: string) => apiDelete(`/assignments/${id}`);
export const exportHomework = (id: string) => downloadFile(`/assignments/${id}/export`, 'assignment-results.csv');

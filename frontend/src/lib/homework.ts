import type { Attachment,Extension,Homework,HomeworkDetail,HomeworkInput,RosterStudent,StaffHomeworkDetail,Submission } from '../components/assignments/homework/types';
import { api,apiDelete,apiGet,apiPatch,apiPost,apiPut,downloadFile } from './api';
export const listMyHomework = (lessonId?: string) => apiGet<Homework[]>('/assignments/my', lessonId ? { params: { lessonId } } : undefined);
export const getHomework = (id: string) => apiGet<HomeworkDetail>(`/assignments/my/${id}`);
export const listStaffHomework = () => apiGet<Homework[]>('/assignments');
export const getStaffHomework = (id: string) => apiGet<StaffHomeworkDetail>(`/assignments/${id}`);
export const saveHomework = (body: HomeworkInput, id?: string) => id ? apiPut<Homework>(`/assignments/${id}`, body) : apiPost<Homework>('/assignments', body);
export const saveHomeworkDraft = (id: string, body: { text: string; responses?: Record<string, unknown>; fileIds: string[]; version: string | null }) => apiPut<Submission>(`/assignments/my/${id}/draft`, body);
export const submitHomework = (id: string, body: { text: string; responses?: Record<string, unknown>; fileIds: string[]; version: string | null }) => apiPost<Submission>(`/assignments/my/${id}/submit`, body);
export type PenaltyOverride = { percent: number; reason: string };
export const reviewHomework = (id: string, submissionId: string, body: { action: 'GRADE' | 'RETURN'; score?: number; feedback: string; rubricScores: number[]; questionScores?: number[]; feedbackAudioFileId?: string | null; penaltyOverride?: PenaltyOverride }) => apiPost<Submission>(`/assignments/${id}/submissions/${submissionId}/review`, body);
async function upload(path: string, file: File): Promise<Attachment> {
  const form = new FormData(); form.append('file', file);
  const { data } = await api.post<{ data: Attachment }>(path, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data.data;
}
export const uploadHomeworkFile = (id: string, file: File) => upload(`/assignments/my/${id}/files`, file);
/** Teacher's recorded or uploaded audio feedback; attach the returned id when sending the review. */
export const uploadFeedbackAudio = (id: string, file: File) => upload(`/assignments/${id}/feedback-audio`, file);
export const overrideLatePenalty = (id: string, submissionId: string, body: PenaltyOverride) => apiPatch<Submission>(`/assignments/${id}/submissions/${submissionId}/penalty`, body);
export const grantExtension = (id: string, studentId: string, body: { dueAt: string; reason?: string }) => apiPut<Extension>(`/assignments/${id}/extensions/${studentId}`, body);
export const removeExtension = (id: string, studentId: string) => apiDelete(`/assignments/${id}/extensions/${studentId}`);
export type ClassLesson = { id: string; title: string; order: number; isPublished: boolean; module: { id: string; title: string; order: number } };
export const getClassLessons = (classId: string) => apiGet<ClassLesson[]>(`/assignments/classes/${classId}/lessons`);
export const downloadHomeworkFile = (id: string, file: Attachment) => downloadFile(`/assignments/${id}/files/${file.id}`, file.originalName);

export const getHomeworkRoster = (classId: string) => apiGet<RosterStudent[]>(`/assignments/classes/${classId}/students`);

export const changeHomeworkStatus = (id: string, status: Homework['status']) => apiPatch(`/assignments/${id}/status`, { status });
export const duplicateHomework = (id: string) => apiPost<Homework>(`/assignments/${id}/duplicate`);
export const deleteHomework = (id: string) => apiDelete(`/assignments/${id}`);
export const exportHomework = (id: string) => downloadFile(`/assignments/${id}/export`, 'assignment-results.csv');

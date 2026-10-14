import { apiGet,apiPost,apiPut } from '../api';
import type {
MyPlacement,
PlacementQueueItem,
PlacementSession,
PlacementSubmitResult,
StaffPlacementResult,
StudentPlacements,
} from './placement-types';

// Student self-service placement test (works before enrolment and payment).
export const getMyPlacement = () => apiGet<MyPlacement>('/students/me/placement');

export const startMyPlacement = () => apiPost<PlacementSession>('/students/me/placement/start', {});

export const saveMyPlacementDraft = (attemptId: string, responses: Record<string, unknown>) =>
  apiPut<{ saved: boolean }>(`/students/me/placement/attempts/${attemptId}/draft`, { responses });

export const submitMyPlacement = (attemptId: string, answers: { questionId: string; response: unknown }[]) =>
  apiPost<PlacementSubmitResult>(`/students/me/placement/attempts/${attemptId}/submit`, { answers });

// Academic admin + super admin.
export const getPlacementQueue = () => apiGet<PlacementQueueItem[]>('/students/placements/queue');

export const getStudentPlacements = (studentId: string) => apiGet<StudentPlacements>(`/students/${studentId}/placements`);

export const decidePlacement = (studentId: string, resultId: string, body: { assignedLevelId: string; overrideReason?: string }) =>
  apiPost<StaffPlacementResult>(`/students/${studentId}/placements/${resultId}/decision`, body);

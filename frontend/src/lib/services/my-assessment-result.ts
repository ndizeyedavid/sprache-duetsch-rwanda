import { apiGet } from '../api';

export type ResultPart = { skill: string; score: number; maxScore: number; pending: boolean };
export type MyAssessmentResult = { attemptId: string; status: string; parts: ResultPart[] };

/** The latest submitted attempt split by skill (Hören, Lesen, Schreiben…); null before any submission. */
export function getMyAssessmentResult(assessmentId: string): Promise<MyAssessmentResult | null> {
  return apiGet<MyAssessmentResult | null>(`/assessments/my/assessments/${assessmentId}/result`);
}

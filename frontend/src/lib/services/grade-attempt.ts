import { apiPost } from '.././api';
export function gradeAttempt(
  id: string,
  body: {
    answers?: { answerId: string; pointsAwarded: number; feedback?: string }[];
    feedback?: string;
    passed?: boolean;
  },
): Promise<unknown> {
  return apiPost(`/assessments/attempts/${id}/grade`, body);
}

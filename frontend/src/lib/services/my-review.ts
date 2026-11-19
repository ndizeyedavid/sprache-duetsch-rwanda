import { apiGet,apiPost } from '.././api';
import type { PracticeProgress } from './get-my-practice-progress';

/** Today's review for a level: recent mistakes first, then words from completed lessons (course v2). */
export type MyReview = { v: 2; session: 'review'; titleEn: string; mistakes: number; items: unknown[]; glossary: Record<string, [string] | [string, string]> };

export function getMyReview(levelId: string): Promise<MyReview> {
  return apiGet<MyReview>(`/content/my/review/${levelId}`);
}

export function saveMyReview(levelId: string, payload: { results: Record<string, boolean>; seconds: number }): Promise<{ xp: number; progress: PracticeProgress }> {
  return apiPost<{ xp: number; progress: PracticeProgress }>(`/content/my/review/${levelId}`, payload);
}

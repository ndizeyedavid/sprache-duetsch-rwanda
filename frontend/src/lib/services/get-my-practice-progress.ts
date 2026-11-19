import { apiGet } from '.././api';

/** Course v2 learning progress: XP today against the daily goal, streak, last 7 days. */
export type PracticeProgress = { xpToday: number; dailyGoal: number; streak: number; totalXp: number; week: { date: string; xp: number }[] };

export function getMyPracticeProgress(): Promise<PracticeProgress> {
  return apiGet<PracticeProgress>('/content/my/progress');
}

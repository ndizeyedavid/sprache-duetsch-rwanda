import { apiGet } from './api';

/** Per-level catalogue numbers for the admin Courses page (GET /content/levels/overview). */
export type LevelOverview = {
  levelId: string;
  modules: number;
  lessons: number;
  publishedLessons: number;
  activities: number;
  minutes: number;
  covers: string[];
  students: number;
  classes: number;
  teachers: number;
};

export const getLevelsOverview = () => apiGet<LevelOverview[]>('/content/levels/overview');

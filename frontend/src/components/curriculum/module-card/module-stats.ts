import type { ModuleItem } from '../../../lib/services';

export type ModuleStats = { lessons: number; published: number; activities: number; minutes: number; covers: string[] };

export function moduleStats(module: ModuleItem): ModuleStats {
  const lessons = module.lessons;
  return {
    lessons: lessons.length,
    published: lessons.filter((lesson) => lesson.isPublished).length,
    activities: lessons.reduce((sum, lesson) => sum + (lesson._count?.activities ?? 0), 0),
    minutes: lessons.reduce((sum, lesson) => sum + (lesson.estimatedMinutes ?? 0), 0),
    covers: lessons.flatMap((lesson) => (lesson.coverUrl ? [lesson.coverUrl] : [])).slice(0, 3),
  };
}

/** Seed placeholders moved below zero by the course imports: kept for history, hidden from the main grid. */
export const isArchived = (module: ModuleItem) => module.order < 0 && !module.isPublished;

export function studyTime(minutes: number): string {
  if (!minutes) return '—';
  const hours = Math.floor(minutes / 60), rest = minutes % 60;
  return hours ? `${hours} h${rest ? ` ${rest} min` : ''}` : `${rest} min`;
}

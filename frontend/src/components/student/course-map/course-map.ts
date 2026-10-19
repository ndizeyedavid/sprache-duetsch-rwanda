import type { MyCourse,MyLesson } from '../../../lib/services';

export type StopState = 'done' | 'current' | 'upcoming';
export type MapStop = {
  id: string; number: number; title: string; description: string | null;
  lessons: MyLesson[]; done: number; total: number; state: StopState;
  /** Lesson to open: the one in progress, else the first unfinished, else the first. */
  target: MyLesson | null; cover: string | null; covers: string[]; minutes: number;
};

const byOrder = <T extends { order: number }>(items: T[]) => [...items].sort((a, b) => a.order - b.order);

/** Modules as stops on the learner's path, with exactly one "current" stop until the course is done. */
export function courseStops(course: MyCourse): MapStop[] {
  const modules = byOrder(course.modules);
  const all = modules.flatMap((module) => byOrder(module.lessons));
  const next = all.find((lesson) => lesson.progressStatus === 'IN_PROGRESS') ?? all.find((lesson) => lesson.progressStatus !== 'COMPLETED');
  return modules.map((module, index) => {
    const lessons = byOrder(module.lessons);
    const done = lessons.filter((lesson) => lesson.progressStatus === 'COMPLETED').length;
    const covers = lessons.flatMap((lesson) => (lesson.coverUrl ? [lesson.coverUrl] : []));
    const state: StopState = lessons.some((lesson) => lesson.id === next?.id) ? 'current' : lessons.length > 0 && done === lessons.length ? 'done' : 'upcoming';
    return {
      id: module.id, number: index + 1, title: module.title, description: module.description, lessons, done, total: lessons.length, state,
      target: lessons.find((l) => l.progressStatus === 'IN_PROGRESS') ?? lessons.find((l) => l.progressStatus !== 'COMPLETED') ?? lessons[0] ?? null,
      cover: covers[0] ?? null, covers, minutes: lessons.reduce((sum, lesson) => sum + (lesson.estimatedMinutes ?? 0), 0),
    };
  });
}

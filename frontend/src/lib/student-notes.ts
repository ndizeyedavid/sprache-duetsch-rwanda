import { apiGet } from './api';
import type { LessonMaterial } from './services/lesson-material';

/** A note/PDF/worksheet/slide the student may read, with the lesson it belongs to. */
export type StudentNote = LessonMaterial & {
  lessonId: string;
  lesson: { id: string; title: string; module: { id: string; title: string; levelId: string } };
};

/** Every released note for the student's levels in one small request (titles + links, no file bodies). */
export function listMyNotes(): Promise<StudentNote[]> {
  return apiGet<StudentNote[]>('/content/my/notes?pageSize=100');
}

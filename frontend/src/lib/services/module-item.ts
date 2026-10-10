import type { ModuleLesson } from './module-lesson';
export type ModuleItem = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isPublished: boolean;
  lessons: ModuleLesson[];
  _count?: { lessons: number };
};

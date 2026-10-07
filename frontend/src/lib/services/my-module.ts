import type { MyLesson } from './my-lesson';
export type MyModule = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: MyLesson[];
};

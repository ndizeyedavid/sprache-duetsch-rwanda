export type ModuleLesson = {
  id: string;
  title: string;
  order: number;
  contentType: string;
  isPublished: boolean;
  estimatedMinutes: number | null;
};

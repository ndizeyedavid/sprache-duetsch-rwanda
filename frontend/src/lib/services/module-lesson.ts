export type ModuleLesson = {
  id: string;
  title: string;
  order: number;
  contentType: string;
  isPublished: boolean;
  estimatedMinutes: number | null;
  /** Lead photo from the lesson body (CMS list only). */
  coverUrl?: string | null;
  _count?: { activities: number };
};

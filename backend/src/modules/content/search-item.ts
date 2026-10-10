export interface SearchItem {
  id: string;
  type: "MODULE" | "LESSON" | "MATERIAL";
  title: string;
  snippet: string | null;
  levelId: string;
  moduleId: string | null;
  lessonId: string | null;
  createdAt: Date;
}

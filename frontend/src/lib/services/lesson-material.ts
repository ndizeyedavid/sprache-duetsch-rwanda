export type LessonMaterial = {
  id: string;
  title: string;
  type: string;
  url: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  isDownloadable: boolean;
  createdAt: string;
};

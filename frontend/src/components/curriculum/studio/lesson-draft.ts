import type { AuthoredLesson } from '../../../lib/services';

export function toLessonDraft(data: AuthoredLesson) {
  return {
    title: data.title, description: data.description ?? '', body: data.body ?? '',
    videoUrl: data.videoUrl ?? '', audioUrl: data.audioUrl ?? '', contentType: data.contentType,
    estimatedMinutes: data.estimatedMinutes == null ? '' : String(data.estimatedMinutes), isPublished: data.isPublished,
  };
}
export type LessonDraft = ReturnType<typeof toLessonDraft>;
export type ChangeLesson = <K extends keyof LessonDraft>(key: K, value: LessonDraft[K]) => void;
export const formatNames: Record<string, string> = { TEXT: 'Reading', VIDEO: 'Video', AUDIO: 'Listening', PDF: 'Document', MIXED: 'Mixed lesson' };
export const lessonStructure = '<h2>What you will learn</h2><p>By the end of this lesson, you can…</p><h2>Learn with examples</h2><p>Introduce the topic and add an example.</p><h2>Your turn</h2><p>Try using what you have learned.</p>';

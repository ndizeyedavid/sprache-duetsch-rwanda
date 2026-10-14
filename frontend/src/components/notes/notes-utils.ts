import type { StudentNote } from '../../lib/student-notes';

export type NoteLessonGroup = { lessonId: string; lessonTitle: string; notes: StudentNote[] };
export type NoteModuleGroup = { moduleId: string; moduleTitle: string; levelId: string; lessons: NoteLessonGroup[] };

/** Filter chips, in the order students think about them. Only types present are shown. */
export const NOTE_TYPES = [
  { id: 'NOTE', label: 'Notes' },
  { id: 'PDF', label: 'PDFs' },
  { id: 'WORKSHEET', label: 'Worksheets' },
  { id: 'SLIDE', label: 'Slides' },
] as const;

export function noteTypeLabel(type: string): string {
  return NOTE_TYPES.find(item => item.id === type)?.label.replace(/s$/, '') ?? type.charAt(0) + type.slice(1).toLowerCase();
}

const byTitle = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

/** Case-insensitive match on the note, lesson and module titles, optionally limited to one type. */
export function filterNotes(notes: StudentNote[], query: string, type: string | null): StudentNote[] {
  const needle = query.trim().toLowerCase();
  return notes.filter(note => {
    if (type && note.type !== type) return false;
    if (!needle) return true;
    return [note.title, note.lesson.title, note.lesson.module.title].some(text => text.toLowerCase().includes(needle));
  });
}

/** Module → lesson → notes, modules and lessons in natural title order ("Modul 2" before "Modul 10"). */
export function groupNotes(notes: StudentNote[]): NoteModuleGroup[] {
  const modules = new Map<string, NoteModuleGroup>();
  for (const note of notes) {
    const { module } = note.lesson;
    let group = modules.get(module.id);
    if (!group) {
      group = { moduleId: module.id, moduleTitle: module.title, levelId: module.levelId, lessons: [] };
      modules.set(module.id, group);
    }
    let lesson = group.lessons.find(item => item.lessonId === note.lesson.id);
    if (!lesson) {
      lesson = { lessonId: note.lesson.id, lessonTitle: note.lesson.title, notes: [] };
      group.lessons.push(lesson);
    }
    lesson.notes.push(note);
  }
  const groups = [...modules.values()].sort((a, b) => byTitle(a.moduleTitle, b.moduleTitle));
  for (const group of groups) {
    group.lessons.sort((a, b) => byTitle(a.lessonTitle, b.lessonTitle));
    for (const lesson of group.lessons) lesson.notes.sort((a, b) => byTitle(a.title, b.title));
  }
  return groups;
}

export function formatBytes(bytes: number | null): string | null {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

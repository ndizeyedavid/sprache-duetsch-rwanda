import { localiseLegacyPhotos, stripGeneratedPhotos } from "./figure.js";

export type LessonRow = { id: string; title: string; body: string | null; level: string };
export type PhotoChange = { id: string; title: string; level: string; reason: string; before: string; after: string };

/**
 * What each lesson body should become. Only photo markup changes: hotlinked, credited Unsplash
 * figures become local caption-free ones, and AI-generated photos are removed (real photos only).
 * Any text staff edited after an import is left exactly as it is.
 */
export function planPhotoChanges(lessons: LessonRow[]): PhotoChange[] {
  const changes: PhotoChange[] = [];
  for (const lesson of lessons) {
    if (!lesson.body) continue;
    const reasons: string[] = [];
    let after = localiseLegacyPhotos(lesson.body);
    if (after !== lesson.body) reasons.push("self-host photo, drop credit");
    const stripped = stripGeneratedPhotos(after);
    if (stripped !== after) reasons.push("remove AI-generated photo");
    after = stripped;
    if (reasons.length) changes.push({ id: lesson.id, title: lesson.title, level: lesson.level, reason: reasons.join(" + "), before: lesson.body, after });
  }
  return changes;
}

/** Every local photo file the given bodies point at. */
export function referencedPhotos(bodies: string[]): Set<string> {
  const files = new Set<string>();
  for (const body of bodies) for (const match of body.matchAll(/src="\/coursebook\/photos\/([^"]+)"/g)) files.add(match[1]);
  return files;
}

// One lead photo per lesson, self-hosted by the frontend (public/coursebook/photos/*.webp).
// Every photo is a real photograph under the Unsplash licence (free to use without attribution),
// copied locally — so lessons carry no credit line and never hotlink. No AI-generated images.

const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const esc = (value: string) => value.replace(/[&<>"]/g, (c) => entities[c]);

/** Public path of a lesson photo, e.g. `/coursebook/photos/a1-05.webp`. */
export const photoPath = (file: string) => `/coursebook/photos/${file}.webp`;

/** Marker class so scripts can tell a lead photo apart from coursebook illustrations. */
export const PHOTO_CLASS = "lesson-photo";

export function photoFigure(file: string, alt: string): string {
  return `<figure class="${PHOTO_CLASS}"><img src="${esc(photoPath(file))}" alt="${esc(alt)}" width="800" height="533" loading="lazy" decoding="async"></figure>`;
}

/** Old imports hotlinked Unsplash with a photographer caption; capture id + alt to rewrite them. */
export const LEGACY_FIGURE = /<figure><img src="https:\/\/images\.unsplash\.com\/(photo-[\w-]+)\?[^"]*" alt="([^"]*)"[^>]*>(?:<figcaption>[\s\S]*?<\/figcaption>)?<\/figure>/g;

const unescape = (value: string) => value.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/** The same photo after a staff edit in the rich-text editor: bare <img> plus a "Foto: … auf Unsplash" paragraph. */
export const EDITED_LEGACY_IMAGE = /<img src="https:\/\/images\.unsplash\.com\/(photo-[\w-]+)\?[^"]*" alt="([^"]*)"[^>]*>(?:\s*<p>Foto:(?:(?!<\/p>)[\s\S])*?Unsplash<\/a><\/p>)?/g;

/** Swap any hotlinked, credited Unsplash photo (imported or editor-rewritten) for the local, caption-free one. */
export function localiseLegacyPhotos(body: string): string {
  return body
    .replace(LEGACY_FIGURE, (_match, id: string, alt: string) => photoFigure(id, unescape(alt)))
    .replace(EDITED_LEGACY_IMAGE, (_match, id: string, alt: string) => photoFigure(id, unescape(alt)));
}

/** Put the lead photo straight under the first "Lernziele" heading; no-op if one is already there. */
export function withLeadPhoto(body: string, file: string, alt: string): string {
  if (body.includes(`class="${PHOTO_CLASS}"`)) return body;
  const heading = /<h2>Lernziele<\/h2>/;
  const figure = photoFigure(file, alt);
  return heading.test(body) ? body.replace(heading, (h) => `${h}\n${figure}`) : `${figure}\n${body}`;
}

/** The AI-generated unit photos once added to the A1 coursebook edition (a1-NN.webp); removed for real-photo-only lessons. */
export const GENERATED_A1_FIGURE = /\n?<figure class="lesson-photo"><img src="\/coursebook\/photos\/a1-\d{2}\.webp"[^>]*><\/figure>/g;

export const stripGeneratedPhotos = (body: string) => body.replace(GENERATED_A1_FIGURE, "");

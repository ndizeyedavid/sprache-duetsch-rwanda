// Render a course lesson as the same sanitised HTML the A1 coursebook uses: every <h2> becomes
// one page in the student reader (CourseLessonReader), tables sit in .course-table-wrap.
import { photoFigure } from "../lesson-photos/figure.js";
import type { CourseGrammar, CourseLesson, CoursePhoto, CourseTable } from "./types.js";

const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
export const esc = (value: string) => value.replace(/[&<>"]/g, (c) => entities[c]);
const list = (items: string[]) => `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

/** Lead photo, self-hosted and caption-free (see lesson-photos/figure.ts). */
const figure = (photo: CoursePhoto) => photoFigure(photo.id, photo.alt);

function table({ kopf, zeilen }: CourseTable) {
  const rowHeader = kopf[0] === "";
  const head = `<thead><tr>${kopf.map((cell) => `<th scope="col">${esc(cell)}</th>`).join("")}</tr></thead>`;
  const rows = zeilen.map((row) => `<tr>${row.map((cell, i) => (i === 0 && rowHeader
    ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`)).join("")}</tr>`);
  return `<div class="course-table-wrap"><table>${head}<tbody>${rows.join("")}</tbody></table></div>`;
}

function grammar(topic: CourseGrammar) {
  const parts = [`<h2>Grammatik: ${esc(topic.titel)}</h2>`, `<p>${esc(topic.erklaerung)}</p>`];
  if (topic.tabelle) parts.push(table(topic.tabelle));
  if (topic.beispiele.length) {
    parts.push("<h3>Beispiele</h3>", list(topic.beispiele.map((b) =>
      `${esc(b.de)}${b.hinweis ? `<br><em>${esc(b.hinweis)}</em>` : ""}`)));
  }
  if (topic.tipp) parts.push(`<blockquote><p><strong>Tipp:</strong> ${esc(topic.tipp)}</p></blockquote>`);
  return parts.join("\n");
}

export function renderLessonBody(lesson: CourseLesson): string {
  const sections = [
    "<h2>Lernziele</h2>",
    ...(lesson.bild ? [figure(lesson.bild)] : []),
    `<p><strong>${esc(lesson.kurz)}</strong></p>`,
    ...(lesson.textsorte ? [`<p><strong>Textsorte:</strong> ${esc(lesson.textsorte)}</p>`] : []),
    ...(lesson.pruefung ? [`<p><strong>Prüfungsbezug:</strong> ${esc(lesson.pruefung)}</p>`] : []),
    "<p>Nach dieser Lektion können Sie:</p>",
    list(lesson.lernziele.map(esc)),
    ...lesson.grammatik.map(grammar),
    "<h2>Wortschatz</h2>",
    "<p>Die wichtigsten Wörter der Lektion mit englischer (EN) und französischer (FR) Übersetzung. Üben Sie sie danach mit den Lernkarten.</p>",
    list(lesson.wortschatz.map((w) =>
      `<strong>${esc(w.wort)}</strong> — EN: ${esc(w.en)} · FR: <span lang="fr">${esc(w.fr)}</span><br><em>${esc(w.beispiel)}</em>`)),
    "<h2>Redemittel</h2>",
    ...lesson.redemittel.flatMap((group) => [`<h3>${esc(group.funktion)}</h3>`, list(group.saetze.map(esc))]),
    ...(lesson.dialog ? [
      `<h2>Dialog: ${esc(lesson.dialog.titel)}</h2>`,
      ...lesson.dialog.zeilen.map((line) => `<p><strong>${esc(line.wer)}:</strong> ${esc(line.text)}</p>`),
    ] : []),
  ];
  return sections.join("\n");
}

/** Reading time: intro + grammar topics + vocabulary + exercises (+ writing task), rounded to 5 minutes. */
export function estimateMinutes(lesson: CourseLesson): number {
  const raw = 15 + lesson.grammatik.length * 10 + lesson.wortschatz.length + lesson.uebungen.length * 2
    + (lesson.schreibaufgabe ? 20 : 0);
  return Math.round(raw / 5) * 5;
}

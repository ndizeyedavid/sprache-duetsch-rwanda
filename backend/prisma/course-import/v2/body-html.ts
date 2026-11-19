// Lesson.body for course v2 lessons: the same lesson as plain HTML with the English beside the German.
// Students get the interactive view from Lesson.content; staff tools and older clients read this.
import { esc } from "../html-course/body.js";
import { photoFigure } from "../lesson-photos/figure.js";
import type { LessonContent, Line } from "./content-types.js";

const pair = (line: Line) => `${esc(line.de)}<br><em>${esc(line.en)}</em>`;
const list = (items: string[]) => `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

function table(head: string[], rows: string[][]) {
  const th = head.map((cell) => `<th scope="col">${esc(cell)}</th>`).join("");
  const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("");
  return `<div class="course-table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></div>`;
}

export function renderV2Body(content: LessonContent, photoId?: string): string {
  const parts = [
    "<h2>Lernziele · Goals</h2>",
    ...(photoId && content.photo ? [photoFigure(photoId, content.photo.alt)] : []),
    `<p><strong>${esc(content.summary)}</strong><br><em>${esc(content.summaryEn)}</em></p>`,
    ...(content.exam ? [`<p><strong>Prüfung · Exam:</strong> ${esc(content.exam)}</p>`] : []),
    list(content.goals.map(pair)),
    "<h2>Wortschatz · Words</h2>",
    list(content.vocab.map((word) => `<strong>${esc(word.de)}</strong> — ${esc(word.en)}<br>${esc(word.example)} <em>(${esc(word.exampleEn)})</em>`)),
    ...content.grammar.flatMap((topic) => [
      `<h2>Grammatik: ${esc(topic.title)}</h2>`,
      `<p><em>${esc(topic.titleEn)}</em></p>`,
      `<p>${esc(topic.explanation)}</p>`,
      `<p><em>${esc(topic.explanationEn)}</em></p>`,
      ...(topic.table ? [table(topic.table.head, topic.table.rows)] : []),
      "<h3>Beispiele · Examples</h3>",
      list(topic.examples.map(pair)),
      ...(topic.tip ? [`<blockquote><p><strong>Tipp:</strong> ${esc(topic.tip)}${topic.tipEn ? `<br><em>${esc(topic.tipEn)}</em>` : ""}</p></blockquote>`] : []),
    ]),
    "<h2>Redemittel · Useful phrases</h2>",
    ...content.phrases.flatMap((group) => [`<h3>${esc(group.function)} · ${esc(group.functionEn)}</h3>`, list(group.items.map(pair))]),
    ...(content.pronunciation ? [
      `<h2>Aussprache: ${esc(content.pronunciation.focus)}</h2>`,
      `<p>${esc(content.pronunciation.explanation)}<br><em>${esc(content.pronunciation.explanationEn)}</em></p>`,
      list(content.pronunciation.examples.map(pair)),
    ] : []),
    ...(content.dialogue ? [
      `<h2>Dialog: ${esc(content.dialogue.title)}</h2>`,
      ...content.dialogue.lines.map((line) => `<p><strong>${esc(line.speaker)}:</strong> ${esc(line.de)}<br><em>${esc(line.en)}</em></p>`),
    ] : []),
    ...(content.reading ? [
      `<h2>Lesen: ${esc(content.reading.title)}</h2>`,
      ...content.reading.paragraphs.map((paragraph) => `<p>${paragraph.map((line) => esc(line.de)).join(" ")}<br><em>${paragraph.map((line) => esc(line.en)).join(" ")}</em></p>`),
    ] : []),
  ];
  return parts.join("\n");
}

// Answer keys for the online answer sheet of an exam paper. Staff type one line per exam part:
//   Lesen Teil 1 | a b c | b b c b a
//   Hören Teil 4 | Ja Nein | Ja Nein Ja Ja Nein
// (part title | the choices on the answer sheet | the right choice for each item, in order).
// Items are numbered per section — the title's first word (Lesen, Hören) — and the numbers continue
// across that section's parts, like the official answer sheets.
import { z } from "zod";
import { badRequest } from "../../lib/http-error.js";

export const answerKeySchema = z.object({
  parts: z.array(z.object({
    title: z.string().trim().min(1).max(60),
    options: z.array(z.string().trim().min(1).max(20)).min(2).max(12),
    answers: z.array(z.string().trim().min(1).max(20)).min(1).max(30),
  })).min(1).max(20),
});
export type AnswerKey = z.infer<typeof answerKeySchema>;

const words = (value: string) => value.split(/[\s,;]+/).filter(Boolean);
const sectionOf = (title: string) => (title.split(/\s+/)[0] ?? title).replace(/[,:]$/, "");

/** Parse the staff text format (null when empty); a bad line is a 400 naming the line. */
export function parseAnswerKey(text: string | null | undefined): AnswerKey | null {
  const lines = (text ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return null;
  const parts = lines.map((line, at) => {
    const [title = "", choices = "", answers = "", ...extra] = line.split("|").map((cell) => cell.trim());
    const options = words(choices);
    const lower = options.map((option) => option.toLowerCase());
    const given = words(answers);
    if (!title || extra.length || options.length < 2 || !given.length) throw badRequest(`Answer key line ${at + 1}: write "Part title | choices | answers"`);
    const wrong = given.find((answer) => !lower.includes(answer.toLowerCase()));
    if (wrong) throw badRequest(`Answer key line ${at + 1}: "${wrong}" is not one of the choices`);
    // Answers keep the choice's own spelling ("Ja", not "ja").
    return { title, options, answers: given.map((answer) => options[lower.indexOf(answer.toLowerCase())] ?? answer) };
  });
  const parsed = answerKeySchema.safeParse({ parts });
  if (!parsed.success) throw badRequest("Answer key is too long: at most 20 parts of 30 items with short choices");
  return parsed.data;
}

export function readAnswerKey(value: unknown): AnswerKey | null {
  const parsed = answerKeySchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function formatAnswerKey(key: AnswerKey | null): string {
  return key ? key.parts.map((part) => `${part.title} | ${part.options.join(" ")} | ${part.answers.join(" ")}`).join("\n") : "";
}

/** What students fill in: each part's choices and item numbers, without the answers. */
export function answerSheet(key: AnswerKey) {
  const counters = new Map<string, number>();
  return key.parts.map((part) => {
    const section = sectionOf(part.title).toLowerCase();
    const first = (counters.get(section) ?? 0) + 1;
    counters.set(section, first + part.answers.length - 1);
    return { title: part.title, options: part.options, first, count: part.answers.length };
  });
}

/** Mark a filled sheet: `responses[part][item]` is the chosen option, or null when left empty. */
export function markSheet(key: AnswerKey, responses: (string | null)[][]) {
  const sheet = answerSheet(key);
  const parts = key.parts.map((part, at) => {
    const items = part.answers.map((answer, item) => {
      const given = responses[at]?.[item] ?? null;
      return { number: (sheet[at]?.first ?? 1) + item, given, answer, correct: given?.toLowerCase() === answer.toLowerCase() };
    });
    return { title: part.title, score: items.filter((item) => item.correct).length, total: items.length, items };
  });
  const sections = new Map<string, { name: string; score: number; total: number }>();
  for (const part of parts) {
    const name = sectionOf(part.title);
    const entry = sections.get(name.toLowerCase()) ?? { name, score: 0, total: 0 };
    entry.score += part.score;
    entry.total += part.total;
    sections.set(name.toLowerCase(), entry);
  }
  const score = parts.reduce((sum, part) => sum + part.score, 0);
  const total = parts.reduce((sum, part) => sum + part.total, 0);
  return { score, total, percentage: total ? Math.round(score / total * 100) : 0, sections: [...sections.values()], parts };
}

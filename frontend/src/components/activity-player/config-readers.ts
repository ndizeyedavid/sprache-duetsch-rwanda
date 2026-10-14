import type { ActivityConfig,FileResponse } from './types';

/**
 * Readers for activity configs. They accept the sanitized student shape and the
 * raw authoring shape, so the same players power the student page and the
 * teacher's live preview.
 */
export const text = (value: unknown): string => typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
const record = (value: unknown): ActivityConfig => value && typeof value === 'object' && !Array.isArray(value) ? value as ActivityConfig : {};
const strings = (value: unknown): string[] => Array.isArray(value) ? value.map(text) : [];

export type ChoiceQuestion = { prompt: string; options: string[] };

export function choiceQuestions(config: ActivityConfig): ChoiceQuestion[] {
  if (Array.isArray(config.questions)) return config.questions.map(row => { const q = record(row); return { prompt: text(q.prompt ?? q.question), options: strings(q.options) }; });
  return Array.isArray(config.options) ? [{ prompt: text(config.question ?? config.prompt), options: strings(config.options) }] : [];
}

export function blankSentences(config: ActivityConfig): string[] {
  if (Array.isArray(config.sentences)) return config.sentences.map(row => text(record(row).text));
  return [text(config.text ?? config.sentence ?? config.prompt)];
}

export function matchingSides(config: ActivityConfig): { left: string[]; right: string[] } {
  if (Array.isArray(config.left) && Array.isArray(config.right)) return { left: strings(config.left), right: strings(config.right) };
  const pairs = Array.isArray(config.pairs) ? config.pairs.map(record) : [];
  return { left: pairs.map(pair => text(pair.left)), right: pairs.map(pair => text(pair.right)) };
}

export const orderingItems = (config: ActivityConfig): string[] => strings(config.items ?? config.options ?? config.answer);

export type Card = { front: string; back: string; example: string; audioUrl: string };
export const flashcards = (config: ActivityConfig): Card[] => (Array.isArray(config.cards) ? config.cards : []).map(row => {
  const card = record(row);
  return { front: text(card.front ?? card.word ?? card.term), back: text(card.back ?? card.translation ?? card.meaning), example: text(card.example), audioUrl: text(card.audioUrl) };
});

export const isDocumentSubmission = (type: string, config: ActivityConfig) => type === 'WRITING' && config.isDocumentSubmission === true;

export function asFileResponse(value: unknown): FileResponse | null {
  const row = record(value);
  return typeof row.fileUrl === 'string' && row.fileUrl ? { fileUrl: row.fileUrl, mimeType: text(row.mimeType) || undefined, text: text(row.text) || undefined, durationSeconds: typeof row.durationSeconds === 'number' ? row.durationSeconds : undefined } : null;
}

export const wordCount = (value: string) => value.trim() ? value.trim().split(/\s+/).length : 0;

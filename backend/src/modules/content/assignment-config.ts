import type { Prisma } from '../../generated/prisma/client.js';
/** Keep answer keys on the server for graded lesson activities. */
export const sanitizeActivityConfig = (value: Prisma.JsonValue, type?: string): Prisma.JsonValue => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const hidden = new Set(['answer', 'answers', 'correctAnswer', 'correctIndex', 'correctIndices', 'correct', 'sampleAnswer', 'modelAnswer', 'explanation']);
  const clean = (entry: Prisma.JsonValue): Prisma.JsonValue => {
    if (Array.isArray(entry)) return entry.map(clean);
    if (!entry || typeof entry !== 'object') return entry;
    return Object.fromEntries(Object.entries(entry).filter(([key]) => !hidden.has(key)).map(([key, item]) => [key, clean(item!)]));
  };
  const result = clean(value) as Prisma.JsonObject;
  result.autoGraded = ['FILL_BLANK', 'MCQ', 'TRUE_FALSE', 'ORDERING', 'LISTENING', 'MULTIPLE_SELECT'].includes(type ?? '') || Array.isArray(value.items);
  if (type === "ORDERING" && !Array.isArray(result.options) && Array.isArray(value.answer)) result.options = [...value.answer].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return result;
};

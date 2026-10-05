import type { Prisma } from '../../generated/prisma/client.js';
/** Keep answer keys on the server for graded lesson activities. */
export const sanitizeActivityConfig = (value: Prisma.JsonValue, type?: string): Prisma.JsonValue => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const hidden = new Set(['answer', 'answers', 'correctAnswer', 'correctIndex', 'correctIndices', 'correct', 'sampleAnswer']);
  const result = Object.fromEntries(Object.entries(value).filter(([key]) => !hidden.has(key)));
  if (type === "ORDERING" && !Array.isArray(result.options) && Array.isArray(value.answer)) result.options = value.answer;
  return result;
};

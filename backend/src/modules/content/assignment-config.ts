import type { Prisma } from '../../generated/prisma/client.js';
import { gradeActivity } from './activity-grading.js';
import { asConfig,matchingPairs,orderingKey } from './activity-keys.js';
import { stableShuffle } from './activity-shuffle.js';

/** Keys that reveal answers (or post-submission material) — removed at every depth. */
const HIDDEN = new Set([
  'answer', 'answers', 'correctAnswer', 'correctIndex', 'correctIndices', 'correct', 'correctOrder',
  'sampleAnswer', 'modelAnswer', 'explanation', 'transcript',
]);
const LEGACY_AUTO_TYPES = ['FILL_BLANK', 'MCQ', 'TRUE_FALSE', 'ORDERING', 'LISTENING', 'MULTIPLE_SELECT'];

const clean = (entry: Prisma.JsonValue): Prisma.JsonValue => {
  if (Array.isArray(entry)) return entry.map(clean);
  if (!entry || typeof entry !== 'object') return entry;
  return Object.fromEntries(Object.entries(entry).filter(([key]) => !HIDDEN.has(key)).map(([key, item]) => [key, clean(item!)]));
};

/**
 * Keep answer keys on the server for graded lesson activities. Order-revealing
 * data is rearranged: matching becomes `left` (as authored) + `right` (shuffled),
 * ordering becomes shuffled `items`. Feedback after submission comes from
 * `buildActivityReview`, never from this student-facing config.
 */
export const sanitizeActivityConfig = (value: Prisma.JsonValue, type?: string, seed?: string): Prisma.JsonValue => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const result = clean(value) as Prisma.JsonObject;
  const shuffleSeed = seed ?? JSON.stringify(value);
  if (value.practiceMode === true) {
    // Structured self-study keeps its established student shape.
    result.autoGraded = LEGACY_AUTO_TYPES.includes(type ?? '') || Array.isArray(value.items);
    if (type === 'ORDERING' && !Array.isArray(result.options) && Array.isArray(value.answer)) result.options = [...value.answer].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    return result;
  }
  result.autoGraded = gradeActivity(type ?? '', null, asConfig(value)).auto || Array.isArray(value.items);
  if (type === 'MATCHING') {
    const pairs = matchingPairs(asConfig(value));
    delete result.pairs;
    result.left = pairs.map((pair) => pair.left);
    result.right = stableShuffle(pairs.map((pair) => pair.right), shuffleSeed);
  }
  if (type === 'ORDERING') {
    const key = orderingKey(asConfig(value));
    delete result.options;
    if (key) result.items = stableShuffle(key, shuffleSeed);
  }
  return result;
};

import { asFileResponse,blankSentences,choiceQuestions,isDocumentSubmission,matchingSides,text,wordCount } from './config-readers';
import type { ActivityConfig } from './types';

export const isCompletionType = (type: string) => type === 'VOCABULARY' || type === 'FLASHCARD';

/**
 * Recording and upload tasks need the microphone or the file picker, which the
 * anti-cheat guard counts as leaving the window, so they run without it.
 */
export const isAntiCheatExempt = (type: string, config: ActivityConfig) =>
  type === 'SPEAKING' || type === 'PRONUNCIATION' || isDocumentSubmission(type, config);

const filled = (value: unknown) => text(value).trim() !== '';
const allFilled = (value: unknown, count: number) => count > 0 && Array.isArray(value) && Array.from({ length: count }, (_, i) => value[i]).every(filled);

/** True once the student has given a complete answer for this activity type. */
export function isResponseReady(type: string, config: ActivityConfig, value: unknown): boolean {
  switch (type) {
    case 'MCQ': return typeof value === 'number';
    case 'MULTIPLE_SELECT': return Array.isArray(value) && value.length > 0;
    case 'TRUE_FALSE': return typeof value === 'boolean';
    case 'FILL_BLANK': return allFilled(value, blankSentences(config).length);
    case 'MATCHING': return allFilled(value, matchingSides(config).left.length);
    case 'ORDERING': return Array.isArray(value) && value.length > 0;
    case 'LISTENING':
    case 'READING': { const count = choiceQuestions(config).length; return count > 0 && Array.isArray(value) && Array.from({ length: count }, (_, i) => value[i]).every(v => typeof v === 'number'); }
    case 'VOCABULARY':
    case 'FLASHCARD': return value !== null && value !== undefined;
    case 'SPEAKING':
    case 'PRONUNCIATION': return asFileResponse(value) !== null;
    default:
      if (isDocumentSubmission(type, config)) return asFileResponse(value) !== null;
      return typeof value === 'string' && value.trim() !== '' && wordCount(value) >= (Number(config.minWords) || 0);
  }
}

/** What gets submitted when the anti-cheat guard locks the attempt. */
export function lockedResponse(value: unknown): unknown {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) return '[No answer — violations]';
  return value;
}

/** Starting value when the student redoes an activity (writing keeps their last draft). */
export function redoValue(type: string, previous: unknown): unknown {
  return type === 'WRITING' && typeof previous === 'string' ? previous : null;
}

export function submitLabel(type: string, config: ActivityConfig): string {
  if (isCompletionType(type)) return 'Mark as done';
  if (type === 'SPEAKING' || type === 'PRONUNCIATION') return 'Submit recording';
  if (isDocumentSubmission(type, config)) return 'Submit file';
  return 'Submit';
}

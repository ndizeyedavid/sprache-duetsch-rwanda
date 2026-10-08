import type { IconType } from 'react-icons';
import { FiAlignLeft, FiCheckCircle, FiCheckSquare, FiEdit3, FiLink2, FiList, FiMinusSquare, FiToggleLeft } from 'react-icons/fi';

export type QuestionMeta = { label: string; short: string; icon: IconType; auto: boolean };

/** One entry per question type, in the order teachers see them in the "Add" bar. */
export const QUESTION_TYPES: [string, QuestionMeta][] = [
  ['SINGLE_CHOICE', { label: 'Multiple choice · one answer', short: 'One answer', icon: FiCheckCircle, auto: true }],
  ['MULTIPLE_CHOICE', { label: 'Multiple choice · several answers', short: 'Several answers', icon: FiCheckSquare, auto: true }],
  ['TRUE_FALSE', { label: 'True or false', short: 'True / false', icon: FiToggleLeft, auto: true }],
  ['FILL_BLANK', { label: 'Fill in the blank', short: 'Fill blank', icon: FiMinusSquare, auto: true }],
  ['MATCHING', { label: 'Match pairs', short: 'Matching', icon: FiLink2, auto: true }],
  ['ORDERING', { label: 'Put in order', short: 'Ordering', icon: FiList, auto: true }],
  ['SHORT_TEXT', { label: 'Short written answer', short: 'Short answer', icon: FiEdit3, auto: false }],
  ['ESSAY', { label: 'Long written answer', short: 'Essay', icon: FiAlignLeft, auto: false }],
];

const byType = new Map(QUESTION_TYPES);
export const questionMeta = (type: string): QuestionMeta =>
  byType.get(type) ?? { label: type.toLowerCase(), short: type.toLowerCase(), icon: FiEdit3, auto: false };

export const SKILLS = ['VOCABULARY', 'GRAMMAR', 'READING', 'LISTENING', 'WRITING', 'SPEAKING'] as const;
export const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
export const titleCase = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

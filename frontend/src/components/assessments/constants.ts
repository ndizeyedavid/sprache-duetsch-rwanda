import { FiAward, FiBookOpen, FiCheckCircle, FiCheckSquare, FiClipboard, FiEdit3, FiFileText, FiLayers, FiMapPin, FiMove, FiMusic } from 'react-icons/fi';

export const SKILLS = [
  { value: 'VOCABULARY', label: 'Vocabulary' },
  { value: 'GRAMMAR', label: 'Grammar' },
  { value: 'LISTENING', label: 'Listening' },
  { value: 'READING', label: 'Reading' },
  { value: 'WRITING', label: 'Writing' },
  { value: 'SPEAKING', label: 'Speaking' },
] as const;

export const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
] as const;

// Friendly types — 6 intuitive types, no JSON, no "Matching".
export const FRIENDLY_TYPES = [
  { value: 'FILL_BLANK', label: 'Fill in the blank', hint: 'Sentence with a missing word', icon: FiEdit3 },
  { value: 'MULTIPLE_CHOICE', label: 'Multiple choice', hint: 'Pick the right answer', icon: FiCheckSquare },
  { value: 'TRUE_FALSE', label: 'True / False', hint: 'Is the statement correct?', icon: FiCheckCircle },
  { value: 'LISTENING', label: 'Listening', hint: 'Play audio and answer', icon: FiMusic },
  { value: 'WRITING', label: 'Writing', hint: 'Students write a text', icon: FiBookOpen },
  { value: 'ORDERING', label: 'Ordering', hint: 'Put in the correct order', icon: FiMove },
] as const;

export type FriendlyType = (typeof FRIENDLY_TYPES)[number]['value'];

// Map friendly type to backend enum
export function friendlyToBackend(value: FriendlyType, allowMultiple?: boolean): string {
  if (value === 'MULTIPLE_CHOICE') return allowMultiple ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE';
  if (value === 'LISTENING') return 'SINGLE_CHOICE';
  if (value === 'WRITING') return 'ESSAY';
  return value;
}

export function backendToFriendly(backend: string): FriendlyType {
  if (backend === 'SINGLE_CHOICE' || backend === 'MULTIPLE_CHOICE') return 'MULTIPLE_CHOICE';
  if (backend === 'SHORT_TEXT' || backend === 'ESSAY') return 'WRITING';
  if (backend === 'FILL_BLANK' || backend === 'TRUE_FALSE' || backend === 'ORDERING' || backend === 'LISTENING') return backend as FriendlyType;
  return 'MULTIPLE_CHOICE';
}

/** Hydrate helper: listening is stored as SINGLE_CHOICE + skill LISTENING + audioUrl */
export function hydrateFriendlyType(q: { type: string; skill: string; audioUrl?: string | null }): FriendlyType {
  if (q.audioUrl && q.skill === 'LISTENING') return 'LISTENING';
  return backendToFriendly(q.type);
}

export const ASSESSMENT_TYPES = [
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'MODULE_TEST', label: 'Module test' },
  { value: 'FINAL_EXAM', label: 'Final exam' },
  { value: 'PLACEMENT', label: 'Placement' },
] as const;

export const TYPE_ICON: Record<string, typeof FiClipboard> = {
  SINGLE_CHOICE: FiCheckSquare,
  MULTIPLE_CHOICE: FiCheckSquare,
  TRUE_FALSE: FiCheckCircle,
  FILL_BLANK: FiEdit3,
  MATCHING: FiFileText,
  ORDERING: FiMove,
  SHORT_TEXT: FiFileText,
  ESSAY: FiBookOpen,
  WRITING: FiBookOpen,
  LISTENING: FiMusic,
};

export const ASSESSMENT_ICON: Record<string, typeof FiClipboard> = {
  QUIZ: FiClipboard,
  MODULE_TEST: FiLayers,
  FINAL_EXAM: FiAward,
  PLACEMENT: FiMapPin,
};

export const DIFFICULTY_TONE: Record<string, string> = {
  EASY: 'bg-brand-soft text-[#B30A00]',
  MEDIUM: 'bg-sun-soft text-[#8A6800]',
  HARD: 'bg-coral-soft text-[#D8482F]',
};

export const TABS = ['Question bank', 'Assessments'] as const;
export type Tab = (typeof TABS)[number];

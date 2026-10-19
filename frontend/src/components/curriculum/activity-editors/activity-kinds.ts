import type { IconType } from 'react-icons';
import { FiAlignLeft,FiBookOpen,FiCheckCircle,FiCheckSquare,FiCopy,FiEdit3,FiFileText,FiGrid,FiHeadphones,FiLayers,FiList,FiMic,FiShuffle,FiType,FiVolume2 } from 'react-icons/fi';

export type ActivityKind = { type: string; label: string; hint: string; Icon: IconType; color: string };

/** Every lesson activity a teacher can author. DOCUMENT is saved as WRITING with `isDocumentSubmission`. */
export const activityKinds: ActivityKind[] = [
  { type: 'MCQ', label: 'Multiple choice', hint: 'Choose the one right answer', Icon: FiList, color: 'bg-brand-soft text-brand-soft-ink' },
  { type: 'MULTIPLE_SELECT', label: 'Multiple select', hint: 'Choose every right answer', Icon: FiCheckSquare, color: 'bg-brand-soft text-brand-soft-ink' },
  { type: 'TRUE_FALSE', label: 'True or false', hint: 'Check understanding', Icon: FiCheckCircle, color: 'bg-success text-success-content' },
  { type: 'FILL_BLANK', label: 'Fill in the blanks', hint: 'Complete a sentence', Icon: FiType, color: 'bg-info text-info-content' },
  { type: 'MATCHING', label: 'Matching pairs', hint: 'Connect words and meanings', Icon: FiGrid, color: 'bg-warning text-warning-content' },
  { type: 'ORDERING', label: 'Put in order', hint: 'Build a sentence or sequence', Icon: FiShuffle, color: 'bg-warning text-warning-content' },
  { type: 'LISTENING', label: 'Listening', hint: 'Audio with comprehension questions', Icon: FiHeadphones, color: 'bg-info text-info-content' },
  { type: 'READING', label: 'Reading', hint: 'A text with comprehension questions', Icon: FiBookOpen, color: 'bg-info text-info-content' },
  { type: 'VOCABULARY', label: 'Vocabulary set', hint: 'Words to study with flip cards', Icon: FiLayers, color: 'bg-success text-success-content' },
  { type: 'FLASHCARD', label: 'Flashcards', hint: 'Self-study flip cards', Icon: FiCopy, color: 'bg-success text-success-content' },
  { type: 'WRITING', label: 'Writing task', hint: 'Practise in their own words', Icon: FiEdit3, color: 'bg-brand-soft text-brand-soft-ink' },
  { type: 'DOCUMENT', label: 'File submission', hint: 'Upload completed work', Icon: FiFileText, color: 'bg-info text-info-content' },
  { type: 'SPEAKING', label: 'Speaking', hint: 'Record a spoken answer', Icon: FiMic, color: 'bg-error text-error-content' },
  { type: 'PRONUNCIATION', label: 'Pronunciation', hint: 'Record a word or phrase', Icon: FiVolume2, color: 'bg-error text-error-content' },
];

export const kindFor = (type: string) => activityKinds.find(kind => kind.type === type);
export const FallbackIcon = FiAlignLeft;

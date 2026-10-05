import { FiCheckCircle, FiEdit3, FiFileText, FiGrid, FiList, FiType } from 'react-icons/fi';
import type { LessonActivity } from '../../../lib/services';

export const practiceKinds = [
  { type: 'MCQ', label: 'Multiple choice', hint: 'Choose the right answer', Icon: FiList, color: 'bg-neutral text-neutral-content' },
  { type: 'FILL_BLANK', label: 'Fill in the blanks', hint: 'Complete a sentence', Icon: FiType, color: 'bg-info text-info-content' },
  { type: 'TRUE_FALSE', label: 'True or false', hint: 'Check understanding', Icon: FiCheckCircle, color: 'bg-success text-success-content' },
  { type: 'MATCHING', label: 'Matching pairs', hint: 'Connect words and meanings', Icon: FiGrid, color: 'bg-warning text-warning-content' },
  { type: 'WRITING', label: 'Writing task', hint: 'Practise in their own words', Icon: FiEdit3, color: 'bg-neutral text-neutral-content' },
  { type: 'DOCUMENT', label: 'File submission', hint: 'Upload completed work', Icon: FiFileText, color: 'bg-info text-info-content' },
];
export function activityConfig(activity?: LessonActivity): Record<string, unknown> {
  return activity?.config && typeof activity.config === 'object' && !Array.isArray(activity.config) ? activity.config as Record<string, unknown> : {};
}
export function practiceDraft(type: string, activity?: LessonActivity) {
  const c = activityConfig(activity);
  return {
    title: activity?.title ?? '', type: c.isDocumentSubmission ? 'DOCUMENT' : type,
    instructions: activity?.instructions ?? '', prompt: String(c.question ?? c.statement ?? c.prompt ?? ''),
    options: Array.isArray(c.options) ? c.options.map(String) : ['', '', '', ''],
    correctIndex: Number(c.correctIndex ?? 0), correct: c.correct !== false,
    sentences: Array.isArray(c.sentences) ? c.sentences.map(value => { const row = value as Record<string, unknown>; return { text: String(row.text ?? ''), answer: String(row.answer ?? '') }; }) : [{ text: String(c.sentence ?? ''), answer: String(c.answer ?? '') }],
    pairs: Array.isArray(c.pairs) ? c.pairs.map(value => { const row = value as Record<string, unknown>; return { left: String(row.left ?? ''), right: String(row.right ?? '') }; }) : [{ left: '', right: '' }, { left: '', right: '' }],
    minWords: String(c.minWords ?? ''), allowedTypes: String(c.allowedTypes ?? 'pdf,docx'), isPublished: activity?.isPublished ?? false,
  };
}
export type PracticeDraft = ReturnType<typeof practiceDraft>;
export type ChangePractice = <K extends keyof PracticeDraft>(key: K, value: PracticeDraft[K]) => void;
export function canEditQuestions(activity?: LessonActivity) {
  const c = activityConfig(activity);
  return !activity || (practiceKinds.some(kind => kind.type === activity.type) && !Array.isArray(c.questions) && !Array.isArray(c.items));
}
export function practicePayload(draft: PracticeDraft, original?: LessonActivity) {
  let config = { ...activityConfig(original) };
  if (canEditQuestions(original)) {
    if (draft.type === 'MCQ') config = { ...config, question: draft.prompt, options: draft.options, correctIndex: draft.correctIndex };
    if (draft.type === 'TRUE_FALSE') config = { ...config, statement: draft.prompt, correct: draft.correct };
    if (draft.type === 'FILL_BLANK') {
      const useSentences = Array.isArray(config.sentences) || draft.sentences.length > 1;
      config = useSentences ? { ...config, sentences: draft.sentences } : { ...config, sentence: draft.sentences[0].text, answer: draft.sentences[0].answer };
    }
    if (draft.type === 'MATCHING') config = { ...config, pairs: draft.pairs };
    if (draft.type === 'WRITING' || draft.type === 'DOCUMENT') config = { ...config, prompt: draft.prompt, minWords: draft.minWords, ...(draft.type === 'DOCUMENT' ? { isDocumentSubmission: true, allowedTypes: draft.allowedTypes } : {}) };
  }
  return { title: draft.title.trim(), type: draft.type === 'DOCUMENT' ? 'WRITING' : draft.type, instructions: draft.instructions || null, isPublished: draft.isPublished, config };
}

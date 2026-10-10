import { z } from 'zod';
export const authoredQuestionSchema = z.object({
  id: z.uuid(), type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'SHORT_TEXT', 'ESSAY', 'ORDERING', 'MATCHING']),
  prompt: z.string().trim().min(1).max(2000), points: z.number().positive().max(1000),
  skill: z.enum(['VOCABULARY', 'GRAMMAR', 'LISTENING', 'READING', 'WRITING', 'SPEAKING']).default('VOCABULARY'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('EASY'),
  options: z.json().nullable().default(null), correctAnswer: z.json().nullable().default(null),
  audioUrl: z.string().max(500).regex(/^(https?:\/\/|\/)/).nullable().default(null), imageUrl: z.string().max(500).regex(/^(https?:\/\/|\/)/).nullable().default(null),
}).superRefine((q, ctx) => {
  const issue = (message: string) => ctx.addIssue({ code: 'custom', path: ['correctAnswer'], message });
  if (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') {
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 8 || q.options.some(o => typeof o !== 'string' || !o.trim()) || new Set(q.options).size !== q.options.length) { issue('Add 2–8 different answer choices'); return; }
    const options = q.options;
    const answers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
    if (!answers.length || answers.some(a => !options.includes(a)) || q.type === 'SINGLE_CHOICE' && answers.length !== 1) issue('Select the correct answer choices');
  }
  if (q.type === 'TRUE_FALSE' && !['True', 'False', true, false].includes(q.correctAnswer as string | boolean)) issue('Choose True or False as the correct answer');
  if (q.type === 'FILL_BLANK' && (typeof q.correctAnswer !== 'string' || !q.correctAnswer.trim())) issue('Enter the expected answer');
});
export const authoredQuestionsSchema = z.array(authoredQuestionSchema).max(50).refine(qs => new Set(qs.map(q => q.id)).size === qs.length, 'Each question must have a unique ID');
export type AuthoredQuestion = z.infer<typeof authoredQuestionSchema>;

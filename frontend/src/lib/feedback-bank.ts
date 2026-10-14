import type { RubricCriterion } from '../components/assignments/homework/types';
import { apiDelete, apiGet, apiPost, apiPut } from './api';

/** Reusable marking rubrics: your own, plus ones colleagues shared with every teacher. */
export type RubricTemplate = {
  id: string; ownerId: string; title: string; criteria: RubricCriterion[]; isShared: boolean; canEdit: boolean;
  owner: { firstName: string; lastName: string }; updatedAt: string;
};
export type RubricTemplateInput = { title: string; criteria: RubricCriterion[]; isShared: boolean };
/** A grader's own saved feedback snippets, most used first. */
export type FeedbackComment = { id: string; text: string; category: string | null; usageCount: number };

export const listRubricTemplates = () => apiGet<RubricTemplate[]>('/assignments/bank/rubrics');
export const createRubricTemplate = (body: RubricTemplateInput) => apiPost<RubricTemplate>('/assignments/bank/rubrics', body);
export const updateRubricTemplate = (id: string, body: RubricTemplateInput) => apiPut<RubricTemplate>(`/assignments/bank/rubrics/${id}`, body);
export const deleteRubricTemplate = (id: string) => apiDelete(`/assignments/bank/rubrics/${id}`);

export const listFeedbackComments = () => apiGet<FeedbackComment[]>('/assignments/bank/comments');
export const createFeedbackComment = (body: { text: string; category: string | null }) => apiPost<FeedbackComment>('/assignments/bank/comments', body);
export const deleteFeedbackComment = (id: string) => apiDelete(`/assignments/bank/comments/${id}`);
/** Records that a saved comment was inserted, so it ranks higher next time. */
export const markFeedbackCommentUsed = (id: string) => apiPost<FeedbackComment>(`/assignments/bank/comments/${id}/use`);

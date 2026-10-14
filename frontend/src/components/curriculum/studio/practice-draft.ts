import type { LessonActivity } from '../../../lib/services';
import { activityKinds } from '../activity-editors/activity-kinds';
import { normalizeConfig,savedConfig } from '../activity-editors/config-model';
import type { Config } from '../activity-editors/editor-config';

export const practiceKinds = activityKinds;

export function activityConfig(activity?: LessonActivity): Config {
  return activity?.config && typeof activity.config === 'object' && !Array.isArray(activity.config) ? activity.config as Config : {};
}

/** Editor kind: document submissions are WRITING activities with `isDocumentSubmission`. */
export const editorType = (type: string, activity?: LessonActivity) => activityConfig(activity).isDocumentSubmission === true ? 'DOCUMENT' : type;
export const backendType = (type: string) => type === 'DOCUMENT' ? 'WRITING' : type;

export function practiceDraft(type: string, activity?: LessonActivity) {
  const kind = editorType(activity?.type ?? type, activity);
  return {
    title: activity?.title ?? '', type: kind, instructions: activity?.instructions ?? '',
    isPublished: activity?.isPublished ?? false, config: normalizeConfig(kind, activityConfig(activity)),
  };
}
export type PracticeDraft = ReturnType<typeof practiceDraft>;
export type ChangePractice = <K extends keyof PracticeDraft>(key: K, value: PracticeDraft[K]) => void;

/** Structured course imports (self-study items) keep their prepared questions. */
export function canEditQuestions(activity?: LessonActivity) {
  if (!activity) return true;
  const c = activityConfig(activity);
  if (c.practiceMode === true) return false;
  if (Array.isArray(c.items) && c.items.some(item => item !== null && typeof item === 'object')) return false;
  return activityKinds.some(kind => kind.type === editorType(activity.type, activity));
}

/** Config as it will be stored (canonical keys; untouched extra keys preserved). */
export function draftConfig(draft: PracticeDraft, original?: LessonActivity): Config {
  return canEditQuestions(original) ? savedConfig(draft.type, activityConfig(original), draft.config) : activityConfig(original);
}

export function practicePayload(draft: PracticeDraft, original?: LessonActivity) {
  return { title: draft.title.trim(), type: backendType(draft.type), instructions: draft.instructions || null, isPublished: draft.isPublished, config: draftConfig(draft, original) };
}

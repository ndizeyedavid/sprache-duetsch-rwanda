import { useCallback,useEffect,useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { submitActivity } from '../../lib/services';
import type { ActivitySubmission } from '../../lib/services';
import { redoValue } from './response-utils';
import type { ActivityReview } from './types';

export type SubmissionView = ActivitySubmission & { review?: ActivityReview | null };

/** Answer state for one activity attempt: draft value, submit, result, redo. */
export function useActivityAttempt(activityId: string, type: string, existing: SubmissionView | null, onSubmitted: () => void) {
  const [value, setValue] = useState<unknown>(null);
  const [result, setResult] = useState<SubmissionView | null>(existing);
  const [editing, setEditing] = useState(!existing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncKey = existing ? `${existing.id}:${existing.attemptNumber}:${existing.status}:${existing.gradedAt ?? ''}` : `none:${activityId}`;
  useEffect(() => {
    // A new attempt or a teacher's grade arrived: show the latest result.
    setResult(existing);
    setEditing(!existing);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the submission's identity, not object reference
  }, [syncKey]);
  const submit = useCallback(async (response: unknown) => {
    setSubmitting(true); setError(null);
    try {
      const saved = await submitActivity(activityId, response) as SubmissionView;
      setResult(saved); setEditing(false); onSubmitted();
      return true;
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not submit activity.'));
      return false;
    } finally { setSubmitting(false); }
  }, [activityId, onSubmitted]);
  function redo() {
    setValue(redoValue(type, result?.response));
    setEditing(true); setError(null);
  }
  return { value, setValue, result, editing, submitting, error, submit, redo };
}

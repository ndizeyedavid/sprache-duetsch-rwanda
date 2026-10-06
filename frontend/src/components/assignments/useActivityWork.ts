import { useEffect,useRef,useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { submitActivity } from '../../lib/services';
import { useSession } from '../../lib/session';
import type { AssignmentDetailData } from './types';
export function useActivityWork(activity: NonNullable<AssignmentDetailData['activity']>, refetch: () => void) {
  const { user } = useSession();
  const key = `activity-draft:${user?.id}:${activity.id}`;
  const [answer, setAnswer] = useState(() => { try { return localStorage.getItem(key) ?? ''; } catch { return ''; } });
  const [started, setStarted] = useState(false), [submitting, setSubmitting] = useState(false), [error, setError] = useState<string | null>(null);
  const sending = useRef(false);
  useEffect(() => { try { localStorage.setItem(key, answer); } catch { /* Submission still works without local storage. */ } }, [answer, key]);
  async function submit() {
    if (sending.current) return;
    sending.current = true; setSubmitting(true); setError(null);
    try {
      let response: unknown = answer;
      if (['ORDERING', 'MATCHING', 'MULTIPLE_SELECT'].includes(activity.type)) {
        try { response = JSON.parse(answer); } catch { response = answer; }
      }
      await submitActivity(activity.id, response);
      localStorage.removeItem(key); setStarted(false); refetch();
    } catch (e) { setError(apiErrorMessage(e, 'Could not submit your work. Your device draft remains available.')); }
    finally { sending.current = false; setSubmitting(false); }
  }
  return { answer, setAnswer, started, submitting, error, start: () => setStarted(true), exit: () => setStarted(false), submit };
}

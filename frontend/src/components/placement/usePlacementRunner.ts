import { useCallback,useEffect,useRef,useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { saveMyPlacementDraft,submitMyPlacement } from '../../lib/services/placement-api';
import type { PlacementSession,PlacementSubmitResult } from '../../lib/services/placement-types';
import { AUTOSAVE_DELAY } from './constants';
import { isAnswered,secondsUntil } from './utils';

export type SaveState = 'Saved' | 'Saving…' | 'Not synced';

/** Answer state, autosave, countdown (auto-submits at zero) and submission for one attempt. */
export function usePlacementRunner(session: PlacementSession, onFinished: (result: PlacementSubmitResult) => void) {
  const [responses, setResponses] = useState<Record<string, unknown>>(() => session.responses ?? {});
  const [index, setIndex] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('Saved');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(() => secondsUntil(session.expiresAt));
  const current = useRef(responses);
  const lastSaved = useRef(JSON.stringify(session.responses ?? {}));
  const sending = useRef(false);
  const timeUp = useRef(false);
  useEffect(() => { current.current = responses; }, [responses]);

  const save = useCallback(async () => {
    if (sending.current || timeUp.current) return;
    const snapshot = current.current;
    const fingerprint = JSON.stringify(snapshot);
    if (fingerprint === lastSaved.current) return;
    setSaveState('Saving…');
    try {
      await saveMyPlacementDraft(session.attemptId, snapshot);
      lastSaved.current = fingerprint;
      setSaveState(JSON.stringify(current.current) === fingerprint ? 'Saved' : 'Saving…');
    } catch {
      setSaveState('Not synced');
    }
  }, [session.attemptId]);

  useEffect(() => {
    const timer = setTimeout(() => void save(), AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [responses, save]);

  useEffect(() => {
    const retry = () => void save();
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [save]);

  const submit = useCallback(async () => {
    if (sending.current) return;
    sending.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const answers = session.questions.map(({ question }) => ({ questionId: question.id, response: current.current[question.id] ?? null }));
      onFinished(await submitMyPlacement(session.attemptId, answers));
    } catch (cause) {
      setError(apiErrorMessage(cause, 'Could not submit. Your answers are saved — please try again.'));
      sending.current = false;
      setSubmitting(false);
    }
  }, [session.attemptId, session.questions, onFinished]);

  const submitRef = useRef(submit);
  useEffect(() => { submitRef.current = submit; }, [submit]);

  useEffect(() => {
    if (!session.expiresAt) return;
    const tick = () => {
      const left = secondsUntil(session.expiresAt);
      setTimeLeft(left);
      if (left === 0 && !timeUp.current) {
        timeUp.current = true;
        void submitRef.current();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [session.expiresAt]);

  const answer = useCallback((questionId: string, value: unknown) => {
    setResponses((previous) => ({ ...previous, [questionId]: value }));
  }, []);

  const total = session.questions.length;
  const answered = session.questions.filter(({ question }) => isAnswered(responses[question.id])).length;
  const go = useCallback((next: number) => setIndex(Math.min(Math.max(next, 0), Math.max(total - 1, 0))), [total]);

  return { responses, answer, index, go, total, answered, saveState, save, submit, submitting, error, timeLeft };
}

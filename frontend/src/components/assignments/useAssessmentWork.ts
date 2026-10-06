import { useEffect,useRef,useState } from 'react';
import type { ViolationType } from '../../hooks/useAntiCheat';
import { apiErrorMessage,apiPut } from '../../lib/api';
import type { MyAssessmentDetail } from '../../lib/services';
import { getMyAssessment,reportAttemptViolation,startAttempt,submitAttempt } from '../../lib/services';
import { enterAssignmentFullscreen,exitAssignmentFullscreen } from './fullscreen';
import type { AssignmentDetailData,QuizResult } from './types';
export function useAssessmentWork(data: AssignmentDetailData) {
  const [assessment, setAssessment] = useState<MyAssessmentDetail | null>(null);
  const [attempt, setAttempt] = useState<{ id: string } | null>(null);
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [starting, setStarting] = useState(false), [submitting, setSubmitting] = useState(false), [started, setStarted] = useState(false), [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null), [saveState, setSaveState] = useState('Saved');
  const latest = data.attempts?.[0];
  const [result, setResult] = useState<QuizResult | null>(() => latest && ['GRADED', 'SUBMITTED'].includes(latest.status) ? { status: latest.status, score: latest.score == null ? null : Number(latest.score), maxScore: latest.maxScore == null ? null : Number(latest.maxScore), percentage: latest.score != null && Number(latest.maxScore) > 0 ? Number(latest.score) / Number(latest.maxScore) * 100 : null, passed: !!latest.passed, feedback: latest.feedback } : null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const sending = useRef(false), lockReported = useRef(false), deadline = useRef<number | null>(null);
  const submitRef = useRef<(force?: boolean) => Promise<void>>(async () => {});
  const savePending = useRef<Promise<void> | null>(null), current = useRef(responses); current.current = responses;
  const lastSaved = useRef('{}');
  const assessmentId = data.assessment?.id;
  const protectedMode = assessment?.protectedMode ?? data.assessment?.protectedMode ?? false;
  const maxAttempts = assessment?.maxAttempts ?? data.assessment?.maxAttempts;
  const attemptsUsed = Math.max(data.attempts?.length ?? 0, assessment?.attemptCount ?? 0);
  const hasActive = data.attempts?.some(a => a.status === 'IN_PROGRESS');
  const exhausted = !hasActive && typeof maxAttempts === 'number' && maxAttempts > 0 && attemptsUsed >= maxAttempts;
  useEffect(() => {
    let active = true;
    if (assessmentId) getMyAssessment(assessmentId).then(value => { if (active) setAssessment(value); }).catch(e => { if (active && !result) setError(apiErrorMessage(e, 'Could not load assessment.')); });
    return () => { active = false; };
  }, [assessmentId, result]);
  async function start() {
    if (!assessmentId || starting || exhausted) return;
    setStarting(true); setError(null);
    try {
      const full = assessment ?? await getMyAssessment(assessmentId); setAssessment(full);
      if (full.protectedMode) await enterAssignmentFullscreen();
      const created = await startAttempt(assessmentId);
      const draft = (created.draftResponses ?? {}) as Record<string, unknown>;
      lastSaved.current = JSON.stringify(draft);
      setAttempt(created); setResponses(draft); setResult(null); setLocked(false); lockReported.current = false;
      deadline.current = full.durationMinutes ? new Date(created.startedAt).getTime() + full.durationMinutes * 60000 : null;
      setTimeLeft(deadline.current ? Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)) : null); setStarted(true);
    } catch (e) { setError(apiErrorMessage(e, 'Could not start assessment.')); await exitAssignmentFullscreen(); }
    finally { setStarting(false); }
  }
  async function save() {
    if (!attempt || result || sending.current || deadline.current !== null && Date.now() >= deadline.current) return;
    if (savePending.current) { await savePending.current; return save(); }
    const snapshot = current.current, fingerprint = JSON.stringify(snapshot);
    if (fingerprint === lastSaved.current) return;
    setSaveState('Saving…');
    const task = apiPut(`/assessments/my/attempts/${attempt.id}/draft`, { responses: snapshot }).then(() => { lastSaved.current = fingerprint; setSaveState('Saved'); });
    savePending.current = task;
    try { await task; } catch (e) { setSaveState('Not synced'); setError(apiErrorMessage(e, 'Draft save failed. Keep this page open and retry.')); throw e; }
    finally { savePending.current = null; }
  }
  const saveRef = useRef(save); saveRef.current = save;
  useEffect(() => {
    if (!attempt || result) return;
    const timer = setTimeout(() => { void saveRef.current().catch(() => {}); }, 800);
    return () => clearTimeout(timer);
  }, [responses, attempt, result]);
  useEffect(() => { const retry = () => { void saveRef.current().catch(() => {}); }; window.addEventListener('online', retry); return () => window.removeEventListener('online', retry); }, []);
  async function submit(force = false) {
    if (!attempt || !assessment || sending.current || locked && !force) return;
    const unanswered = assessment.questions.filter(({ question }) => current.current[question.id] === undefined || current.current[question.id] === '' || Array.isArray(current.current[question.id]) && !(current.current[question.id] as unknown[]).length);
    if (!force && unanswered.length && !confirm(`${unanswered.length} question(s) unanswered. Submit anyway?`)) return;
    try { if (!force) await save(); else if (savePending.current) await savePending.current.catch(() => {}); } catch { return; }
    sending.current = true; setSubmitting(true); setError(null);
    try {
      const response = await submitAttempt(attempt.id, assessment.questions.map(({ question }) => ({ questionId: question.id, response: current.current[question.id] ?? null })), lockReported.current);
      setResult({ status: response.status, score: response.score ?? null, maxScore: response.maxScore ?? null, percentage: response.percentage ?? null, passed: !!response.passed });
      localStorage.removeItem(`cheat:ASM:${attempt.id}`); deadline.current = null; await exitAssignmentFullscreen();
    } catch (e) { setError(apiErrorMessage(e, 'Could not submit. Your saved answers are still available.')); }
    finally { sending.current = false; setSubmitting(false); }
  }
  submitRef.current = submit;
  useEffect(() => {
    if (!attempt || result || deadline.current === null) return;
    const tick = () => { const remaining = Math.max(0, Math.ceil(((deadline.current ?? Date.now()) - Date.now()) / 1000)); setTimeLeft(remaining); if (!remaining) void submitRef.current(true); };
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, [attempt, result]);
  async function retry() {
    if (!assessmentId) return;
    try { const fresh = await getMyAssessment(assessmentId); if (fresh.attemptCount >= (fresh.maxAttempts ?? 1)) return; setAssessment(fresh); setResult(null); setAttempt(null); setStarted(false); }
    catch (e) { setError(apiErrorMessage(e, 'Could not check available attempts.')); }
  }
  const canRetry = !!result && !!assessment && assessment.attemptCount < (assessment.maxAttempts ?? 1);
  async function exit() { try { await save(); setStarted(false); setLocked(false); await exitAssignmentFullscreen(); } catch { /* Keep the workspace open until saving succeeds. */ } }
  async function resume() { if (protectedMode) await enterAssignmentFullscreen(); setStarted(true); }
  function onLock() { if (lockReported.current) return; lockReported.current = true; setLocked(true); void submitRef.current(true); }
  function onViolation(type: ViolationType) { if (attempt && protectedMode) void reportAttemptViolation(attempt.id, type).catch(() => {}); }
  return { assessment, attempt, responses, setResponses, starting, submitting, started, locked, error, result, timeLeft, attemptsUsed, maxAttempts, exhausted, protectedMode, saveState, canRetry, retry, start, submit, exit, resume, onLock, onViolation };
}

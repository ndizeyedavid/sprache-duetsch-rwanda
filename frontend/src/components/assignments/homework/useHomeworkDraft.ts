import { useEffect, useRef, useState } from 'react';
import { apiErrorMessage } from '../../../lib/api';
import { saveHomeworkDraft, submitHomework } from '../../../lib/homework';
import { useSession } from '../../../lib/session';
import type { HomeworkDetail } from './types';
export function useHomeworkDraft(data: HomeworkDetail, onSubmitted: () => void) {
  const { user } = useSession();
  const key = `homework:${user?.id}:${data.assignment.id}`;
  const editable = !['SUBMITTED', 'GRADED'].includes(data.submission?.status ?? '') && (data.submission?.revision ?? 0) < data.assignment.maxSubmissions;
  const initial = { text: data.submission?.text ?? '', fileIds: data.submission?.fileIds ?? [] };
  const version = useRef(data.submission?.updatedAt ?? null);
  const [work, setWork] = useState(() => {
    try { const local = JSON.parse(localStorage.getItem(key) ?? 'null') as { text: string; fileIds: string[]; version: string | null } | null;
      if (editable && local && local.version === version.current && typeof local.text === 'string' && Array.isArray(local.fileIds)) return { text: local.text, fileIds: local.fileIds };
    } catch { /* Use the server draft if local storage is unavailable. */ }
    return initial;
  });
  const [recovery, setRecovery] = useState<{ text: string; fileIds: string[] } | null>(() => {
    try {
      const local = JSON.parse(localStorage.getItem(key) ?? 'null') as { text: string; fileIds: string[]; version: string | null } | null;
      if (editable && local && local.version !== version.current && typeof local.text === 'string' && Array.isArray(local.fileIds)
        && (local.text !== initial.text || JSON.stringify(local.fileIds) !== JSON.stringify(initial.fileIds))) return { text: local.text, fileIds: local.fileIds };
    } catch { /* A damaged device copy should not block the server draft. */ }
    return null;
  });
  const latest = useRef(work); latest.current = work;
  const saved = useRef(JSON.stringify(initial));
  const pending = useRef<Promise<void> | null>(null);
  const active = useRef(true);
  const [state, setState] = useState('Saved');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const saveRef = useRef<() => Promise<void>>(async () => {});
  async function save() {
    if (!editable) return;
    if (pending.current) { await pending.current; return save(); }
    const snapshot = latest.current, fingerprint = JSON.stringify(snapshot);
    if (fingerprint === saved.current) return;
    setState('Saving…'); setError(null);
    const task = (async () => {
      const result = await saveHomeworkDraft(data.assignment.id, { ...snapshot, version: version.current });
      version.current = result.updatedAt; saved.current = fingerprint;
      if (active.current) {
        try { localStorage.setItem(key, JSON.stringify({ ...latest.current, version: version.current })); } catch { /* The server has saved this draft. */ }
        setState(JSON.stringify(latest.current) === fingerprint ? 'Saved' : 'Unsaved changes');
      }
    })();
    pending.current = task;
    try { await task; } catch (e) { if (active.current) { setState('Saved on this device'); setError(apiErrorMessage(e, 'Could not sync your draft. Retry when connected.')); } throw e; }
    finally { pending.current = null; }
  }
  saveRef.current = save;
  useEffect(() => {
    if (!editable || JSON.stringify(work) === saved.current) return;
    setState('Unsaved changes');
    try { localStorage.setItem(key, JSON.stringify({ ...work, version: version.current })); } catch { /* Server saving remains available. */ }
    const timer = setTimeout(() => { void saveRef.current().catch(() => {}); }, 1200);
    return () => clearTimeout(timer);
  }, [work, key, editable]);
  useEffect(() => {
    active.current = true;
    const retry = () => { void saveRef.current().catch(() => {}); };
    const leaving = (e: BeforeUnloadEvent) => { if (JSON.stringify(latest.current) !== saved.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('online', retry); window.addEventListener('beforeunload', leaving);
    return () => { active.current = false; window.removeEventListener('online', retry); window.removeEventListener('beforeunload', leaving); };
  }, []);
  async function submit() {
    setBusy(true); setError(null);
    try {
      await save();
      await submitHomework(data.assignment.id, { ...latest.current, version: version.current });
      localStorage.removeItem(key); onSubmitted();
    } catch (e) { setError(apiErrorMessage(e, 'Could not submit. Your draft is still available.')); }
    finally { setBusy(false); }
  }
  return { recovery, restore: () => { if (recovery) setWork(recovery); setRecovery(null); }, discardRecovery: () => { setRecovery(null); try { localStorage.removeItem(key); } catch { /* Keep the server draft. */ } }, work, setWork, editable, state, error, busy, save, submit };
}

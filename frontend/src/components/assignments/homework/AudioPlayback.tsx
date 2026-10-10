import { useEffect,useRef,useState } from 'react';
import { api,apiErrorMessage } from '../../../lib/api';
import type { Attachment } from './types';
export function AudioPlayback({ assignmentId, file }: { assignmentId: string; file: Attachment }) {
  const [url, setUrl] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const source = useRef(''), controller = useRef<AbortController | null>(null);
  useEffect(() => () => { controller.current?.abort(); if (source.current) URL.revokeObjectURL(source.current); }, []);
  async function listen() {
    setBusy(true); setError(''); controller.current = new AbortController();
    try { const response = await api.get(`/assignments/${assignmentId}/files/${file.id}`, { responseType: 'blob', signal: controller.current.signal }); source.current = URL.createObjectURL(new Blob([response.data as Blob], { type: file.mimeType })); setUrl(source.current); }
    catch (e) { if (!controller.current.signal.aborted) setError(apiErrorMessage(e, 'Could not load audio. Try downloading it.')); }
    finally { setBusy(false); }
  }
  return <div className="mt-2">{url ? <audio controls src={url} className="h-9 w-full" preload="metadata" /> : <button type="button" className="btn btn-ghost btn-xs" disabled={busy} onClick={() => void listen()}>{busy ? 'Loading audio…' : 'Listen to recording'}</button>}{error ? <p role="alert" className="text-xs text-error">{error}</p> : null}</div>;
}

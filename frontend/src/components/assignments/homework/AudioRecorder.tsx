import { useEffect,useRef,useState } from 'react';
import { FiMic,FiSquare } from 'react-icons/fi';
export function AudioRecorder({ onFile, disabled, onRecordingChange }: { onRecordingChange: (recording: boolean) => void; onFile: (file: File) => Promise<void>; disabled: boolean }) {
  const recorder = useRef<MediaRecorder | null>(null), stream = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState(false), [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); if (recorder.current?.state === 'recording') { recorder.current.onstop = null; recorder.current.stop(); } stream.current?.getTracks().forEach(t => t.stop()); }, []);
  async function start() {
    setError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('Recording is unavailable here. Upload an audio file instead.');
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ['audio/webm', 'audio/mp4', 'audio/ogg'].find(t => MediaRecorder.isTypeSupported(t));
      const next = new MediaRecorder(stream.current, mime ? { mimeType: mime } : undefined);
      recorder.current = next;
      const chunks: Blob[] = [];
      next.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      next.onstop = () => {
        if (timer.current) clearTimeout(timer.current);
        stream.current?.getTracks().forEach(t => t.stop()); setRecording(false); onRecordingChange(false);
        const blob = new Blob(chunks, { type: next.mimeType.split(';')[0] });
        const extension = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
        if (blob.size > 10 * 1024 * 1024) { setError('Recording is too large. Try a shorter recording.'); return; }
        void onFile(new File([blob], `speaking-${Date.now()}.${extension}`, { type: blob.type })).catch(() => {});
      };
      next.start(); setRecording(true); onRecordingChange(true);
      timer.current = setTimeout(() => next.state === 'recording' && next.stop(), 5 * 60000);
    } catch (e) { stream.current?.getTracks().forEach(t => t.stop()); setError(e instanceof Error ? e.message : 'Allow microphone access, or upload a recording.'); }
  }
  return <div className="rounded-box bg-base-200/60 p-4"><p className="mb-3 text-xs text-base-content/65">Find a quiet spot. Practise once, then record your answer (up to 5 minutes).</p><button type="button" className={`btn btn-sm rounded-full ${recording ? 'btn-error' : ''}`} disabled={disabled && !recording} onClick={() => recording ? recorder.current?.stop() : void start()}>{recording ? <FiSquare /> : <FiMic />}{recording ? 'Stop & attach recording' : 'Record your answer'}</button>{recording ? <p role="status" className="mt-2 text-xs text-error">Recording… keep this page open.</p> : null}{error ? <p role="alert" className="mt-2 text-xs text-error">{error}</p> : null}</div>;
}

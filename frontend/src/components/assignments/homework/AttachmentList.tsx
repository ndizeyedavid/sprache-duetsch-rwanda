import { useState } from 'react';
import { FiDownload,FiPaperclip,FiX } from 'react-icons/fi';
import { apiErrorMessage } from '../../../lib/api';
import { downloadHomeworkFile } from '../../../lib/homework';
import { AudioPlayback } from "./AudioPlayback";
import type { Attachment } from './types';
export function AttachmentList({ assignmentId, files, onRemove, disabled }: { assignmentId: string; files: Attachment[]; onRemove?: (id: string) => void; disabled?: boolean }) {
  const [error, setError] = useState('');
  async function download(file: Attachment) { setError(''); try { await downloadHomeworkFile(assignmentId, file); } catch (e) { setError(apiErrorMessage(e, 'Download failed. Please retry.')); } }
  return <div className="space-y-2">{files.map(f => <div key={f.id} className="flex items-center gap-3 rounded-field border border-base-300 p-3"><FiPaperclip className="shrink-0 text-base-content/50" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{f.originalName}</p><p className="text-[10px] text-base-content/50">{Math.max(1, Math.round(f.sizeBytes / 1024))} KB</p>{f.mimeType.startsWith("audio/") ? <AudioPlayback assignmentId={assignmentId} file={f} /> : null}</div><button type="button" className="btn btn-ghost btn-xs" aria-label={`Download ${f.originalName}`} onClick={() => void download(f)}><FiDownload /></button>{onRemove ? <button type="button" disabled={disabled} className="btn btn-ghost btn-xs" aria-label={`Remove ${f.originalName}`} onClick={() => onRemove(f.id)}><FiX /></button> : null}</div>)}{error ? <p role="alert" className="text-xs text-error">{error}</p> : null}</div>;
}

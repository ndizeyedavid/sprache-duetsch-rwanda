import { useState } from 'react';
import { FiDownload,FiExternalLink,FiFileText,FiLayers,FiPenTool } from 'react-icons/fi';
import type { StudentNote } from '../../lib/student-notes';
import { downloadMaterial,openMaterial } from '../student/materialFiles';
import { formatBytes,noteTypeLabel } from './notes-utils';

const ICONS = { SLIDE: FiLayers, WORKSHEET: FiPenTool } as const;

type Props = { note: StudentNote; onError: (message: string) => void };

/** One file: what it is, how big (it matters on mobile data), open or save it. */
export function NoteRow({ note, onError }: Props) {
  const [busy, setBusy] = useState<'open' | 'download' | null>(null);
  const Icon = ICONS[note.type as keyof typeof ICONS] ?? FiFileText;
  const size = formatBytes(note.sizeBytes);

  async function run(kind: 'open' | 'download') {
    if (!note.url) return;
    setBusy(kind);
    try {
      await (kind === 'open' ? openMaterial(note.url, note.title) : downloadMaterial(note.url, note.title));
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : 'Could not get this file. Check your connection and retry.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-box bg-base-200 text-muted">
        <Icon aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-snug">{note.title}</span>
        <span className="mt-0.5 block text-xs text-muted">
          {noteTypeLabel(note.type)}{size ? ` · ${size}` : ''}{note.isDownloadable ? '' : ' · view only'}
        </span>
      </span>
      {note.url ? (
        <span className="flex shrink-0 gap-1.5">
          <button type="button" disabled={busy !== null} onClick={() => void run('open')} className="btn btn-ghost btn-xs rounded-full border border-base-300">
            {busy === 'open' ? <span className="loading loading-spinner loading-xs" /> : <FiExternalLink aria-hidden />}Open
          </button>
          {note.isDownloadable ? (
            <button type="button" disabled={busy !== null} onClick={() => void run('download')} aria-label={`Download ${note.title}`} className="btn btn-xs rounded-full border-0 bg-brand text-white hover:bg-brand">
              {busy === 'download' ? <span className="loading loading-spinner loading-xs" /> : <FiDownload aria-hidden />}
              <span className="hidden sm:inline">Download</span>
            </button>
          ) : null}
        </span>
      ) : (
        <span className="shrink-0 rounded-full bg-base-200 px-2.5 py-1 text-[0.6875rem] text-muted">In the lesson</span>
      )}
    </li>
  );
}

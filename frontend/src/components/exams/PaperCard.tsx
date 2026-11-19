import { useState } from 'react';
import { FiAward,FiBookOpen,FiCheckSquare,FiDownload,FiExternalLink,FiFileText,FiHeadphones } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { downloadFile } from '../../lib/api';
import type { ExamPaperCard } from '../../lib/services/exam-centre';
import { openMaterial,protectedMaterialPath } from '../student/materialFiles';
import { PaperAudioList } from './PaperAudioList';

const size = (bytes: number | null) => bytes ? `${(bytes / 1048576).toFixed(1)} MB` : null;

/** One past paper: read or download the PDF, play its recordings, check answers online and see your best result. */
export function PaperCard({ paper }: { paper: ExamPaperCard }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const path = paper.fileUrl ? protectedMaterialPath(paper.fileUrl) : null;
  async function run(work: () => Promise<void>) {
    setBusy(true); setError(null);
    try { await work(); } catch { setError('That did not work. Check your connection and try again.'); } finally { setBusy(false); }
  }
  const best = paper.results?.best;
  return (
    <li className="flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 p-4">
      <span className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-base-200 text-lg"><FiFileText aria-hidden /></span>
        <span className="min-w-0 grow">
          <span className="block font-semibold leading-tight" lang="de">{paper.title}</span>
          <span className="block text-xs text-muted">{[paper.provider, paper.edition, size(paper.sizeBytes)].filter(Boolean).join(' · ')}</span>
        </span>
        {best ? <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${best.score / best.total >= 0.6 ? 'bg-ok-soft text-ok' : 'bg-base-200 text-muted'}`}
          title={`${paper.results?.attempts} answer sheet${paper.results?.attempts === 1 ? '' : 's'} checked`}><FiAward aria-hidden />Best {best.score}/{best.total}</span> : null}
      </span>
      {paper.description ? <p className="text-sm leading-6 text-muted">{paper.description}</p> : null}
      <span className="mt-auto flex flex-wrap gap-2">
        {paper.fileUrl && path ? <>
          <button type="button" disabled={busy} onClick={() => void run(() => openMaterial(paper.fileUrl ?? '', paper.title))} className="btn btn-primary btn-sm gap-2 rounded-full">
            <FiBookOpen aria-hidden />Open</button>
          <button type="button" disabled={busy} onClick={() => void run(() => downloadFile(path, paper.fileName ?? `${paper.title}.pdf`))} className="btn btn-sm gap-2 rounded-full">
            {busy ? <span className="loading loading-spinner loading-xs" /> : <FiDownload aria-hidden />}Download</button>
        </> : null}
        {paper.hasAnswerKey ? <Link to={`/exams/papers/${paper.id}`} className="btn btn-sm gap-2 rounded-full"><FiCheckSquare aria-hidden />{paper.results ? 'Check again' : 'Check my answers'}</Link> : null}
        {paper.sourceUrl ? <a href={paper.sourceUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm gap-2 rounded-full"><FiExternalLink aria-hidden />Official page</a> : null}
      </span>
      {paper.audio.length ? (
        <details className="rounded-field bg-base-200 p-3">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><FiHeadphones aria-hidden />Listening audio ({paper.audio.length})</summary>
          <div className="mt-2"><PaperAudioList audio={paper.audio} /></div>
        </details>
      ) : paper.sourceUrl ? <p className="text-xs text-muted">The listening audio is on the official page.</p> : null}
      {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
    </li>
  );
}

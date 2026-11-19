import { useState } from 'react';
import { FiCheckSquare,FiEdit2,FiExternalLink,FiFileText,FiMusic,FiTrash2,FiUsers } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { listLevels } from '../../lib/services';
import { deleteExamPaper,listExamPapers } from '../../lib/services/exam-centre';
import type { StaffExamPaper } from '../../lib/services/exam-centre';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../common/PageState';
import { Modal } from '../ui/Modal';
import { Panel,SectionHeader } from '../ui/Panel';
import { ExamPaperForm } from './ExamPaperForm';

/** Past papers students use in Exams & past papers (official sample exams, past papers), per course level. */
export function ResourceExamPapers() {
  const papers = useApi('staff-exam-papers', listExamPapers);
  const levels = useApi('levels-for-papers', listLevels);
  const [editing, setEditing] = useState<StaffExamPaper | 'new' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function remove(paper: StaffExamPaper) {
    if (!confirm(`Delete "${paper.title}"? Students will no longer see it.`)) return;
    try { await deleteExamPaper(paper.id); setMessage('Paper deleted.'); papers.refetch(); }
    catch (e) { setMessage(apiErrorMessage(e, 'Could not delete the paper.')); }
  }
  const list = papers.data ?? [];
  return (
    <Panel>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div><SectionHeader title="Past papers" className="mb-1" /><p className="text-xs text-muted">Students of each course see these under Exams &amp; past papers. Add the listening recordings so they can play them in the app, and an answer key for an online answer sheet.</p></div>
        <button type="button" className="btn btn-sm rounded-full" onClick={() => { setEditing('new'); setMessage(null); }} disabled={!levels.data?.length}>New paper</button>
      </div>
      {message ? <p role="status" className="mb-3 text-xs">{message}</p> : null}
      {papers.loading ? <LoadingBlock label="Loading exam papers…" /> : papers.error ? <ErrorBlock message={papers.error} onRetry={papers.refetch} />
        : !list.length ? <EmptyBlock title="No past papers yet" hint="Upload an official sample exam or past paper (PDF) for a course level." />
        : <ul className="divide-y divide-line">
          {list.map((paper) => (
            <li key={paper.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-base-200"><FiFileText aria-hidden /></span>
              <span className="min-w-0 grow">
                <span className="block text-sm font-semibold">{paper.level.code} · {paper.title}{paper.isPublished ? null : <span className="badge badge-sm ml-2">Hidden</span>}</span>
                <span className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
                  <span>{[paper.provider, paper.edition].filter(Boolean).join(' · ')}</span>
                  {paper.fileUrl ? <span>PDF</span> : null}
                  {paper.sourceUrl ? <a href={paper.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline"><FiExternalLink aria-hidden />Official page</a> : null}
                  {paper.answerKey ? <span className="inline-flex items-center gap-1"><FiCheckSquare aria-hidden />Answer sheet</span> : null}
                  {paper.audio.length ? <span className="inline-flex items-center gap-1"><FiMusic aria-hidden />{paper.audio.length} recording{paper.audio.length === 1 ? '' : 's'}</span> : null}
                  {paper._count.attempts ? <span className="inline-flex items-center gap-1"><FiUsers aria-hidden />{paper._count.attempts} checked answer sheet{paper._count.attempts === 1 ? '' : 's'}</span> : null}
                </span>
              </span>
              <button type="button" className="btn btn-ghost btn-sm btn-circle" aria-label={`Edit ${paper.title}`} onClick={() => { setEditing(paper); setMessage(null); }}><FiEdit2 aria-hidden /></button>
              <button type="button" className="btn btn-ghost btn-sm btn-circle" aria-label={`Delete ${paper.title}`} onClick={() => void remove(paper)}><FiTrash2 aria-hidden /></button>
            </li>
          ))}
        </ul>}
      <Modal open={editing !== null} boxClassName="max-w-2xl" onClose={() => setEditing(null)} title={editing === 'new' ? 'New past paper' : 'Edit past paper'}>
        {editing !== null && levels.data ? <ExamPaperForm key={editing === 'new' ? 'new' : editing.id} paper={editing === 'new' ? null : editing} levels={levels.data}
          onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); setMessage('Paper saved.'); papers.refetch(); }} /> : null}
      </Modal>
    </Panel>
  );
}

import { FiAlertCircle, FiArrowDown, FiArrowUp, FiCheck, FiChevronDown, FiCopy, FiTrash2 } from 'react-icons/fi';
import { QuestionEditor } from './QuestionEditor';
import { questionMeta } from './question-meta';
import type { AuthoredQuestion } from './types';
import { questionIssue } from './validate';

type Props = {
  value: AuthoredQuestion; index: number; count: number; open: boolean; locked: boolean;
  onToggle: () => void; onChange: (q: AuthoredQuestion) => void; onRemove: () => void; onMove: (delta: number) => void; onDuplicate: () => void;
};

/** One line per question when closed (type, text, points, ready state); the editor when open. */
export function QuestionRow({ value: q, index, count, open, locked, onToggle, onChange, onRemove, onMove, onDuplicate }: Props) {
  const meta = questionMeta(q.type);
  const issue = questionIssue(q);
  const Icon = meta.icon;
  const tools = (
    <>
      <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label={`Move question ${index + 1} up`} disabled={locked || index === 0} onClick={() => onMove(-1)}><FiArrowUp aria-hidden /></button>
      <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label={`Move question ${index + 1} down`} disabled={locked || index === count - 1} onClick={() => onMove(1)}><FiArrowDown aria-hidden /></button>
      <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label={`Duplicate question ${index + 1}`} disabled={locked || count >= 50} onClick={onDuplicate}><FiCopy aria-hidden /></button>
      <button type="button" className="btn btn-ghost btn-xs btn-square text-error" aria-label={`Delete question ${index + 1}`} disabled={locked} onClick={onRemove}><FiTrash2 aria-hidden /></button>
    </>
  );
  return (
    <li className={`min-w-0 rounded-box border bg-base-100 transition-colors ${open ? 'border-brand' : 'border-base-300 hover:border-base-content'}`}>
      <div className="flex items-center gap-2 p-2 pl-3">
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="w-5 shrink-0 text-xs font-semibold text-muted">{index + 1}</span>
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-base-200 text-sm" title={meta.label}><Icon aria-hidden /></span>
          <span className="min-w-0 flex-1 truncate text-sm">{q.prompt || <span className="text-muted">New {meta.short.toLowerCase()} question</span>}</span>
          <span className="shrink-0 text-xs text-muted tabular-nums">{q.points} pt{q.points === 1 ? '' : 's'}</span>
          {issue ? <FiAlertCircle aria-label={`Needs attention: ${issue}`} className="shrink-0 text-warning" /> : <FiCheck aria-label="Ready" className="shrink-0 text-success" />}
          <FiChevronDown aria-hidden className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <div className="hidden shrink-0 sm:flex">{tools}</div>
      </div>
      {open ? (
        <>
          <div className="flex justify-end border-t border-base-300 px-2 py-1 sm:hidden">{tools}</div>
          {issue ? <p className="mx-4 mb-2 text-xs text-warning">To finish: {issue}</p> : null}
          <QuestionEditor value={q} index={index} locked={locked} onChange={onChange} />
        </>
      ) : null}
    </li>
  );
}

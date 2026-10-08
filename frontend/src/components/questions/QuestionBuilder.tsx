import { useState } from 'react';
import { AddQuestionBar } from './AddQuestionBar';
import { questionMeta } from './question-meta';
import { QuestionRow } from './QuestionRow';
import type { AuthoredQuestion } from './types';
import { copyQuestion, newQuestion } from './types';
import { questionIssue } from './validate';

type Props = { value: AuthoredQuestion[]; onChange: (q: AuthoredQuestion[]) => void; locked?: boolean };

/** Compact question list: one open at a time, quick add by type, duplicate and reorder. */
export function QuestionBuilder({ value, onChange, locked = false }: Props) {
  const [openId, setOpenId] = useState<string | null>(value[0]?.id ?? null);
  const points = value.reduce((sum, q) => sum + Number(q.points || 0), 0);
  const auto = value.filter(q => questionMeta(q.type).auto).length;
  const pending = value.filter(q => questionIssue(q)).length;
  const replace = (id: string, q: AuthoredQuestion) => onChange(value.map(item => item.id === id ? q : item));
  function add(type: string) { const q = newQuestion(type); onChange([...value, q]); setOpenId(q.id); }
  function duplicate(index: number) { const q = copyQuestion(value[index]); onChange([...value.slice(0, index + 1), q, ...value.slice(index + 1)]); setOpenId(q.id); }
  function move(index: number, delta: number) { const next = [...value]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; onChange(next); }
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span><strong className="text-base-content">{value.length}</strong>/50 questions</span>
        <span><strong className="text-base-content">{points}</strong> points</span>
        <span>{auto} marked automatically</span>
        {pending ? <span className="text-warning">{pending} to finish</span> : value.length ? <span className="text-success">All ready</span> : null}
      </div>
      {value.length ? (
        <ol className="space-y-2">
          {value.map((q, index) => (
            <QuestionRow key={q.id} value={q} index={index} count={value.length} open={openId === q.id} locked={locked}
              onToggle={() => setOpenId(openId === q.id ? null : q.id)} onChange={updated => replace(q.id, updated)}
              onRemove={() => onChange(value.filter(item => item.id !== q.id))} onMove={delta => move(index, delta)} onDuplicate={() => duplicate(index)} />
          ))}
        </ol>
      ) : null}
      <AddQuestionBar onAdd={add} disabled={locked || value.length >= 50} />
      {locked ? <p className="text-xs text-muted">Questions stay fixed after students submit.</p> : null}
    </section>
  );
}

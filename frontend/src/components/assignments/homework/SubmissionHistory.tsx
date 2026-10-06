import { useState } from 'react';
import { AttachmentList } from './AttachmentList';
import { dateLabel } from './format';
import { HomeworkQuestions } from './HomeworkQuestions';
import type { Attachment,HomeworkQuestion,Submission } from './types';
export function SubmissionHistory({ submission, files, assignmentId, questions = [] }: { submission: Submission | null; files: Attachment[]; assignmentId: string; questions?: HomeworkQuestion[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!submission?.versions?.length) return null;
  return <section className="card border border-base-300/70 bg-base-100 p-5"><h2 className="mb-3 text-sm font-semibold">Your submission history</h2>{submission.versions.map(v => <div key={v.id} className="border-t border-base-300/60 py-3"><button type="button" className="flex w-full flex-wrap items-center justify-between gap-2 text-left text-xs" aria-expanded={open === v.id} onClick={() => setOpen(open === v.id ? null : v.id)}><span className="font-semibold">Submission {v.revision}{v.isLate ? ' · Late' : ''}</span><span className="text-base-content/55">{dateLabel(v.submittedAt, true)} · {open === v.id ? 'Hide' : 'View'}</span></button>{open === v.id ? <div className="mt-4 space-y-3"><p className="whitespace-pre-wrap text-sm leading-7">{v.text}</p>{questions.length ? <HomeworkQuestions questions={questions} responses={v.responses ?? {}} disabled /> : null}<AttachmentList assignmentId={assignmentId} files={files.filter(f => v.fileIds.includes(f.id))} />{v.feedback ? <div className="rounded-field bg-base-200/60 p-4"><p className="mb-2 text-xs font-semibold">Teacher feedback{v.score !== null ? ` · ${v.score} points` : ''}</p><p className="whitespace-pre-wrap text-sm leading-7 text-base-content/70">{v.feedback}</p></div> : null}</div> : null}</div>)}</section>;
}

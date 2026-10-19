import { AudioPlayback } from './AudioPlayback';
import { statusLabels } from './format';
import { appliedPenalty } from './late-policy';
import type { Attachment, Homework, Submission } from './types';

type Props = { assignment: Homework; submission: Submission; feedbackFiles: Attachment[] };

/** The teacher's result for the student: score (with any late penalty explained), written and audio feedback. */
export function HomeworkFeedback({ assignment: a, submission: s, feedbackFiles }: Props) {
  const audio = feedbackFiles.find(f => f.id === s.feedbackAudioFileId);
  if (!s.feedback && !audio) return null;
  const returned = s.status === 'RETURNED';
  const penalty = appliedPenalty(s);
  return (
    <section className={`card border p-5 sm:p-7 ${returned ? 'border-warning bg-warning text-warning-content' : 'border-success bg-success text-success-content'}`}>
      <p className="text-[0.625rem] font-semibold uppercase tracking-wider">{returned ? 'A chance to improve' : 'Your teacher’s feedback'}</p>
      <div className="mt-2 flex justify-between gap-4"><h2 className="text-base font-semibold">{statusLabels[s.status]}</h2>{s.score !== null ? <span className="font-bold">{s.score}/{a.maxPoints}</span> : null}</div>
      {penalty ? <p className="mt-2 text-xs">Your teacher scored this {penalty.rawScore}/{a.maxPoints}. It was handed in late, so {penalty.percent}% was taken off.</p> : null}
      {s.feedback ? <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{s.feedback}</p> : null}
      {audio ? <div className="mt-3"><p className="text-xs font-semibold">Audio feedback</p><AudioPlayback assignmentId={a.id} file={audio} /></div> : null}
    </section>
  );
}

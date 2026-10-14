import { FiArrowRight,FiClock } from 'react-icons/fi';
import { AntiCheatGuard } from './AntiCheatGuard';
import { AssessmentQuestion } from './AssessmentQuestion';
import { AssignmentInstructions } from './AssignmentInstructions';
import { AssignmentReadyPanel } from './AssignmentReadyPanel';
import { AssignmentResult } from './AssignmentResult';
import type { AssignmentDetailData } from './types';
import { useAssessmentWork } from './useAssessmentWork';

export function AssessmentWork({ data }: { data: AssignmentDetailData }) {
  const work = useAssessmentWork(data);
  if (work.result) return <AssignmentResult title={work.result.passed ? 'Assessment passed' : work.result.status === 'GRADED' ? 'Assessment graded' : 'Submitted · awaiting feedback'} retryLabel="Try another attempt" onRedo={work.canRetry ? () => void work.retry() : undefined} feedback={work.result.feedback} score={work.result.score !== null && work.result.maxScore !== null ? `${work.result.score}/${work.result.maxScore} pts${work.result.percentage !== null ? ` · ${work.result.percentage}%` : ''}` : null} />;
  if (!work.started || !work.attempt) return <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]"><AssignmentInstructions data={data} /><AssignmentReadyPanel onStart={() => void (work.attempt ? work.resume() : work.start())} loading={work.starting} exhausted={!work.attempt && work.exhausted} error={work.error} questions={work.assessment?.questions.length ?? data.assessment?._count?.questions} duration={work.assessment?.durationMinutes ?? data.assessment?.durationMinutes} attempts={work.attemptsUsed} maxAttempts={work.maxAttempts} protectedMode={work.protectedMode} passMark={work.assessment?.passMark ?? data.assessment?.passMark} due={data.assessment?.availableUntil} /></div>;
  const questions = work.assessment?.questions ?? [];
  const answered = questions.filter(({ question }) => work.responses[question.id] !== undefined && work.responses[question.id] !== '' && (!Array.isArray(work.responses[question.id]) || (work.responses[question.id] as unknown[]).length > 0)).length;
  return (
    <AntiCheatGuard enabled={work.protectedMode && work.started && !work.locked} persistKey={`cheat:ASM:${work.attempt.id}`} onViolation={work.onViolation} onLock={work.onLock}>
      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-field bg-base-200 p-3"><span className="text-xs font-semibold">{answered}/{questions.length} answered · {work.saveState}</span><progress className="progress progress-primary h-1.5 w-24 sm:flex-1 sm:max-w-xs" value={answered} max={questions.length || 1} aria-label="Questions answered" />{work.timeLeft !== null ? <span role="timer" className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${work.timeLeft < 60 ? 'bg-error text-error-content' : 'bg-base-100'}`}><FiClock aria-hidden />{Math.floor(work.timeLeft / 60)}:{String(work.timeLeft % 60).padStart(2, '0')}</span> : null}</div>
        {work.locked ? <p role="alert" className="rounded-field bg-error text-error-content p-3 text-xs text-error">Assessment locked after three violations. Submitting for review.</p> : null}
        {work.error ? <p role="alert" className="rounded-field bg-error text-error-content p-3 text-xs text-error">{work.error}</p> : null}
        {questions.map((item, index) => <AssessmentQuestion key={`${work.attempt!.id}-${item.id}`} item={item} index={index} value={work.responses[item.question.id]} onChange={(value) => work.setResponses((previous) => ({ ...previous, [item.question.id]: value }))} disabled={work.locked || work.submitting} />)}
        <div className="flex flex-wrap justify-between gap-3 border-t border-base-300 pt-4"><button type="button" onClick={() => void work.exit()} disabled={work.submitting} className="btn btn-sm rounded-full">Exit</button><button type="button" disabled={work.submitting || work.locked} onClick={() => void work.submit()} className="btn btn-primary btn-sm gap-2 rounded-full">{work.submitting ? <span className="loading loading-spinner loading-xs" /> : null}Submit assessment<FiArrowRight aria-hidden /></button></div>
      </div>
    </AntiCheatGuard>
  );
}

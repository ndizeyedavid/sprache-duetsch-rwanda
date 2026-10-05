import { FiArrowRight } from 'react-icons/fi';
import { ActivityAnswer } from './ActivityAnswer';
import { AssignmentInstructions } from './AssignmentInstructions';
import { AssignmentReadyPanel } from './AssignmentReadyPanel';
import { AssignmentResult } from './AssignmentResult';
import { useActivityWork } from './useActivityWork';
import type { AssignmentDetailData } from './types';

type Props = { data: AssignmentDetailData; activity: NonNullable<AssignmentDetailData['activity']>; refetch: () => void };

export function ActivityWork({ data, activity, refetch }: Props) {
  const work = useActivityWork(activity, refetch);
  if (!work.started && data.submission) return <AssignmentResult title={data.submission.status === 'GRADED' ? 'Graded' : 'Submitted · awaiting feedback'} score={data.submission.score === null ? null : `Score: ${data.submission.score}`} feedback={data.submission.feedback} onRedo={() => void work.start()} />;
  if (!work.started) return <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]"><AssignmentInstructions data={data} /><AssignmentReadyPanel activity onStart={() => void work.start()} error={work.error} /></div>;
  return (
    <section className="card learning-panel">
      <div className="space-y-5 p-5 sm:p-6">
        <AssignmentInstructions data={data} />
        <div className="flex justify-between gap-3"><h3 className="text-sm font-semibold">Your answer</h3><span className="text-[10px] text-base-content/50">Device draft saves as you write</span></div>
        <ActivityAnswer activity={activity} answer={work.answer} onAnswer={work.setAnswer} disabled={work.submitting} />
        {work.error ? <p role="alert" className="text-xs text-error">{work.error}</p> : null}
        <div className="flex flex-wrap justify-between gap-3 border-t border-base-300/70 pt-4"><button type="button" onClick={() => void work.exit()} disabled={work.submitting} className="btn btn-sm rounded-full">Exit</button><button type="button" onClick={() => void work.submit()} disabled={work.submitting || !work.answer.trim()} className="btn btn-primary btn-sm gap-2 rounded-full">{work.submitting ? <span className="loading loading-spinner loading-xs" /> : null}Submit answer<FiArrowRight aria-hidden /></button></div>
      </div>
    </section>
  );
}

import { AssessmentQuestion } from '../assignments/AssessmentQuestion';
import type { PlacementSession,PlacementSubmitResult } from '../../lib/services/placement-types';
import { PlacementNavigator } from './PlacementNavigator';
import { PlacementProgressBar } from './PlacementProgressBar';
import { PlacementSubmitBar } from './PlacementSubmitBar';
import { usePlacementRunner } from './usePlacementRunner';

type Props = {
  session: PlacementSession;
  onFinished: (result: PlacementSubmitResult) => void;
  /** Leave the test; answers are already saved and a timer keeps running. */
  onExit: () => void;
};

/**
 * One question per screen (mobile-first). Every question stays mounted but hidden,
 * so shuffled options keep their order when the student goes back.
 */
export function PlacementRunner({ session, onFinished, onExit }: Props) {
  const run = usePlacementRunner(session, onFinished);
  const timeUp = run.timeLeft === 0;

  async function exit() {
    await run.save();
    onExit();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <PlacementProgressBar index={run.index} total={run.total} answered={run.answered} saveState={run.saveState} timeLeft={run.timeLeft} />
      {timeUp ? <p role="status" className="alert alert-warning text-xs">Time is up — submitting your saved answers…</p> : null}
      {run.error ? (
        <div role="alert" className="alert alert-error text-xs">
          <span>{run.error}</span>
          <button type="button" className="btn btn-xs" onClick={() => void run.submit()} disabled={run.submitting}>Retry</button>
        </div>
      ) : null}
      {session.questions.map((item, position) => (
        <div key={item.id} hidden={position !== run.index}>
          <AssessmentQuestion
            item={item}
            index={position}
            value={run.responses[item.question.id]}
            onChange={(value) => run.answer(item.question.id, value)}
            disabled={run.submitting || timeUp}
          />
        </div>
      ))}
      <PlacementSubmitBar
        index={run.index}
        total={run.total}
        answered={run.answered}
        submitting={run.submitting}
        onPrev={() => run.go(run.index - 1)}
        onNext={() => run.go(run.index + 1)}
        onSubmit={() => void run.submit()}
        onExit={() => void exit()}
      />
      <PlacementNavigator questions={session.questions} responses={run.responses} index={run.index} onJump={run.go} />
    </div>
  );
}

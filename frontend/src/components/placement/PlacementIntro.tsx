import { FiArrowRight,FiClock,FiFileText,FiRepeat,FiTarget } from 'react-icons/fi';
import type { MyPlacement } from '../../lib/services/placement-types';
import { levelName } from './utils';

type Props = { data: MyPlacement; onStart: () => void; starting: boolean; error: string | null; retake?: boolean };

/** Before the test: what to expect, and a start / resume button. */
export function PlacementIntro({ data, onStart, starting, error, retake }: Props) {
  const test = data.test;
  if (!test) return null;
  const resuming = Boolean(data.activeAttempt);
  const facts = [
    { label: 'Questions', value: String(test.questionCount), icon: FiFileText },
    { label: 'Time', value: test.durationMinutes ? `${test.durationMinutes} min` : 'Untimed', icon: FiClock },
    { label: 'Attempts', value: `${data.attemptsUsed} / ${test.maxAttempts}`, icon: FiRepeat },
    { label: 'Your choice', value: levelName(data.intendedLevel), icon: FiTarget },
  ];
  return (
    <section className="card learning-panel gap-4 p-5 sm:p-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{retake ? 'Retake available' : 'Placement test'}</p>
        <h2 className="mt-1 text-lg font-semibold">{test.title}</h2>
        {test.description ? <p className="mt-2 text-sm leading-6 text-muted">{test.description}</p> : null}
      </div>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-field bg-base-200 p-3">
            <dt className="flex items-center gap-1.5 text-[10px] text-muted"><fact.icon aria-hidden />{fact.label}</dt>
            <dd className="mt-1.5 text-sm font-semibold">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <ul className="list-disc space-y-1 pl-5 text-xs leading-5 text-muted">
        <li>Questions get harder as you go (A1 → B2). Answer what you can; it is fine to skip.</li>
        <li>Your answers save automatically. {test.durationMinutes ? 'The timer keeps running if you leave, and the test submits itself at zero.' : ''}</li>
        <li>The result recommends a level. The academic office confirms your level before enrolment.</li>
      </ul>
      {error ? <p role="alert" className="alert alert-error text-xs">{error}</p> : null}
      <button type="button" className="btn btn-primary gap-2 rounded-full sm:self-start" disabled={starting || !data.canStart} onClick={onStart}>
        {starting ? <span className="loading loading-spinner loading-xs" /> : null}
        {resuming ? 'Resume test' : retake ? 'Retake test' : 'Start test'}
        <FiArrowRight aria-hidden />
      </button>
    </section>
  );
}

import { FiArrowRight,FiTarget } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { getMyPlacement } from '../../lib/services/placement-api';
import type { MyPlacement } from '../../lib/services/placement-types';

function promptFor(data: MyPlacement, hasCourses: boolean): { title: string; body: string; cta: string } | null {
  const level = data.latest?.recommendedLevel.code;
  switch (data.status) {
    case 'IN_PROGRESS':
      return { title: 'Finish your placement test', body: 'Your answers are saved. Pick up where you left off.', cta: 'Resume test' };
    case 'AWAITING_DECISION':
      return { title: `Placement result: ${level ?? '—'} recommended`, body: 'An academic admin will confirm your level soon.', cta: 'View result' };
    case 'NOT_TAKEN':
      return hasCourses ? null : {
        title: 'Find your German level',
        body: `Take the ${data.test?.durationMinutes ? `${data.test.durationMinutes}-minute ` : ''}placement test so we can place you in the right class.`,
        cta: 'Start placement test',
      };
    case 'CONFIRMED':
      return hasCourses ? null : {
        title: `Your level is confirmed: ${data.latest?.assignedLevel?.code ?? level ?? '—'}`,
        body: 'The academic office will contact you about enrolment.',
        cta: 'View result',
      };
    default:
      return null;
  }
}

/** Dashboard nudge towards the placement test. Hidden once it is no longer useful. */
export function PlacementPromptCard({ hasCourses }: { hasCourses?: boolean }) {
  const placement = useApi('my-placement', getMyPlacement, hasCourses !== undefined);
  const prompt = placement.data && hasCourses !== undefined ? promptFor(placement.data, hasCourses) : null;
  if (!prompt) return null;
  return (
    <Link to="/placement" className="card learning-panel flex-row items-center gap-3 p-4 transition hover:border-primary">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-content">
        <FiTarget aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{prompt.title}</span>
        <span className="mt-0.5 block text-xs text-muted">{prompt.body}</span>
      </span>
      <span className="btn btn-sm btn-primary hidden gap-1 rounded-full sm:inline-flex">
        {prompt.cta}
        <FiArrowRight aria-hidden />
      </span>
      <FiArrowRight aria-hidden className="sm:hidden" />
    </Link>
  );
}

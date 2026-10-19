import { FiBookOpen,FiTarget } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyPlacement,StudentPlacementResult } from '../../lib/services/placement-types';
import { heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';
import { levelName } from './utils';

type Props = { data?: MyPlacement | null; latest?: StudentPlacementResult | null; title?: string; running?: boolean };

/** Placement header: what the test is for and where the student stands (not taken / recommended / confirmed). */
export function PlacementHero({ data, latest, title, running }: Props) {
  if (running) {
    return <PageHero compact eyebrow="Einstufungstest" icon={FiTarget} title={title ?? 'Placement test'} description="One question at a time. Your answers save as you go." art="placement" />;
  }
  const status = !data ? null
    : data.status === 'IN_PROGRESS' ? 'Test in progress'
      : latest ? latest.assignedLevel ? `Confirmed: ${levelName(latest.assignedLevel)}` : `Recommended: ${levelName(latest.recommendedLevel)}`
        : data.status === 'UNAVAILABLE' ? 'Not available yet' : 'Not taken yet';
  return (
    <PageHero
      eyebrow="Einstufungstest"
      icon={FiTarget}
      title="Placement test"
      description="Find your German level, from A1 to B2. Answer what you can — the result recommends a level, and the academic office confirms it."
      art="placement"
      meta={status ? <>
        <span className="hero-chip hero-chip-solid">{status}</span>
        {latest ? <span className="hero-chip">Last score {latest.score}%</span> : null}
      </> : null}
      actions={<Link to="/courses" className={heroGhost}><FiBookOpen aria-hidden />My courses</Link>}
    />
  );
}

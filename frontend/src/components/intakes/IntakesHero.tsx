import { FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { IntakeItem } from '../../lib/services';
import { isRegistrationOpen } from './utils';
import { WORKSPACE_CONTEXT } from '../admin/workspace-context';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

const context = WORKSPACE_CONTEXT.intakes;

type Props = { intakes: IntakeItem[] | null; onCreate: () => void };

/** Red page header for the intake register: counts as chips, "New intake" as the main action. */
export function IntakesHero({ intakes, onCreate }: Props) {
  const active = intakes?.filter((intake) => intake.isActive).length ?? 0;
  const open = intakes?.filter((intake) => isRegistrationOpen(intake)).length ?? 0;
  return (
    <PageHero
      eyebrow={context.category}
      icon={context.icon}
      title="Intakes"
      description="Set when each intake starts and ends, then open or close registration in one click."
      art="schedule"
      meta={
        intakes ? (
          <>
            <span className="hero-chip hero-chip-solid">{open} open for registration</span>
            <span className="hero-chip">{intakes.length} intake{intakes.length === 1 ? '' : 's'}</span>
            <span className="hero-chip">{active} active</span>
            <span className="hero-chip">{intakes.length - active} archived</span>
          </>
        ) : null
      }
      actions={
        <>
          <button type="button" className={heroAction} onClick={onCreate}>
            <FiPlus aria-hidden /> New intake
          </button>
          {context.links.map((link) => (
            <Link key={link.to} to={link.to} className={heroGhost}>{link.label}</Link>
          ))}
        </>
      }
    />
  );
}

import { format } from 'date-fns';
import { FiArrowUpRight,FiCalendar,FiClock,FiPlus } from 'react-icons/fi';
import { WORKSPACE_CONTEXT } from '../admin/workspace-context';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';
import { WorkspaceHeroLinks } from '../teacher/WorkspaceHeroLinks';
import type { ScheduleSession } from './ScheduleSessionCard';

type Props = { sessions: ScheduleSession[]; onOpen: (id: string) => void; onNew: () => void; admin?: boolean };

/** Staff schedule header: the next (or live) class, the calendar time zone and "New session". */
export function TeacherScheduleHero({ sessions, onOpen, onNew, admin = false }: Props) {
  const next = sessions.filter(s => ['LIVE','SCHEDULED','RESCHEDULED'].includes(s.status) && Date.parse(s.endAt) > Date.now())
    .sort((a,b) => Number(b.status === 'LIVE') - Number(a.status === 'LIVE') || Date.parse(a.startAt) - Date.parse(b.startAt))[0];
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_', ' ');
  return (
    <PageHero eyebrow={admin ? WORKSPACE_CONTEXT.schedule.category : 'Your teaching week'} icon={FiCalendar} title="Schedule" art="schedule" scoped
      description={next
        ? <>{next.status === 'LIVE' ? 'Live now' : 'Next up'}: <strong className="font-semibold">{next.title}</strong>{next.classGroup ? ` · ${next.classGroup.name}` : ''}</>
        : admin ? 'Plan class sessions across the school and keep every group on track.' : 'Plan a focused session and give your students something to look forward to.'}
      meta={<>
        {next ? <span className="hero-chip hero-chip-solid"><FiClock aria-hidden />{format(new Date(next.startAt), 'EEE d MMM · HH:mm')}–{format(new Date(next.endAt), 'HH:mm')}</span> : null}
        <span className="hero-chip" title="Each class's own time zone is shown in its details">Times in {zone}</span>
      </>}
      actions={<>
        <button type="button" onClick={onNew} className={heroAction}><FiPlus aria-hidden />New session</button>
        {next ? <button type="button" onClick={() => onOpen(next.id)} className={heroGhost}>{next.status === 'LIVE' ? 'Open live class' : 'Prepare for class'}<FiArrowUpRight aria-hidden /></button> : null}
        {admin ? <WorkspaceHeroLinks segment="schedule" /> : null}
      </>} />
  );
}

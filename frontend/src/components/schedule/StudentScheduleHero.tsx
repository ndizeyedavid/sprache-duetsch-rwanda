import { format } from 'date-fns';
import { FiCalendar,FiClock,FiInfo,FiVideo } from 'react-icons/fi';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

type HeroSession = {
  id: string; title: string; startAt: string; endAt: string; status: string; mode: string;
  room?: string | null; meetingUrl: string | null; teacher: { firstName: string; lastName: string } | null;
};

type Props = { sessions: HeroSession[]; loading: boolean; onOpen: (id: string) => void };

/** Student schedule header: the next (or live) class with its link, time and teacher. */
export function StudentScheduleHero({ sessions, loading, onOpen }: Props) {
  const next = sessions.filter(s => ['LIVE', 'SCHEDULED', 'RESCHEDULED'].includes(s.status) && Date.parse(s.endAt) > Date.now())
    .sort((a, b) => Number(b.status === 'LIVE') - Number(a.status === 'LIVE') || Date.parse(a.startAt) - Date.parse(b.startAt))[0];
  const live = next?.status === 'LIVE';
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_', ' ');
  return (
    <PageHero
      eyebrow={live ? 'Class is live' : 'Mein Stundenplan'}
      icon={FiCalendar}
      title="My schedule"
      description={loading ? 'Finding your next class…' : next ? <>
        <strong className="font-semibold">{live ? 'Live now' : 'Next class'}: {next.title}</strong><br />
        {format(new Date(next.startAt), 'EEE d MMM · HH:mm')}–{format(new Date(next.endAt), 'HH:mm')} · {next.mode === 'ONSITE' ? next.room ?? 'On campus' : 'Online class'}{' · '}
        {next.teacher ? `With ${next.teacher.firstName} ${next.teacher.lastName}` : 'Teacher to be confirmed'}
      </> : 'No class scheduled yet. Your live classes appear here — until then, keep building your German with your course lessons.'}
      art={live ? 'live' : 'schedule'}
      meta={<span className="hero-chip"><FiClock aria-hidden />Times in {zone}</span>}
      actions={next ? <>
        {next.meetingUrl ? <a href={next.meetingUrl} target="_blank" rel="noreferrer" className={heroAction}><FiVideo aria-hidden />{live ? 'Join class' : 'Open class link'}</a> : null}
        <button type="button" onClick={() => onOpen(next.id)} className={next.meetingUrl ? heroGhost : heroAction}><FiInfo aria-hidden />Class details</button>
      </> : null}
    />
  );
}

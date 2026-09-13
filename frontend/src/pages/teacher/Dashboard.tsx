import { Link } from 'react-router-dom';
import { FiAward, FiBookOpen, FiCheckSquare, FiClock } from 'react-icons/fi';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatTile } from '../../components/ui/StatTile';
import { ScheduleCard } from '../../components/cards/ScheduleCard';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { photos } from '../../lib/images';
import { isoDate, isoTime, getTeacherDashboard, humanize } from '../../lib/services';
import { sessionStatusLabel, sessionTone } from '../../lib/sessions-ui';

const AVATARS = [photos.clarisse, photos.nadine, photos.jeanPaul, photos.aline, photos.eric];

export function TeacherDashboard() {
  const dashboard = useApi('teacher-dashboard', getTeacherDashboard);

  if (dashboard.loading) return <LoadingBlock label="Loading your dashboard…" />;
  if (dashboard.error || !dashboard.data) {
    return <ErrorBlock message={dashboard.error ?? 'Could not load your dashboard.'} onRetry={dashboard.refetch} />;
  }

  const data = dashboard.data;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="My classes" value={String(data.classesCount)} tone="brand" variant="solid" icon={FiBookOpen} />
        <StatTile label="My students" value={String(data.studentsCount)} tone="sun" variant="solid" icon={FiCheckSquare} />
        <StatTile
          label="Upcoming sessions"
          value={String(data.upcomingSessionsCount)}
          tone="navy"
          variant="solid"
          icon={FiClock}
        />
        <StatTile
          label="Awaiting grading"
          value={String(data.pendingGradingCount)}
          tone="coral"
          variant="solid"
          icon={FiAward}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <SectionHeader title="Today's sessions" action={{ label: 'Full schedule', to: '/teacher/schedule' }} />
          {data.sessionsToday.length === 0 ? (
            <EmptyBlock title="No sessions today" hint="Your next live classes appear on the schedule page." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.sessionsToday.map((session, index) => (
                <ScheduleCard
                  key={session.id}
                  title={session.title}
                  teacher={session.classGroup.name}
                  photo={AVATARS[index % AVATARS.length]}
                  date={isoDate(session.startAt)}
                  time={`${isoTime(session.startAt)} – ${isoTime(session.endAt)}`}
                  tone={sessionTone(session.status)}
                  status={sessionStatusLabel(session.status)}
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <SectionHeader title="Recent assessments" action={{ label: 'Grading', to: '/teacher/grading' }} />
          {data.recentAssessments.length === 0 ? (
            <EmptyBlock title="No assessments yet" hint="Published assessments for your levels show here." />
          ) : (
            <ul className="space-y-2">
              {data.recentAssessments.map((assessment) => (
                <li key={assessment.id} className="rounded-field bg-base-200 px-3 py-2 text-xs">
                  <p className="font-semibold">{assessment.title}</p>
                  <p className="mt-0.5 text-muted">
                    {humanize(assessment.type)} · {isoDate(assessment.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel>
        <h2 className="text-base font-semibold">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/teacher/attendance" className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90">
            Mark attendance
          </Link>
          <Link to="/teacher/grading" className="btn btn-sm rounded-full border-line bg-base-200">
            Grade submissions
          </Link>
          <Link to="/teacher/messages" className="btn btn-sm rounded-full border-line bg-base-200">
            Message students
          </Link>
        </div>
      </Panel>
    </div>
  );
}

import { useState } from 'react';
import { FiAward, FiBell, FiClock, FiGrid, FiTrendingUp, FiLayers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Panel } from '../../components/ui/Panel';
import { ProgressRow } from '../../components/ui/ProgressBar';
import { StatTile } from '../../components/ui/StatTile';
import { GroupedBar } from '../../components/charts/GroupedBar';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { COLORS } from '../../lib/theme';
import { getMyCourses, getMySkills, getStudentDashboard, getUpcomingSessions, humanize } from '../../lib/services';
import { useSession } from '../../lib/session';
import { WelcomeHero } from '../../components/common/WelcomeHero';
import { CourseProgressCard } from '../../components/student/CourseProgressCard';
import { UpNextCard } from '../../components/student/UpNextCard';
import { SkillsPanel } from '../../components/student/SkillsPanel';
import { DashboardCourseCard } from '../../components/student/DashboardCourseCard';
import { WeeklyRings } from '../../components/student/WeeklyRings';
import { addWeeks, subWeeks } from 'date-fns';

type WidgetId = 'myCourses' | 'learningStatus' | 'skills' | 'attendance';

const WIDGET_ORDER: WidgetId[] = ['myCourses', 'learningStatus', 'skills', 'attendance'];

export function Dashboard() {
  const { user } = useSession();
  const dashboard = useApi('student-dashboard', getStudentDashboard);
  const upcoming = useApi('upcoming-sessions', getUpcomingSessions);
  const skills = useApi('my-skills', getMySkills);
  const courses = useApi('my-courses', getMyCourses);

  const [weekAnchor, setWeekAnchor] = useState(() => new Date());

  if (dashboard.loading) return <LoadingBlock label="Loading your dashboard…" />;
  if (dashboard.error || !dashboard.data) return <ErrorBlock message={dashboard.error ?? 'Could not load dashboard.'} onRetry={dashboard.refetch} />;

  const data = dashboard.data;
  const courseList = courses.data ?? [];
  const sessions = upcoming.data ?? [];
  const attendanceTotal = data.attendance.present + data.attendance.absent + data.attendance.late + data.attendance.excused;
  const attendanceBars = [{ label: 'Sessions', present: data.attendance.present, absent: data.attendance.absent, late: data.attendance.late, excused: data.attendance.excused }];

  function renderWidget(id: WidgetId) {
    switch (id) {
      case 'myCourses':
        return (
          <Panel key="myCourses">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-bold"><FiGrid aria-hidden className="text-brand" />My courses</h2>
              <Link to="/courses" className="btn btn-xs rounded-full border-line bg-base-100">View all</Link>
            </div>
            {courses.loading ? <div className="mt-4"><LoadingBlock label="Loading courses…" /></div> : courses.error ? <div className="mt-4"><ErrorBlock message={courses.error} onRetry={courses.refetch} /></div> : courseList.length === 0 ? (
              <div className="mt-4"><EmptyBlock title="No courses yet" hint="Enrol in a level to see your course cards here." /></div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {courseList.map((course) => (
                  <DashboardCourseCard
                    key={course.level.id}
                    levelId={course.level.id}
                    code={course.level.code}
                    title={course.level.title}
                    levelLabel={course.level.levelLabel}
                    completion={course.stats.completionPercentage}
                    completed={course.stats.completedLessons}
                    total={course.stats.totalLessons}
                  />
                ))}
              </div>
            )}
          </Panel>
        );
      case 'learningStatus':
        return (
          <Panel key="learningStatus">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><FiClock aria-hidden className="text-brand" />Learning status</h2>
            <ProgressRow label="Lessons done" value={data.progress.completionPercentage} caption={`${data.progress.lessonsCompleted}/${data.progress.lessonsTotal}`} tone="brand" />
            {data.nextExam ? (
              <p className="mt-3 rounded-box bg-base-200 px-3 py-2 text-xs">
                <span className="text-muted">Next exam</span> <span className="font-semibold text-ink">{data.nextExam.title}</span>
                <span className="ml-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">{humanize(data.nextExam.type)}</span>
              </p>
            ) : <p className="mt-3 text-xs text-muted">No upcoming exam — keep studying and one will be assigned.</p>}
            <div className="mt-3 lg:hidden">
              <CourseProgressCard completion={data.progress.completionPercentage} code={data.currentLevel?.code ?? null} nextTitle={data.nextLesson?.title ?? null} />
            </div>
          </Panel>
        );
      case 'attendance':
        return (
          <Panel key="attendance">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><FiTrendingUp aria-hidden className="text-brand" />Attendance</h2>
            {attendanceTotal === 0 ? (
              <EmptyBlock title="No attendance yet" hint="Attendance appears after your first live class is marked." />
            ) : (
              <>
                <GroupedBar data={attendanceBars} xKey="label" barSize={22} series={[{ key: 'present', label: 'Present', color: COLORS.brand }, { key: 'late', label: 'Late', color: COLORS.sun }, { key: 'absent', label: 'Absent', color: COLORS.coral }, { key: 'excused', label: 'Excused', color: COLORS.muted }]} height={200} />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-muted">{data.attendance.percentage}% overall</span>
                  {data.attendance.percentage < 75 ? <Link to="/activity" className="rounded-full bg-coral-soft px-2.5 py-1 font-medium text-coral">Low attendance — check in</Link> : <span className="rounded-full bg-success/10 px-2.5 py-1 font-medium text-success">On track</span>}
                </div>
              </>
            )}
          </Panel>
        );
      case 'skills':
        return (
          <Panel key="skills">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold">Skills</h2>
              <Link to="/grades" className="text-xs font-medium text-brand hover:underline">Grades →</Link>
            </div>
            {skills.loading ? <LoadingBlock label="Loading skills…" /> : skills.error ? <ErrorBlock message={skills.error} onRetry={skills.refetch} /> : <SkillsPanel skills={skills.data ?? []} />}
          </Panel>
        );
      default: return null;
    }
  }

  return (
    <div className="space-y-4">
      <WelcomeHero
        firstName={user?.firstName ?? null}
        message="Every lesson brings you closer to speaking German with confidence. Pick up where you left off."
        action={{ label: 'Continue learning', to: '/courses' }}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Courses" value={String(courseList.length)} tone="brand" icon={FiLayers} delta={data.currentLevel ? `${data.currentLevel.code} active` : 'No active level'} />
        <StatTile label="Attendance" value={`${data.attendance.percentage}%`} tone={data.attendance.percentage < 75 ? 'coral' : 'sun'} icon={FiTrendingUp} delta={data.attendance.percentage < 75 && attendanceTotal > 0 ? 'Low — check activity' : `${data.attendance.present} present · ${data.attendance.late} late`} />
        <StatTile label="Notifications" value={String(data.unreadNotificationsCount)} tone="navy" icon={FiBell} delta={data.nextLesson ? `Next: ${data.nextLesson.title}` : 'All caught up'} />
        <StatTile label="Next exam" value={data.nextExam ? humanize(data.nextExam.type) : '—'} tone="coral" icon={FiAward} delta={data.nextExam ? data.nextExam.title : 'No exam scheduled'} />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          {WIDGET_ORDER.map((id) => renderWidget(id))}
        </div>

        <div className="xl:col-span-4">
          <div className="sticky top-4 space-y-4">
            <div className="hidden xl:block">
              <WeeklyRings courses={courseList} weekAnchor={weekAnchor} onPrev={() => setWeekAnchor((d) => subWeeks(d, 1))} onNext={() => setWeekAnchor((d) => addWeeks(d, 1))} onToday={() => setWeekAnchor(new Date())} />
            </div>
            <Panel><UpNextCard session={data.upcomingClass} sessions={sessions} /></Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

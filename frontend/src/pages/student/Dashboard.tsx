import { useEffect, useMemo, useState } from 'react';
import { FiAward, FiBell, FiBookOpen, FiClock, FiEye, FiGrid, FiSettings, FiTrendingUp, FiMove, FiEyeOff } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Panel } from '../../components/ui/Panel';
import { ProgressRow } from '../../components/ui/ProgressBar';
import { StatTile } from '../../components/ui/StatTile';
import { GroupedBar } from '../../components/charts/GroupedBar';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { COLORS } from '../../lib/theme';
import { rwf } from '../../lib/format';
import { getMyCourses, getMySkills, getStudentDashboard, getUpcomingSessions, money } from '../../lib/services';
import { HeroCard } from '../../components/student/HeroCard';
import { CourseProgressCard } from '../../components/student/CourseProgressCard';
import { UpNextCard } from '../../components/student/UpNextCard';
import { SkillsPanel } from '../../components/student/SkillsPanel';
import { DashboardCourseCard } from '../../components/student/DashboardCourseCard';
import { WeeklyRings } from '../../components/student/WeeklyRings';
import { useSession } from '../../lib/session';
import { addWeeks, subWeeks } from 'date-fns';

type WidgetId = 'myCourses' | 'progressOverview' | 'learningStatus' | 'skills' | 'schedule';

const WIDGETS: { id: WidgetId; label: string }[] = [
  { id: 'myCourses', label: 'My courses' },
  { id: 'progressOverview', label: 'Progress overview' },
  { id: 'learningStatus', label: 'Learning status' },
  { id: 'skills', label: 'Skills' },
  { id: 'schedule', label: 'Upcoming classes' },
];

const DEFAULT_ORDER: WidgetId[] = ['myCourses', 'progressOverview', 'learningStatus', 'skills', 'schedule'];

function widgetOrderKey(userId: string | undefined): string { return `student.dashboard.widgets.order.${userId ?? 'anon'}`; }
function widgetHiddenKey(userId: string | undefined): string { return `student.dashboard.widgets.hidden.${userId ?? 'anon'}`; }
function courseOrderKey(userId: string | undefined): string { return `student.dashboard.order.${userId ?? 'anon'}`; }
function courseHiddenKey(userId: string | undefined): string { return `student.dashboard.hidden.${userId ?? 'anon'}`; }

export function Dashboard() {
  const { user } = useSession();
  const dashboard = useApi('student-dashboard', getStudentDashboard);
  const upcoming = useApi('upcoming-sessions', getUpcomingSessions);
  const skills = useApi('my-skills', getMySkills);
  const courses = useApi('my-courses', getMyCourses);

  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [customize, setCustomize] = useState(false);

  const [courseOrder, setCourseOrder] = useState<string[]>([]);
  const [courseHidden, setCourseHidden] = useState<Set<string>>(new Set());
  const [courseDragId, setCourseDragId] = useState<string | null>(null);
  const [courseDragOverId, setCourseDragOverId] = useState<string | null>(null);

  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(DEFAULT_ORDER);
  const [widgetHidden, setWidgetHidden] = useState<Set<string>>(new Set());
  const [widgetDragId, setWidgetDragId] = useState<string | null>(null);
  const [widgetDragOverId, setWidgetDragOverId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    try {
      const rawOrder = localStorage.getItem(courseOrderKey(user.id));
      if (rawOrder) setCourseOrder(JSON.parse(rawOrder) as string[]);
      const rawHidden = localStorage.getItem(courseHiddenKey(user.id));
      if (rawHidden) setCourseHidden(new Set(JSON.parse(rawHidden) as string[]));
      const rawWOrder = localStorage.getItem(widgetOrderKey(user.id));
      if (rawWOrder) {
        const parsed = JSON.parse(rawWOrder) as WidgetId[];
        if (Array.isArray(parsed) && parsed.length) setWidgetOrder(parsed);
      }
      const rawWHidden = localStorage.getItem(widgetHiddenKey(user.id));
      if (rawWHidden) setWidgetHidden(new Set(JSON.parse(rawWHidden) as string[]));
    } catch { /* ignore */ }
  }, [user?.id]);

  useEffect(() => { if (user?.id) localStorage.setItem(courseOrderKey(user.id), JSON.stringify(courseOrder)); }, [courseOrder, user?.id]);
  useEffect(() => { if (user?.id) localStorage.setItem(courseHiddenKey(user.id), JSON.stringify([...courseHidden])); }, [courseHidden, user?.id]);
  useEffect(() => { if (user?.id) localStorage.setItem(widgetOrderKey(user.id), JSON.stringify(widgetOrder)); }, [widgetOrder, user?.id]);
  useEffect(() => { if (user?.id) localStorage.setItem(widgetHiddenKey(user.id), JSON.stringify([...widgetHidden])); }, [widgetHidden, user?.id]);

  const courseList = useMemo(() => courses.data ?? [], [courses.data]);
  const orderedCourses = useMemo(() => {
    if (courseOrder.length === 0) return courseList;
    const byId = new Map(courseList.map((c) => [c.level.id, c]));
    const sorted = courseOrder.map((id) => byId.get(id)).filter(Boolean) as typeof courseList;
    const rest = courseList.filter((c) => !courseOrder.includes(c.level.id));
    return [...sorted, ...rest];
  }, [courseList, courseOrder]);

  const visibleCourses = useMemo(() => orderedCourses.filter((c) => !courseHidden.has(c.level.id)), [orderedCourses, courseHidden]);
  const hiddenCourses = useMemo(() => orderedCourses.filter((c) => courseHidden.has(c.level.id)), [orderedCourses, courseHidden]);

  function handleCourseDrop(targetId: string) {
    if (!courseDragId || courseDragId === targetId) return;
    const ids = orderedCourses.map((c) => c.level.id);
    const from = ids.indexOf(courseDragId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    const next = [...ids];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setCourseOrder(next);
    setCourseDragId(null); setCourseDragOverId(null);
  }

  function handleWidgetDrop(targetId: string) {
    if (!widgetDragId || widgetDragId === targetId) return;
    const from = widgetOrder.indexOf(widgetDragId as WidgetId);
    const to = widgetOrder.indexOf(targetId as WidgetId);
    if (from === -1 || to === -1) return;
    const next = [...widgetOrder];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setWidgetOrder(next as WidgetId[]);
    setWidgetDragId(null); setWidgetDragOverId(null);
  }

  const orderedWidgets = useMemo(() => {
    const byId = new Map(WIDGETS.map((w) => [w.id, w]));
    const sorted = widgetOrder.map((id) => byId.get(id)).filter(Boolean) as typeof WIDGETS;
    const rest = WIDGETS.filter((w) => !widgetOrder.includes(w.id));
    return [...sorted, ...rest];
  }, [widgetOrder]);

  const visibleWidgets = useMemo(() => orderedWidgets.filter((w) => !widgetHidden.has(w.id)), [orderedWidgets, widgetHidden]);
  const hiddenWidgets = useMemo(() => orderedWidgets.filter((w) => widgetHidden.has(w.id)), [orderedWidgets, widgetHidden]);

  if (dashboard.loading) return <LoadingBlock label="Loading your dashboard…" />;
  if (dashboard.error || !dashboard.data) return <ErrorBlock message={dashboard.error ?? 'Could not load dashboard.'} onRetry={dashboard.refetch} />;

  const data = dashboard.data;
  const sessions = upcoming.data ?? [];
  const attendanceBars = [{ label: 'Sessions', present: data.attendance.present, absent: data.attendance.absent, late: data.attendance.late, excused: data.attendance.excused }];

  function renderWidget(id: WidgetId) {
    switch (id) {
      case 'myCourses':
        return (
          <Panel key="myCourses">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-bold"><FiGrid aria-hidden className="text-brand" />My courses</h2>
              <span className="flex items-center gap-2">
                {hiddenCourses.length > 0 ? <span className="rounded-full bg-base-200 px-2.5 py-1 text-xs font-medium">{hiddenCourses.length} hidden</span> : null}
                {customize ? <span className="rounded-full bg-brand-soft px-2 py-1 text-[11px] font-medium text-[#B30A00]">Drag to reorder</span> : null}
                <Link to="/courses" className="btn btn-xs rounded-full border-line bg-base-100">View all</Link>
              </span>
            </div>
            {courses.loading ? <div className="mt-4"><LoadingBlock label="Loading courses…" /></div> : courses.error ? <div className="mt-4"><ErrorBlock message={courses.error} onRetry={courses.refetch} /></div> : visibleCourses.length === 0 ? (
              <div className="mt-4"><EmptyBlock title={hiddenCourses.length ? 'All cards hidden' : 'No courses yet'} hint={hiddenCourses.length ? 'Use Show to bring cards back.' : 'Enrol in a level to see your course cards here.'} /></div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {visibleCourses.map((course) => (
                  <DashboardCourseCard
                    key={course.level.id}
                    levelId={course.level.id}
                    code={course.level.code}
                    title={course.level.title}
                    levelLabel={course.level.levelLabel}
                    completion={course.stats.completionPercentage}
                    completed={course.stats.completedLessons}
                    total={course.stats.totalLessons}
                    customize={customize}
                    draggable
                    isDragging={courseDragId === course.level.id}
                    isDragOver={courseDragOverId === course.level.id && courseDragId !== course.level.id}
                    onDragStart={() => setCourseDragId(course.level.id)}
                    onDragOver={() => setCourseDragOverId(course.level.id)}
                    onDrop={() => handleCourseDrop(course.level.id)}
                    onHide={() => setCourseHidden((prev) => { const next = new Set(prev); next.add(course.level.id); return next; })}
                  />
                ))}
              </div>
            )}
            {customize && hiddenCourses.length > 0 ? (
              <div className="mt-4 rounded-box border border-dashed border-line bg-base-200/30 p-3">
                <p className="text-xs font-semibold">Hidden courses</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hiddenCourses.map((c) => (
                    <button key={c.level.id} type="button" onClick={() => setCourseHidden((prev) => { const next = new Set(prev); next.delete(c.level.id); return next; })} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-base-100 px-3 py-1.5 text-xs font-medium hover:border-brand/20">
                      <FiEye aria-hidden className="text-muted" />{c.level.code} · {c.level.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </Panel>
        );
      case 'progressOverview':
        return (
          <div key="progressOverview" className="grid gap-4 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <h2 className="mb-3 text-sm font-bold">Attendance breakdown</h2>
              <GroupedBar data={attendanceBars} xKey="label" barSize={22} series={[{ key: 'present', label: 'Present', color: COLORS.brand }, { key: 'late', label: 'Late', color: COLORS.sun }, { key: 'absent', label: 'Absent', color: COLORS.coral }, { key: 'excused', label: 'Excused', color: COLORS.muted }]} height={200} />
            </Panel>
            <Panel className="flex flex-col items-center justify-center" padded>
              <CourseProgressCard completion={data.progress.completionPercentage} code={data.currentLevel?.code ?? null} nextTitle={data.nextLesson?.title ?? null} />
            </Panel>
          </div>
        );
      case 'learningStatus':
        return (
          <Panel key="learningStatus">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><FiClock aria-hidden className="text-brand" />Learning status</h2>
            <ProgressRow label="Lessons completed" value={data.progress.completionPercentage} caption={`${data.progress.lessonsCompleted}/${data.progress.lessonsTotal}`} tone="brand" />
            <ProgressRow label="Attendance" value={data.attendance.percentage} caption={`${data.attendance.present} present · ${data.attendance.late} late`} tone="sun" />
            {data.nextExam ? <p className="mt-2 text-xs text-muted">Next exam: <span className="font-semibold text-ink">{data.nextExam.title}</span> ({data.nextExam.type})</p> : <p className="mt-2 text-xs text-muted">No upcoming exam — keep studying and one will be assigned.</p>}
          </Panel>
        );
      case 'skills':
        return (
          <Panel key="skills">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold">Skills</h2>
              <Link to="/courses" className="text-xs font-medium text-brand hover:underline">My course →</Link>
            </div>
            {skills.loading ? <LoadingBlock label="Loading skills…" /> : skills.error ? <ErrorBlock message={skills.error} onRetry={skills.refetch} /> : <SkillsPanel skills={skills.data ?? []} />}
          </Panel>
        );
      case 'schedule':
        return (
          <Panel key="schedule">
            <h3 className="mb-3 text-sm font-bold">Upcoming live classes</h3>
            {upcoming.loading ? <LoadingBlock label="Loading sessions…" /> : upcoming.error ? <ErrorBlock message={upcoming.error} onRetry={upcoming.refetch} /> : sessions.length === 0 ? <EmptyBlock title="No upcoming classes" hint="Your teacher will schedule the next live class — check back soon." /> : (
              <ul className="space-y-2">
                {sessions.slice(0, 3).map((s) => (
                  <li key={s.id} className="rounded-box border border-line bg-base-100 p-3">
                    <p className="truncate text-xs font-semibold">{s.title}</p>
                    <p className="truncate text-[11px] text-muted">{s.classGroup?.name ?? '—'} · {s.status}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/schedule" className="btn btn-sm mt-3 w-full rounded-full border-line bg-base-100">View full schedule</Link>
          </Panel>
        );
      default: return null;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <span className="flex items-center gap-2">
          {widgetHidden.size > 0 ? <span className="rounded-full bg-base-200 px-2.5 py-1 text-xs font-medium">{widgetHidden.size} hidden</span> : null}
          <button type="button" onClick={() => setCustomize((v) => !v)} className={`btn btn-xs gap-1 rounded-full ${customize ? 'bg-brand text-white border-0' : 'border-line bg-base-100'}`}>
            <FiSettings aria-hidden />{customize ? 'Done customizing' : 'Customize dashboard'}
          </button>
        </span>
      </div>
      {customize ? <p className="text-right text-xs text-muted">Drag cards to rearrange · Tap eye to hide · Rings stay on the right.</p> : null}

      <HeroCard code={data.currentLevel?.code ?? null} title={data.currentLevel?.title ?? null} campusName={data.campus?.name ?? null} className={data.classGroup?.name ?? null} balanceLabel={data.finance.balance ? `Balance ${rwf(money(data.finance.balance))}` : null} completion={data.progress.completionPercentage} completed={data.progress.lessonsCompleted} total={data.progress.lessonsTotal} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Syllabus" value={`${data.progress.completionPercentage}%`} tone="brand" icon={FiBookOpen} delta={`${data.progress.lessonsCompleted}/${data.progress.lessonsTotal} lessons`} />
        <StatTile label="Attendance" value={`${data.attendance.percentage}%`} tone={data.attendance.percentage < 75 ? 'coral' : 'sun'} icon={FiTrendingUp} delta={`${data.attendance.present} present · ${data.attendance.late} late`} />
        <StatTile label="Notifications" value={String(data.unreadNotificationsCount)} tone="navy" icon={FiBell} delta={data.nextLesson ? `Next: ${data.nextLesson.title}` : 'All caught up'} />
        <StatTile label="Next exam" value={data.nextExam ? data.nextExam.title : '—'} tone="coral" icon={FiAward} delta={data.nextExam ? `${data.nextExam.type}` : 'No exam scheduled'} />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          {visibleWidgets.map((w) => {
            const isDragging = widgetDragId === w.id;
            const isDragOver = widgetDragOverId === w.id && widgetDragId !== w.id;
            return (
              <div
                key={w.id}
                draggable={customize}
                onDragStart={() => { if (customize) setWidgetDragId(w.id); }}
                onDragEnd={() => { setWidgetDragId(null); setWidgetDragOverId(null); }}
                onDragOver={(e) => { e.preventDefault(); if (customize && widgetDragId && widgetDragId !== w.id) setWidgetDragOverId(w.id); }}
                onDrop={(e) => { e.preventDefault(); handleWidgetDrop(w.id); }}
                className={`relative rounded-box transition ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'ring-1 ring-brand' : ''} ${customize ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                {customize ? (
                  <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
                    <span className="rounded-full bg-base-200 px-2 py-1 text-[11px] font-medium text-muted" title="Drag to reorder"><FiMove aria-hidden className="text-xs" />{w.label}</span>
                    <button type="button" onClick={() => setWidgetHidden((prev) => { const next = new Set(prev); next.add(w.id); return next; })} aria-label={`Hide ${w.label}`} className="btn btn-xs btn-circle border-line bg-base-100 text-muted hover:bg-coral-soft hover:text-coral"><FiEyeOff aria-hidden className="text-xs" /></button>
                  </div>
                ) : null}
                <div className={customize ? 'pt-8' : ''}>{renderWidget(w.id)}</div>
              </div>
            );
          })}

          {customize && hiddenWidgets.length > 0 ? (
            <Panel className="border-dashed">
              <h3 className="text-sm font-bold">Hidden cards</h3>
              <p className="mt-1 text-xs text-muted">Tap Show to bring a card back — order is kept.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {hiddenWidgets.map((w) => (
                  <button key={w.id} type="button" onClick={() => setWidgetHidden((prev) => { const next = new Set(prev); next.delete(w.id); return next; })} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-base-100 px-3 py-1.5 text-xs font-medium hover:border-brand/20">
                    <FiEye aria-hidden className="text-muted" />{w.label}
                  </button>
                ))}
              </div>
            </Panel>
          ) : null}

          {!customize && hiddenWidgets.length > 0 ? (
            <p className="text-center text-xs text-muted">{hiddenWidgets.length} card{hiddenWidgets.length === 1 ? '' : 's'} hidden — tap Customize to show.</p>
          ) : null}
        </div>

        <div className="xl:col-span-4">
          <div className="sticky top-4 space-y-4">
            <WeeklyRings courses={courseList} weekAnchor={weekAnchor} onPrev={() => setWeekAnchor((d) => subWeeks(d, 1))} onNext={() => setWeekAnchor((d) => addWeeks(d, 1))} onToday={() => setWeekAnchor(new Date())} />
            <Panel><UpNextCard session={data.upcomingClass} sessions={sessions} /></Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

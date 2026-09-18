import { useEffect, useMemo, useState } from 'react';
import { FiAward, FiBell, FiClock, FiEye, FiGrid, FiSettings, FiTrendingUp, FiMove, FiEyeOff, FiLayers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Panel } from '../../components/ui/Panel';
import { ProgressRow } from '../../components/ui/ProgressBar';
import { StatTile } from '../../components/ui/StatTile';
import { GroupedBar } from '../../components/charts/GroupedBar';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { COLORS } from '../../lib/theme';
import { rwf } from '../../lib/format';
import { getMyCourses, getMySkills, getStudentDashboard, getUpcomingSessions, humanize, money } from '../../lib/services';
import { HeroCard } from '../../components/student/HeroCard';
import { CourseProgressCard } from '../../components/student/CourseProgressCard';
import { UpNextCard } from '../../components/student/UpNextCard';
import { SkillsPanel } from '../../components/student/SkillsPanel';
import { DashboardCourseCard } from '../../components/student/DashboardCourseCard';
import { WeeklyRings } from '../../components/student/WeeklyRings';
import { useSession } from '../../lib/session';
import { addWeeks, subWeeks } from 'date-fns';

type WidgetId = 'myCourses' | 'learningStatus' | 'skills' | 'attendance';

const WIDGETS: { id: WidgetId; label: string }[] = [
  { id: 'myCourses', label: 'My courses' },
  { id: 'learningStatus', label: 'Learning status' },
  { id: 'skills', label: 'Skills' },
  { id: 'attendance', label: 'Attendance' },
];

const DEFAULT_ORDER: WidgetId[] = ['myCourses', 'learningStatus', 'skills', 'attendance'];

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
        if (Array.isArray(parsed) && parsed.length) {
          const valid = (parsed as unknown as string[]).filter((id) => (WIDGETS as { id: string }[]).some((w) => w.id === id)) as unknown as WidgetId[];
          if (valid.length) setWidgetOrder(valid);
        }
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
  const attendanceTotal = data.attendance.present + data.attendance.absent + data.attendance.late + data.attendance.excused;
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
      case 'learningStatus':
        return (
          <Panel key="learningStatus">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><FiClock aria-hidden className="text-brand" />Learning status</h2>
            <ProgressRow label="Lessons completed" value={data.progress.completionPercentage} caption={`${data.progress.lessonsCompleted}/${data.progress.lessonsTotal}`} tone="brand" />
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
      <div className="flex justify-end">
        <span className="flex items-center gap-2">
          {widgetHidden.size > 0 ? <span className="rounded-full bg-base-200 px-2.5 py-1 text-xs font-medium">{widgetHidden.size} hidden</span> : null}
          <button type="button" onClick={() => setCustomize((v) => !v)} className={`btn btn-xs gap-1 rounded-full ${customize ? 'bg-brand text-white border-0' : 'border-line bg-base-100'}`}>
            <FiSettings aria-hidden />{customize ? 'Done customizing' : 'Customize dashboard'}
          </button>
        </span>
      </div>
      {customize ? <p className="text-right text-xs text-muted">Drag cards to rearrange · Tap eye to hide · Rings stay on the right.</p> : null}

      <HeroCard
        code={data.currentLevel?.code ?? null}
        title={data.currentLevel?.title ?? null}
        campusName={data.campus?.name ?? null}
        className={data.classGroup?.name ?? null}
        balanceLabel={money(data.finance.balance) !== 0 ? `${humanize(data.finance.status)} · ${rwf(money(data.finance.balance))}` : null}
        financeStatus={data.finance.status}
        completion={data.progress.completionPercentage}
        completed={data.progress.lessonsCompleted}
        total={data.progress.lessonsTotal}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Courses" value={String(courseList.length)} tone="brand" icon={FiLayers} delta={data.currentLevel ? `${data.currentLevel.code} active` : 'No active level'} />
        <StatTile label="Attendance" value={`${data.attendance.percentage}%`} tone={data.attendance.percentage < 75 ? 'coral' : 'sun'} icon={FiTrendingUp} delta={data.attendance.percentage < 75 && attendanceTotal > 0 ? 'Low — check activity' : `${data.attendance.present} present · ${data.attendance.late} late`} />
        <StatTile label="Notifications" value={String(data.unreadNotificationsCount)} tone="navy" icon={FiBell} delta={data.nextLesson ? `Next: ${data.nextLesson.title}` : 'All caught up'} />
        <StatTile label="Next exam" value={data.nextExam ? humanize(data.nextExam.type) : '—'} tone="coral" icon={FiAward} delta={data.nextExam ? data.nextExam.title : 'No exam scheduled'} />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          {visibleWidgets.map((w) => {
            const isDragging = widgetDragId === w.id;
            const isDragOver = widgetDragOverId === w.id && widgetDragId !== w.id;
            return (
              <div
                key={w.id}
                role="listitem"
                aria-grabbed={customize ? isDragging : undefined}
                draggable={customize}
                onDragStart={() => { if (customize) setWidgetDragId(w.id); }}
                onDragEnd={() => { setWidgetDragId(null); setWidgetDragOverId(null); }}
                onDragOver={(e) => { e.preventDefault(); if (customize && widgetDragId && widgetDragId !== w.id) setWidgetDragOverId(w.id); }}
                onDrop={(e) => { e.preventDefault(); handleWidgetDrop(w.id); }}
                onKeyDown={(e) => {
                  if (!customize) return;
                  const idx = widgetOrder.indexOf(w.id);
                  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); if (idx < widgetOrder.length - 1) { const next = [...widgetOrder]; const [m] = next.splice(idx, 1); next.splice(idx + 1, 0, m); setWidgetOrder(next as typeof widgetOrder); } }
                  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); if (idx > 0) { const next = [...widgetOrder]; const [m] = next.splice(idx, 1); next.splice(idx - 1, 0, m); setWidgetOrder(next as typeof widgetOrder); } }
                }}
                tabIndex={customize ? 0 : undefined}
                className={`relative rounded-box transition ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'ring-1 ring-brand' : ''} ${customize ? 'cursor-grab active:cursor-grabbing focus:outline-none focus:ring-1 focus:ring-brand' : ''}`}
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

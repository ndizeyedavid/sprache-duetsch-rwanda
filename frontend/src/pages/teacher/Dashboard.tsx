import { useEffect, useMemo, useState } from 'react';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { ClassGroupCard } from '../../components/teacher/ClassGroupCard';
import { TodoRail } from '../../components/teacher/TodoRail';
import { COLORS } from '../../lib/theme';
import { useSession } from '../../lib/session';
import { WelcomeHero } from '../../components/common/WelcomeHero';
import { humanize, listClasses, listSessions, listAttempts } from '../../lib/services';

const PALETTE = [COLORS.brand, COLORS.sun, COLORS.navy, COLORS.coral, '#5b8def', '#A098AE'];

function hiddenKey(userId: string | undefined): string {
 return `sparch.hidden.classes.${userId ?? 'anon'}`;
}

export function TeacherDashboard() {
 const { user } = useSession();
 const classes = useApi('teacher-classes', listClasses);
 const sessions = useApi('teacher-sessions', listSessions);

 const [showHidden, setShowHidden] = useState(false);
 const [hiddenSet, setHiddenSet] = useState<Set<string>>(new Set());
 const [gradingCounts, setGradingCounts] = useState<Record<string, number>>({});

 // Reload hidden set once the session resolves (initial `user` is null).
 useEffect(() => {
 if (!user?.id) return;
 try {
 const raw = localStorage.getItem(hiddenKey(user.id));
 setHiddenSet(new Set(raw ? (JSON.parse(raw) as string[]) : []));
 } catch {
 setHiddenSet(new Set());
 }
 }, [user?.id]);

 function toggleHidden(id: string) {
 if (!user?.id) return;
 setHiddenSet((prev) => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 localStorage.setItem(hiddenKey(user.id), JSON.stringify([...next]));
 return next;
 });
 }

 // Fetch per-class grading counts (SUBMITTED) for dots and To-Do
 useEffect(() => {
 if (!classes.data || classes.data.length === 0) return;
 let cancelled = false;
 Promise.all(
 classes.data.map(async (group) => {
 try {
 const attempts = await listAttempts('SUBMITTED', group.id);
 return [group.id, attempts.length] as const;
 } catch {
 return [group.id, 0] as const;
 }
 }),
 ).then((entries) => {
 if (!cancelled) setGradingCounts(Object.fromEntries(entries));
 });
 return () => {
 cancelled = true;
 };
 }, [classes.data]);

 const visibleClasses = useMemo(
 () => (classes.data ?? []).filter((group) => showHidden || !hiddenSet.has(group.id)),
 [classes.data, hiddenSet, showHidden],
 );

 const hiddenCount = useMemo(
 () => (classes.data ?? []).filter((g) => hiddenSet.has(g.id)).length,
 [classes.data, hiddenSet],
 );

 const needsGrading = useMemo(
 () =>
 (classes.data ?? [])
 .map((group) => ({
 classGroupId: group.id,
 className: group.name,
 count: gradingCounts[group.id] ?? 0,
 }))
 .filter((row) => row.count > 0),
 [classes.data, gradingCounts],
 );

 const upcoming = useMemo(() => {
 const list = sessions.data ?? [];
 return list
 .filter((s) => ['SCHEDULED', 'LIVE', 'RESCHEDULED'].includes(s.status))
 .filter((s) => new Date(s.startAt).getTime() > Date.now() - 24 * 3600 * 1000)
 .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
 }, [sessions.data]);

 const todos = useMemo(() => {
 const items: { id: string; label: string; hint: string; to: string; tone: 'brand' | 'sun' | 'coral' | 'navy' }[] = [];
 // Attendance to mark: past SCHEDULED sessions within last 7 days
 const now = Date.now();
 const weekAgo = now - 7 * 24 * 3600 * 1000;
 const attendanceTodos = (sessions.data ?? [])
 .filter((s) => s.status === 'SCHEDULED' && new Date(s.startAt).getTime() < now && new Date(s.startAt).getTime() > weekAgo)
 .slice(0, 3)
 .map((s) => ({
 id: `att-${s.id}`,
 label: 'Mark attendance',
 hint: `${s.classGroup?.name ?? 'Class'} · ${humanize(s.status)}`,
 to: `/teacher/attendance`,
 tone: 'sun' as const,
 }));
 items.push(...attendanceTodos);
 for (const row of needsGrading.slice(0, 3)) {
 items.push({
 id: `grade-${row.classGroupId}`,
 label: `Grade ${row.count} submission${row.count === 1 ? '' : 's'}`,
 hint: row.className,
 to: `/teacher/grading?classGroupId=${row.classGroupId}&status=SUBMITTED`,
 tone: 'brand' as const,
 });
 }
 return items.slice(0, 5);
 }, [needsGrading, sessions.data]);

 if (classes.loading) return <LoadingBlock label="Loading your dashboard…" />;
 if (classes.error) return <ErrorBlock message={classes.error} onRetry={classes.refetch} />;

 const welcome = (
 <WelcomeHero
 firstName={user?.firstName ?? null}
 message="Here's what's happening across your classes. Your to-do list keeps grading and upcoming sessions in one place."
 action={{ label: 'Open grading', to: '/teacher/grading' }}
 />
 );

 if (!classes.data || classes.data.length === 0) {
 return (
 <div className="space-y-5">
 {welcome}
 <EmptyBlock
 title="No classes assigned yet"
 hint="An academic admin will assign you to a class group. It will then appear here as a course card."
 />
 </div>
 );
 }

 return (
 <div className="space-y-5">
 {welcome}

 <div className="grid gap-5 xl:grid-cols-12">
 <div className="xl:col-span-8">
 {/* Only way back for cards hidden via a card's "Hide" action. */}
 {hiddenCount > 0 ? (
 <label className="mb-3 flex items-center justify-end gap-2 text-xs text-muted">
 <input type="checkbox" className="checkbox checkbox-xs" checked={showHidden} onChange={(e) => setShowHidden(e.currentTarget.checked)} />
 Show hidden classes ({hiddenCount})
 </label>
 ) : null}
 {visibleClasses.length === 0 ? (
 <EmptyBlock title="All your classes are hidden" hint="Tick “Show hidden classes” above to bring them back." />
 ) : (
 <div className="grid gap-4 sm:grid-cols-2">
 {visibleClasses.map((group) => {
 // Deterministic palette by class id so colors don't shuffle when cards are hidden
 const hash = [...group.id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
 return (
 <ClassGroupCard
 key={group.id}
 id={group.id}
 code={group.code}
 name={group.name}
 levelCode={group.level.code}
 intakeName={group.intake.name}
 campusName={group.campus.name}
 shift={group.shift}
 studentCount={group._count.enrollments}
 color={PALETTE[hash % PALETTE.length]}
 unreadCount={gradingCounts[group.id] ?? 0}
 isHidden={hiddenSet.has(group.id)}
 onToggleHidden={toggleHidden}
 />
 );
 })}
 </div>
 )}
 </div>

 <div className="xl:col-span-4">
 <TodoRail
 todos={todos}
 needsGrading={needsGrading}
 upcoming={upcoming}
 onClassGroupClick={(id) => {
 window.location.href = `/teacher/grading?classGroupId=${id}&status=SUBMITTED`;
 }}
 />
 </div>
 </div>
 </div>
 );
}

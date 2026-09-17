import { useEffect, useMemo, useState } from 'react';
import { Panel } from '../../components/ui/Panel';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { ClassGroupCard } from '../../components/teacher/ClassGroupCard';
import { TodoRail } from '../../components/teacher/TodoRail';
import { COLORS } from '../../lib/theme';
import { useSession } from '../../lib/session';
import {
 humanize,
 listCampusesFull,
 listClasses,
 listIntakesFull,
 listLevels,
 listSessions,
 listAttempts,
} from '../../lib/services';

const PALETTE = [COLORS.brand, COLORS.sun, COLORS.navy, COLORS.coral, '#5b8def', '#A098AE'];

function hiddenKey(userId: string | undefined): string {
 return `sparch.hidden.classes.${userId ?? 'anon'}`;
}

export function TeacherDashboard() {
 const { user } = useSession();
 const classes = useApi('teacher-classes', listClasses);
 const levels = useApi('levels-catalog', listLevels);
 const campuses = useApi('campuses-full', listCampusesFull);
 const intakes = useApi('intakes-full', listIntakesFull);
 const sessions = useApi('teacher-sessions', listSessions);

 const [levelId, setLevelId] = useState<string | null>(null);
 const [campusId, setCampusId] = useState<string | null>(null);
 const [intakeId, setIntakeId] = useState<string | null>(null);
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

 const taughtLevelIds = useMemo(
 () => new Set((classes.data ?? []).map((group) => group.levelId)),
 [classes.data],
 );
 const taughtLevels = useMemo(
 () => (levels.data ?? []).filter((level) => taughtLevelIds.has(level.id)),
 [levels.data, taughtLevelIds],
 );

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

 const filtered = useMemo(() => {
 const list = classes.data ?? [];
 return list.filter((group) => {
 if (levelId && group.levelId !== levelId) return false;
 if (campusId && group.campusId !== campusId) return false;
 if (intakeId && group.intakeId !== intakeId) return false;
 if (!showHidden && hiddenSet.has(group.id)) return false;
 return true;
 });
 }, [classes.data, levelId, campusId, intakeId, hiddenSet, showHidden]);

 const visibleHiddenCount = useMemo(
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
 .filter((row) => row.count > 0)
 .filter((row) => {
 const g = (classes.data ?? []).find((c) => c.id === row.classGroupId);
 if (!g) return false;
 if (levelId && g.levelId !== levelId) return false;
 if (campusId && g.campusId !== campusId) return false;
 if (intakeId && g.intakeId !== intakeId) return false;
 return true;
 }),
 [classes.data, gradingCounts, levelId, campusId, intakeId],
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

 if (classes.loading || levels.loading) return <LoadingBlock label="Loading your dashboard…" />;
 if (classes.error) return <ErrorBlock message={classes.error} onRetry={classes.refetch} />;
 if (!classes.data || classes.data.length === 0) {
 return (
 <EmptyBlock
 title="No classes assigned yet"
 hint="An academic admin will assign you to a class group. It will then appear here as a course card."
 />
 );
 }

 return (
 <div className="space-y-5">
 {/* Header filters */}
 <Panel>
 <div className="flex flex-wrap items-center gap-2">
 <div className="flex flex-wrap gap-2">
 {taughtLevels.map((level) => (
 <button
 key={level.id}
 type="button"
 onClick={() => setLevelId((prev) => (prev === level.id ? null : level.id))}
 className={`btn btn-sm rounded-full ${levelId === level.id ? 'border-0 bg-brand text-white' : 'border-line bg-base-200'}`}
 >
 {level.code}
 </button>
 ))}
 </div>
 <div className="ml-auto flex flex-wrap gap-2">
 <select value={campusId ?? ''} onChange={(e) => setCampusId(e.currentTarget.value || null)} className="select select rounded-full border-line bg-base-200" aria-label="Campus filter">
 <option value="">All campuses</option>
 {(campuses.data ?? []).map((c) => (
 <option key={c.id} value={c.id}>
 {c.name}
 </option>
 ))}
 </select>
 <select value={intakeId ?? ''} onChange={(e) => setIntakeId(e.currentTarget.value || null)} className="select select rounded-full border-line bg-base-200" aria-label="Intake filter">
 <option value="">All intakes</option>
 {(intakes.data ?? []).map((i) => (
 <option key={i.id} value={i.id}>
 {i.name}
 </option>
 ))}
 </select>
 {(levelId || campusId || intakeId) && (
 <button
 type="button"
 onClick={() => {
 setLevelId(null);
 setCampusId(null);
 setIntakeId(null);
 }}
 className="btn btn-sm rounded-full border-line bg-base-200"
 >
 Clear filters
 </button>
 )}
 {visibleHiddenCount > 0 && (
 <label className="flex items-center gap-2 text-xs">
 <input type="checkbox" className="checkbox checkbox-xs" checked={showHidden} onChange={(e) => setShowHidden(e.currentTarget.checked)} />
 Show hidden ({visibleHiddenCount})
 </label>
 )}
 </div>
 </div>
 </Panel>

 <div className="grid gap-5 xl:grid-cols-12">
 <div className="xl:col-span-8">
 {filtered.length === 0 ? (
 <EmptyBlock title="No classes match your filters" hint="Try clearing filters or showing hidden cards." />
 ) : (
 <div className="grid gap-4 sm:grid-cols-2">
 {filtered.map((group) => {
 // Deterministic palette by class id so colors don't shuffle when filtering
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

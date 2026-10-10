import { useEffect,useMemo,useState } from 'react';
import { FiCalendar,FiDownload,FiSearch,FiX } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { AcademicSummary } from '../../components/admin/AcademicSummary';
import { LiveSessionPicker } from '../../components/admin/LiveSessionPicker';
import { AttendanceRow } from '../../components/attendance/AttendanceRow';
import { BulkBar } from '../../components/attendance/BulkBar';
import { StatsStrip } from '../../components/attendance/StatsStrip';
import { applyBulk,rosterStats } from '../../components/attendance/utils';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { Panel } from '../../components/ui/Panel';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage,downloadFile } from '../../lib/api';
import { getSession,getSessionRoster,isoDate,isoTime,listSessions,markSessionAttendance } from '../../lib/services';
import { sessionStatusLabel,sessionTone,teacherName } from '../../lib/sessions-ui';
import { TONE_CLASSES } from '../../lib/theme';

export function AdminLiveClass() {
 const [searchParams, setSearchParams] = useSearchParams();
 const sessions = useApi('all-sessions', listSessions);

 const selectedFromUrl = searchParams.get('session');
 const [selectedId, setSelectedId] = useState<string | null>(selectedFromUrl);
 const [marks, setMarks] = useState<Record<string, string>>({});
 const [q, setQ] = useState('');
 const [actionError, setActionError] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);
 const [exporting, setExporting] = useState(false);
 const [saved, setSaved] = useState(false);

 const detail = useApi(`session-${selectedId ?? 'none'}`, () => getSession(selectedId ?? ''), selectedId !== null);
 const roster = useApi(`roster-${selectedId ?? 'none'}`, () => getSessionRoster(selectedId ?? ''), selectedId !== null);

 useEffect(() => {
 const v = searchParams.get('session');
 if (v && v !== selectedId) setSelectedId(v);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [searchParams]);

 function pick(id: string) {
 setSelectedId(id);
 setMarks({});
 setSaved(false);
 setActionError(null);
 const next = new URLSearchParams(searchParams);
 next.set('session', id);
 setSearchParams(next);
 }

 const list = useMemo(() => [...(sessions.data ?? [])].sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()), [sessions.data]);
 const session = selectedId ? detail.data : null;
 const rows = useMemo(() => roster.data ?? [], [roster.data]);

 const filteredRows = useMemo(() => {
 if (!q.trim()) return rows;
 const needle = q.trim().toLowerCase();
 return rows.filter((r) => `${r.firstName} ${r.lastName} ${r.studentCode}`.toLowerCase().includes(needle));
 }, [rows, q]);

 const stats = useMemo(() => rosterStats(rows as never, marks), [rows, marks]);
 const hasChanges = Object.keys(marks).length > 0;

 async function handleSave() {
 if (!selectedId) return;
 const records = Object.entries(marks).map(([studentId, status]) => ({ studentId, status }));
 if (records.length === 0) { setActionError('Mark at least one student — tap a status pill.'); return; }
 setActionError(null); setSaving(true);
 try {
 await markSessionAttendance(selectedId, records);
 setSaved(true);
 setMarks({});
 roster.refetch();
 } catch (err) { setActionError(apiErrorMessage(err, 'Could not save attendance.')); } finally { setSaving(false); }
 }

 function handleBulk(status: string) {
 setMarks(applyBulk(filteredRows as never, status as never));
 setSaved(false);
 setActionError(null);
 }

 return (
 <div className="space-y-4">
 {sessions.data && <AcademicSummary items={[
   { label: 'Sessions', value: list.length, note: 'Loaded live class records' },
   { label: 'Live now', value: list.filter(s => s.status === 'LIVE').length, note: 'Sessions marked live' },
   { label: 'Upcoming', value: list.filter(s => ['SCHEDULED', 'RESCHEDULED'].includes(s.status) && new Date(s.endAt).getTime() >= Date.now()).length, note: 'Scheduled or rescheduled sessions' },
   { label: 'Completed', value: list.filter(s => s.status === 'COMPLETED').length, note: 'Past sessions marked completed' },
 ]} />}

 <div className="grid gap-5 lg:grid-cols-12">
 <LiveSessionPicker sessions={sessions} selectedId={selectedId} onPick={pick} disabled={saving} />

 <div className="space-y-4 lg:col-span-8 xl:col-span-9">
 {!selectedId ? <Panel><EmptyBlock title="Select a session" hint="Pick a session on the left to see its details and roster." /></Panel> : detail.loading ? <Panel><LoadingBlock label="Loading session…" /></Panel> : detail.error || !detail.data ? <Panel><ErrorBlock message={detail.error ?? 'Could not load session.'} onRetry={detail.refetch} /></Panel> : (
 <>
 <Panel>
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <h2 className="text-base font-bold leading-tight">{session?.title}</h2>
 <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
 {session ? <><FiCalendar aria-hidden />{isoDate(session.startAt)} · {isoTime(session.startAt)} – {isoTime(session.endAt)}</> : null}
 {session?.classGroup ? <span className="rounded-full bg-base-200 px-2 py-0.5 font-medium text-ink">{session.classGroup.name}</span> : null}
 {session ? <span className={`rounded-full px-2 py-0.5 font-medium ${TONE_CLASSES[sessionTone(session.status)].soft} ${TONE_CLASSES[sessionTone(session.status)].text}`}>{sessionStatusLabel(session.status)}</span> : null}
 </p>
 {session?.teacher ? <p className="mt-1 text-xs text-muted">{teacherName(session.teacher)}</p> : null}
 </div>
 <div className="flex flex-wrap gap-2">
 {session?.meetingUrl ? <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content">Open meeting</a> : null}
 {session?.classGroup ? <button type="button" disabled={exporting} onClick={async () => { if (!session?.classGroup) return; setExporting(true); setActionError(null); try { await downloadFile(`/attendance/export?classGroupId=${session.classGroup.id}`, `attendance-${session.classGroup.name}.csv`); } catch (err: unknown) { setActionError(apiErrorMessage(err, 'Export failed.')); } finally { setExporting(false); } }} className="btn btn-sm gap-1 rounded-full border-line bg-base-100 disabled:opacity-60">{exporting ? <span className="loading loading-spinner loading-xs" /> : <FiDownload aria-hidden />}{exporting ? "Exporting…" : "Export CSV"}</button> : null}
 </div>
 </div>
 </Panel>

 <Panel>
 {roster.loading ? <LoadingBlock label="Loading roster…" /> : roster.error ? <ErrorBlock message={roster.error} onRetry={roster.refetch} /> : (
 <>
 <div className="flex flex-wrap items-center justify-between gap-3">
 <h3 className="text-sm font-bold">Roster & attendance</h3>
 {session?.classGroup ? <span className="text-xs text-muted">{rows.length} students</span> : null}
 </div>
 {rows.length > 0 ? <div className="mt-3"><StatsStrip counts={stats.counts} total={stats.total} rate={stats.rate} /></div> : null}
 {rows.length > 0 ? (
 <>
 <div className="mt-4 flex flex-wrap items-center gap-2">
 <div className="relative">
 <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
 <input value={q} onChange={(e) => setQ(e.currentTarget.value)} placeholder="Search student…" className="input input-sm rounded-full border-line bg-base-100 pl-9 pr-8" />
 {q ? <button type="button" onClick={() => setQ('')} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"><FiX aria-hidden /></button> : null}
 </div>
 <span className="text-xs text-muted">{filteredRows.length} of {rows.length}</span>
 {hasChanges ? <span className="rounded-full bg-sun text-warning-content px-2.5 py-1 text-xs font-medium text-[#8A6800]">{Object.keys(marks).length} changed</span> : null}
 {stats.counts.UNMARKED ? <span className="rounded-full bg-coral text-error-content px-2.5 py-1 text-xs font-medium text-[#D8482F]">{stats.counts.UNMARKED} unmarked</span> : rows.length ? <span className="rounded-full bg-brand text-primary-content px-2.5 py-1 text-xs font-medium text-[#B30A00]">All marked</span> : null}
 </div>
 <div className="mt-3"><BulkBar onPick={handleBulk} onClear={() => { setMarks({}); setActionError(null); }} disabled={filteredRows.length === 0} /></div>
 </>
 ) : null}

 {rows.length === 0 ? <div className="mt-4"><EmptyBlock title="Empty roster" hint="No students in this class group." /></div> : filteredRows.length === 0 ? <div className="mt-4"><EmptyBlock title="No matches" hint="Try another search." /></div> : (
 <ul className="mt-4 space-y-2">
 {filteredRows.map((row) => {
 const current = marks[row.studentId] ?? row.status ?? '';
 return <AttendanceRow key={row.studentId} firstName={row.firstName} lastName={row.lastName} studentCode={row.studentCode} current={current} savedStatus={row.status} onPick={(s) => { setMarks((p) => ({ ...p, [row.studentId]: s })); setSaved(false); setActionError(null); }} />;
 })}
 </ul>
 )}

 {actionError ? <p role="alert" className="mt-3 rounded-field bg-coral text-error-content px-3 py-2 text-xs font-medium text-[#D8482F]">{actionError}</p> : null}
 {saved ? <p role="status" className="mt-3 rounded-field bg-brand text-primary-content px-3 py-2 text-xs font-medium text-[#B30A00]">Attendance saved — roster refreshed.</p> : null}
 <div className="mt-4 flex flex-wrap gap-2">
 <button type="button" disabled={saving || rows.length === 0} onClick={handleSave} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content disabled:opacity-60">
 {saving ? <span className="loading loading-spinner loading-xs" /> : null}Save attendance {hasChanges ? `(${Object.keys(marks).length})` : ''}
 </button>
 {hasChanges ? <button type="button" onClick={() => { setMarks({}); setActionError(null); }} className="btn btn-sm rounded-full border-line bg-base-100">Discard changes</button> : null}
 </div>
 </>
 )}
 </Panel>
 </>
 )}
 </div>
 </div>
 </div>
 );
}

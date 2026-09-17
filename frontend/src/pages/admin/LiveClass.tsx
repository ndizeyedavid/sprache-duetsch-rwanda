import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiCalendar, FiDownload, FiSearch, FiX } from 'react-icons/fi';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage, downloadFile } from '../../lib/api';
import { getSession, getSessionRoster, isoDate, isoTime, listClasses, listSessions, markSessionAttendance } from '../../lib/services';
import { sessionStatusLabel, sessionTone, teacherName } from '../../lib/sessions-ui';
import { TONE_CLASSES } from '../../lib/theme';
import { AttendanceRow } from '../../components/attendance/AttendanceRow';
import { BulkBar } from '../../components/attendance/BulkBar';
import { StatsStrip } from '../../components/attendance/StatsStrip';
import { applyBulk, rosterStats } from '../../components/attendance/utils';

export function AdminLiveClass() {
 const [searchParams, setSearchParams] = useSearchParams();
 const sessions = useApi('all-sessions', listSessions);
 const classes = useApi('class-groups-filter', listClasses);

 const selectedFromUrl = searchParams.get('session');
 const [selectedId, setSelectedId] = useState<string | null>(selectedFromUrl);
 const [marks, setMarks] = useState<Record<string, string>>({});
 const [q, setQ] = useState('');
 const [sessionQ, setSessionQ] = useState('');
 const [sessionClass, setSessionClass] = useState<string>('');
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
 const filteredSessions = useMemo(() => {
 let out = list;
 if (sessionClass) out = out.filter((s) => s.classGroup?.id === sessionClass);
 if (sessionQ.trim()) {
 const needle = sessionQ.trim().toLowerCase();
 out = out.filter((s) => `${s.title} ${s.classGroup?.name ?? ''}`.toLowerCase().includes(needle));
 }
 return out;
 }, [list, sessionClass, sessionQ]);
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
 <Panel>
 <div className="flex flex-wrap items-center justify-between gap-3">
 <SectionHeader title="Live classes & attendance" className="mb-0" />
 <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-medium">{list.length} sessions</span>
 </div>
 <p className="mt-1 text-xs leading-snug text-muted">Admin sees every class. Pick a session, mark attendance like Canvas — pill per student, bulk, search, export.</p>
 </Panel>

 <div className="grid gap-5 lg:grid-cols-12">
 <Panel className="lg:col-span-4 xl:col-span-3">
 <div className="flex items-center justify-between gap-2">
 <h3 className="flex items-center gap-2 text-sm font-bold"><FiCalendar aria-hidden className="text-brand" />Sessions</h3>
 <select value={sessionClass} onChange={(e) => setSessionClass(e.currentTarget.value)} className="select select-xs max-w-[140px] rounded-full border-line bg-base-100 text-xs" aria-label="Filter sessions by class">
 <option value="">All classes</option>
 {(classes.data ?? []).map((c) => (
 <option key={c.id} value={c.id}>{c.name} {c.level ? `· ${c.level.code}` : ''}</option>
 ))}
 </select>
 </div>
 <div className="relative mt-3">
 <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
 <input value={sessionQ} onChange={(e) => setSessionQ(e.currentTarget.value)} placeholder="Filter sessions…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-8 text-xs" />
 {sessionQ ? <button type="button" onClick={() => setSessionQ('')} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2" aria-label="Clear session filter"><FiX aria-hidden /></button> : null}
 </div>
 {sessionQ || sessionClass ? <p className="mt-2 text-xs text-muted">Showing {filteredSessions.length} of {list.length}<button type="button" onClick={() => { setSessionQ(''); setSessionClass(''); }} className="link link-hover ml-2 text-brand">Clear</button></p> : null}
 {sessions.loading ? <div className="mt-3"><LoadingBlock label="Loading…" /></div> : sessions.error || !sessions.data ? <div className="mt-3"><ErrorBlock message={sessions.error ?? 'Could not load.'} onRetry={sessions.refetch} /></div> : list.length === 0 ? <div className="mt-3"><EmptyBlock title="No sessions yet" /></div> : filteredSessions.length === 0 ? <div className="mt-3"><EmptyBlock title="No sessions match" hint="Try another class or search." /></div> : (
 <ul className="mt-3 space-y-2 max-h-[55vh] overflow-y-auto pr-1">
 {filteredSessions.map((item) => {
 const tone = sessionTone(item.status);
 const tc = TONE_CLASSES[tone];
 const active = selectedId === item.id;
 return (
 <li key={item.id}>
 <button type="button" onClick={() => pick(item.id)} className={`flex w-full gap-3 rounded-box border p-3 text-left transition ${active ? 'border-brand bg-brand-soft' : 'border-line bg-base-100 hover:border-brand/20'}`}>
 <span className="w-1 shrink-0 self-stretch rounded-full" style={{ background: tc.hex }} aria-hidden />
 <span className="min-w-0 grow">
 <span className="block truncate text-xs font-semibold leading-tight">{item.title}</span>
 <span className="mt-1 block text-[11px] text-muted">{isoDate(item.startAt)} · {isoTime(item.startAt)}</span>
 <span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${tc.soft} ${tc.text}`}>{sessionStatusLabel(item.status)}</span>
 </span>
 </button>
 </li>
 );
 })}
 </ul>
 )}
 </Panel>

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
 {session?.meetingUrl ? <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90">Open meeting</a> : null}
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
 {hasChanges ? <span className="rounded-full bg-sun-soft px-2.5 py-1 text-xs font-medium text-[#8A6800]">{Object.keys(marks).length} changed</span> : null}
 {stats.counts.UNMARKED ? <span className="rounded-full bg-coral-soft px-2.5 py-1 text-xs font-medium text-[#D8482F]">{stats.counts.UNMARKED} unmarked</span> : rows.length ? <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-[#B30A00]">All marked</span> : null}
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

 {actionError ? <p role="alert" className="mt-3 rounded-field bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]">{actionError}</p> : null}
 {saved ? <p role="status" className="mt-3 rounded-field bg-brand-soft px-3 py-2 text-xs font-medium text-[#B30A00]">Attendance saved — roster refreshed.</p> : null}
 <div className="mt-4 flex flex-wrap gap-2">
 <button type="button" disabled={saving || rows.length === 0} onClick={handleSave} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
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

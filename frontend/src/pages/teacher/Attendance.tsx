import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiCalendar, FiDownload, FiSearch, FiX } from "react-icons/fi";
import { Panel, SectionHeader } from "../../components/ui/Panel";
import {
 EmptyBlock,
 ErrorBlock,
 LoadingBlock,
} from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { apiErrorMessage, downloadFile } from "../../lib/api";
import {
 getSessionRoster,
 isoDate,
 isoTime,
 listClasses,
 listSessions,
 markSessionAttendance,
} from "../../lib/services";
import { sessionStatusLabel, sessionTone } from "../../lib/sessions-ui";
import { TONE_CLASSES } from "../../lib/theme";
import { AttendanceRow } from "../../components/attendance/AttendanceRow";
import { BulkBar } from "../../components/attendance/BulkBar";
import { StatsStrip } from "../../components/attendance/StatsStrip";
import { applyBulk, rosterStats } from "../../components/attendance/utils";

export function TeacherAttendance() {
 const [searchParams, setSearchParams] = useSearchParams();
 const sessions = useApi("teacher-sessions", listSessions);
 const classes = useApi("teacher-classes-filter", listClasses);

 const selectedFromUrl = searchParams.get("session");
 const [selectedId, setSelectedId] = useState<string | null>(selectedFromUrl);
 const [marks, setMarks] = useState<Record<string, string>>({});
 const [q, setQ] = useState("");
 const [sessionQ, setSessionQ] = useState("");
 const [sessionClass, setSessionClass] = useState<string>("");
 const [actionError, setActionError] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);
 const [exporting, setExporting] = useState(false);
 const [saved, setSaved] = useState(false);

 const roster = useApi(
 `roster-${selectedId ?? "none"}`,
 () => getSessionRoster(selectedId ?? ""),
 selectedId !== null,
 );

 useEffect(() => {
 const fromUrl = searchParams.get("session");
 if (fromUrl && fromUrl !== selectedId) setSelectedId(fromUrl);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [searchParams]);

 function pick(id: string) {
 setSelectedId(id);
 setMarks({});
 setSaved(false);
 setActionError(null);
 const next = new URLSearchParams(searchParams);
 next.set("session", id);
 setSearchParams(next);
 }

 const list = useMemo(
 () =>
 [...(sessions.data ?? [])].sort(
 (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
 ),
 [sessions.data],
 );
 const filteredSessions = useMemo(() => {
 let out = list;
 if (sessionClass) out = out.filter((s) => s.classGroup?.id === sessionClass);
 if (sessionQ.trim()) {
 const needle = sessionQ.trim().toLowerCase();
 out = out.filter((s) => `${s.title} ${s.classGroup?.name ?? ""}`.toLowerCase().includes(needle));
 }
 return out;
 }, [list, sessionClass, sessionQ]);
 const rows = useMemo(() => roster.data ?? [], [roster.data]);
 const selected = list.find((s) => s.id === selectedId) ?? null;

 const filteredRows = useMemo(() => {
 if (!q.trim()) return rows;
 const needle = q.trim().toLowerCase();
 return rows.filter((r) =>
 `${r.firstName} ${r.lastName} ${r.studentCode}`
 .toLowerCase()
 .includes(needle),
 );
 }, [rows, q]);

 const stats = useMemo(() => rosterStats(rows as never, marks), [rows, marks]);
 const hasChanges = Object.keys(marks).length > 0;
 const unmarkedCount = stats.counts.UNMARKED;

 async function handleSave() {
 if (!selectedId) return;
 const records = Object.entries(marks).map(([studentId, status]) => ({
 studentId,
 status,
 }));
 if (records.length === 0) {
 setActionError(
 "Mark at least one student — tap Present / Absent / Late / Excused.",
 );
 return;
 }
 setActionError(null);
 setSaving(true);
 try {
 await markSessionAttendance(selectedId, records);
 setSaved(true);
 setMarks({});
 roster.refetch();
 } catch (err) {
 setActionError(apiErrorMessage(err, "Could not save attendance."));
 } finally {
 setSaving(false);
 }
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
 <SectionHeader title="Attendance" className="mb-0" />
 <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-medium">
 {list.length} sessions
 </span>
 </div>
 <p className="mt-1 text-xs leading-snug text-muted">
 Pick a session, tap a status per student, Save. Bulk-mark and search
 make large classes fast.
 </p>
 </Panel>

 <div className="grid gap-5 lg:grid-cols-12">
 <Panel className="lg:col-span-4 xl:col-span-3">
 <div className="flex items-center justify-between gap-2">
 <h3 className="flex items-center gap-2 text-sm font-bold">
 <FiCalendar aria-hidden className="text-brand" />
 Sessions
 </h3>
 <select
 value={sessionClass}
 onChange={(e) => setSessionClass(e.currentTarget.value)}
 className="select select-xs max-w-[140px] rounded-full border-line bg-base-100 text-xs"
 aria-label="Filter sessions by class"
 >
 <option value="">All classes</option>
 {(classes.data ?? []).map((c) => (
 <option key={c.id} value={c.id}>
 {c.name} {c.level ? `· ${c.level.code}` : ""}
 </option>
 ))}
 </select>
 </div>
 <div className="relative mt-3">
 <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
 <input
 value={sessionQ}
 onChange={(e) => setSessionQ(e.currentTarget.value)}
 placeholder="Filter sessions…"
 className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-8 text-xs"
 />
 {sessionQ ? (
 <button
 type="button"
 onClick={() => setSessionQ("")}
 className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"
 aria-label="Clear session filter"
 >
 <FiX aria-hidden />
 </button>
 ) : null}
 </div>
 {sessionQ || sessionClass ? (
 <p className="mt-2 text-xs text-muted">
 Showing {filteredSessions.length} of {list.length}
 <button type="button" onClick={() => { setSessionQ(""); setSessionClass(""); }} className="link link-hover ml-2 text-brand">Clear</button>
 </p>
 ) : null}
 {sessions.loading ? (
 <div className="mt-3">
 <LoadingBlock label="Loading sessions…" />
 </div>
 ) : sessions.error || !sessions.data ? (
 <div className="mt-3">
 <ErrorBlock
 message={sessions.error ?? "Could not load sessions."}
 onRetry={sessions.refetch}
 />
 </div>
 ) : list.length === 0 ? (
 <div className="mt-3">
 <EmptyBlock
 title="No sessions yet"
 hint="Schedule a live class first."
 />
 </div>
 ) : filteredSessions.length === 0 ? (
 <div className="mt-3">
 <EmptyBlock title="No sessions match" hint="Try another class or search." />
 </div>
 ) : (
 <ul className="mt-3 space-y-2 max-h-[55vh] overflow-y-auto pr-1">
 {filteredSessions.map((s) => {
 const tone = sessionTone(s.status);
 const tc = TONE_CLASSES[tone];
 const active = selectedId === s.id;
 return (
 <li key={s.id}>
 <button
 type="button"
 onClick={() => pick(s.id)}
 className={`flex w-full gap-3 rounded-box border p-3 text-left transition ${active ? "border-brand bg-brand-soft" : "border-line bg-base-100 hover:border-brand/20"}`}
 >
 <span
 className="w-1 shrink-0 self-stretch rounded-full"
 style={{ background: tc.hex }}
 aria-hidden
 />
 <span className="min-w-0 grow">
 <span className="block truncate text-xs font-semibold leading-tight">
 {s.title || "Untitled session"}
 </span>
 <span className="mt-1 block text-[11px] text-muted">
 {isoDate(s.startAt)} · {isoTime(s.startAt)} ·{" "}
 {s.classGroup?.name ?? "—"}
 </span>
 <span
 className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${tc.soft} ${tc.text}`}
 >
 {sessionStatusLabel(s.status)}
 </span>
 </span>
 </button>
 </li>
 );
 })}
 </ul>
 )}
 </Panel>

 <div className="space-y-4 lg:col-span-8 xl:col-span-9">
 {!selectedId ? (
 <Panel>
 <EmptyBlock
 title="Select a session"
 hint="Choose a session on the left. You'll see its roster grouped like Canvas — tap a pill per student, then Save."
 />
 </Panel>
 ) : roster.loading ? (
 <Panel>
 <LoadingBlock label="Loading roster…" />
 </Panel>
 ) : roster.error ? (
 <Panel>
 <ErrorBlock message={roster.error} onRetry={roster.refetch} />
 </Panel>
 ) : (
 <>
 <Panel>
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <h2 className="text-base font-bold leading-tight">
 {selected?.title || "Session"}
 </h2>
 <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
 {selected ? (
 <>
 <FiCalendar aria-hidden />
 {isoDate(selected.startAt)} ·{" "}
 {isoTime(selected.startAt)} –{" "}
 {isoTime(selected.endAt)}
 </>
 ) : null}
 {selected?.classGroup ? (
 <span className="rounded-full bg-base-200 px-2 py-0.5 font-medium text-ink">
 {selected.classGroup.name}
 </span>
 ) : null}
 {selected ? (
 <span
 className={`rounded-full px-2 py-0.5 font-medium ${TONE_CLASSES[sessionTone(selected.status)].soft} ${TONE_CLASSES[sessionTone(selected.status)].text}`}
 >
 {sessionStatusLabel(selected.status)}
 </span>
 ) : null}
 </p>
 </div>
 <button
 type="button"
 disabled={exporting || !selected?.classGroup}
 onClick={async () => {
 if (!selected?.classGroup) return;
 setExporting(true);
 setActionError(null);
 try {
 await downloadFile(
 `/attendance/export?classGroupId=${selected.classGroup.id}`,
 `attendance-${selected.classGroup.name}.csv`,
 );
 } catch (err: unknown) {
 setActionError(apiErrorMessage(err, "Could not export."));
 } finally {
 setExporting(false);
 }
 }}
 className="btn btn-sm gap-1 rounded-full border-line bg-base-100 disabled:opacity-60"
 >
 {exporting ? <span className="loading loading-spinner loading-xs" /> : <FiDownload aria-hidden />}
 {exporting ? "Exporting…" : "Export CSV"}
 </button>
 </div>

 <div className="mt-4">
 <StatsStrip
 counts={stats.counts}
 total={stats.total}
 rate={stats.rate}
 />
 </div>

 <div className="mt-4 flex flex-wrap items-center gap-2">
 <div className="relative">
 <FiSearch
 aria-hidden
 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
 />
 <input
 value={q}
 onChange={(e) => setQ(e.currentTarget.value)}
 placeholder="Search student…"
 className="input input-sm rounded-full border-line bg-base-100 pl-9 pr-8"
 />
 {q ? (
 <button
 type="button"
 onClick={() => setQ("")}
 className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"
 >
 <FiX aria-hidden />
 </button>
 ) : null}
 </div>
 <span className="text-xs text-muted">
 {filteredRows.length} of {rows.length}
 </span>
 {hasChanges ? (
 <span className="rounded-full bg-sun-soft px-2.5 py-1 text-xs font-medium text-[#8A6800]">
 {Object.keys(marks).length} changed
 </span>
 ) : null}
 {unmarkedCount ? (
 <span className="rounded-full bg-coral-soft px-2.5 py-1 text-xs font-medium text-[#D8482F]">
 {unmarkedCount} unmarked
 </span>
 ) : (
 <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-[#B30A00]">
 All marked
 </span>
 )}
 </div>

 <div className="mt-3">
 <BulkBar
 onPick={handleBulk}
 onClear={() => {
 setMarks({});
 setActionError(null);
 }}
 disabled={filteredRows.length === 0}
 />
 </div>
 </Panel>

 <Panel>
 {rows.length === 0 ? (
 <EmptyBlock
 title="Empty roster"
 hint="No students are assigned to this class group."
 />
 ) : filteredRows.length === 0 ? (
 <EmptyBlock title="No matches" hint="Try another search." />
 ) : (
 <ul className="space-y-2">
 {filteredRows.map((row) => {
 const current = marks[row.studentId] ?? row.status ?? "";
 return (
 <AttendanceRow
 key={row.studentId}
 firstName={row.firstName}
 lastName={row.lastName}
 studentCode={row.studentCode}
 current={current}
 savedStatus={row.status}
 onPick={(s) => {
 setMarks((prev) => ({
 ...prev,
 [row.studentId]: s,
 }));
 setSaved(false);
 setActionError(null);
 }}
 />
 );
 })}
 </ul>
 )}

 {actionError ? (
 <p
 role="alert"
 className="mt-3 rounded-field bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]"
 >
 {actionError}
 </p>
 ) : null}
 {saved ? (
 <p
 role="status"
 className="mt-3 rounded-field bg-brand-soft px-3 py-2 text-xs font-medium text-[#B30A00]"
 >
 Attendance saved — roster refreshed.
 </p>
 ) : null}

 <div className="mt-4 flex flex-wrap gap-2">
 <button
 type="button"
 disabled={saving || rows.length === 0}
 onClick={handleSave}
 className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
 >
 {saving ? (
 <span className="loading loading-spinner loading-xs" />
 ) : null}
 Save attendance{" "}
 {hasChanges ? `(${Object.keys(marks).length})` : ""}
 </button>
 {hasChanges ? (
 <button
 type="button"
 onClick={() => {
 setMarks({});
 setActionError(null);
 }}
 className="btn btn-sm rounded-full border-line bg-base-100"
 >
 Discard changes
 </button>
 ) : null}
 </div>
 {hasChanges ? (
 <p className="mt-2 text-[11px] text-muted">
 You have unsaved changes — they stay on this page until you
 Save.
 </p>
 ) : null}
 </Panel>
 </>
 )}
 </div>
 </div>
 </div>
 );
}

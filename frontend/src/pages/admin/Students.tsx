import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { FiDownload } from 'react-icons/fi';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { SearchField } from '../../components/ui/SearchField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage, downloadFile } from '../../lib/api';
import { isAcademic } from '../../lib/roles';
import { useSession } from '../../lib/session';
import { humanize, listLevels, listStudents, runPlacement } from '../../lib/services';

export function AdminStudents() {
 const { user } = useSession();
 const canPlace = user ? isAcademic(user.role) : false;
 const students = useApi('admin-students', listStudents);
 const levels = useApi('levels-catalog', listLevels);
 const [query, setQuery] = useState('');
 const [exporting, setExporting] = useState(false);
 const [exportError, setExportError] = useState<string | null>(null);

 const [placeStudent, setPlaceStudent] = useState('');
 const [placeScore, setPlaceScore] = useState('');
 const [placeLevel, setPlaceLevel] = useState('');
 const [placeNote, setPlaceNote] = useState('');
 const [placeResult, setPlaceResult] = useState<string | null>(null);
 const [placeError, setPlaceError] = useState<string | null>(null);
 const [placing, setPlacing] = useState(false);

 async function handlePlacement(event: FormEvent) {
 event.preventDefault();
 setPlaceError(null);
 setPlaceResult(null);
 setPlacing(true);
 try {
 const result = await runPlacement(placeStudent, {
 score: Number(placeScore),
 recommendedLevelId: placeLevel || undefined,
 note: placeNote.trim() || undefined,
 });
 setPlaceResult(`Score ${result.score} → recommended ${result.recommendedLevel.code} (${result.recommendedLevel.title}).`);
 students.refetch();
 } catch (err) {
 setPlaceError(apiErrorMessage(err, 'Could not save the placement.'));
 } finally {
 setPlacing(false);
 }
 }

 async function handleExport() {
 setExportError(null);
 setExporting(true);
 try {
 await downloadFile('/students/export?pageSize=100', 'students.csv');
 } catch (err) {
 setExportError(apiErrorMessage(err, 'Could not export students.'));
 } finally {
 setExporting(false);
 }
 }

 const rows = useMemo(() => {
 const needle = query.trim().toLowerCase();
 const list = students.data ?? [];
 if (!needle) return list;
 return list.filter((row) =>
 `${row.user.firstName} ${row.user.lastName} ${row.user.email} ${row.studentCode}`
 .toLowerCase()
 .includes(needle),
 );
 }, [students.data, query]);

 return (
 <div className="space-y-5">
 {canPlace ? (
 <Panel>
 <SectionHeader title="Placement test" />
 <form onSubmit={handlePlacement} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Student</span>
 <select required value={placeStudent} onChange={(event) => setPlaceStudent(event.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Select student</option>
 {(students.data ?? []).map((row) => (
 <option key={row.id} value={row.id}>
 {row.user.firstName} {row.user.lastName}
 </option>
 ))}
 </select>
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Score (0–100)</span>
 <input required value={placeScore} onChange={(event) => setPlaceScore(event.currentTarget.value)} inputMode="numeric" min={0} max={100} placeholder="e.g. 72" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Override level</span>
 <select value={placeLevel} onChange={(event) => setPlaceLevel(event.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Auto level</option>
 {(levels.data ?? []).map((level) => (
 <option key={level.id} value={level.id}>
 Override: {level.code}
 </option>
 ))}
 </select>
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Note</span>
 <input value={placeNote} onChange={(event) => setPlaceNote(event.currentTarget.value)} placeholder="Optional note" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 <div className="flex items-end">
 <button type="submit" disabled={placing} className="btn btn-sm w-full rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
 Save placement
 </button>
 </div>
 </form>
 {placeError ? (
 <p role="alert" className="mt-2 text-xs font-medium text-error">
 {placeError}
 </p>
 ) : null}
 {placeResult ? <p className="mt-2 text-xs font-medium text-brand">{placeResult}</p> : null}
 </Panel>
 ) : null}

 <Panel>
 <SectionHeader title={`Students (${rows.length})`} />
 <div className="mb-3 flex items-center gap-2">
 <button
 type="button"
 disabled={exporting}
 onClick={handleExport}
 className="btn btn-sm gap-2 rounded-full border-line bg-base-200 disabled:opacity-60"
 >
 <FiDownload aria-hidden />
 Export CSV
 </button>
 {exportError ? (
 <p role="alert" className="text-xs font-medium text-error">
 {exportError}
 </p>
 ) : null}
 </div>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Search students</span>
 <SearchField
 value={query}
 onChange={setQuery}
 ariaLabel="Search students"
 placeholder="Search name, email or student ID…"
 />
 </label>
 {students.loading ? (
 <LoadingBlock label="Loading students…" />
 ) : students.error || !students.data ? (
 <ErrorBlock message={students.error ?? 'Could not load students.'} onRetry={students.refetch} />
 ) : rows.length === 0 ? (
 <EmptyBlock title="No students found" hint="Try a different search or register the first student." />
 ) : (
 <div className="mt-4 overflow-x-auto">
 <table className="table w-full text-xs">
 <thead>
 <tr className="text-muted">
 <th className="text-left">Student</th>
 <th className="text-left">Student ID</th>
 <th className="text-left">Level</th>
 <th className="text-left">Campus</th>
 <th className="text-left">Status</th>
 </tr>
 </thead>
 <tbody>
 {rows.map((row) => (
 <tr key={row.id} className="border-t border-line">
 <td className="py-3 pr-4">
 <p className="font-semibold">
 {row.user.firstName} {row.user.lastName}
 </p>
 <p className="text-muted">{row.user.email}</p>
 </td>
 <td className="py-3 pr-4 font-medium">{row.studentCode}</td>
 <td className="py-3 pr-4">{row.currentLevel?.code ?? '—'}</td>
 <td className="py-3 pr-4">{row.campus?.name ?? '—'}</td>
 <td className="py-3">
 <StatusBadge status={humanize(row.status)} />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </Panel>
 </div>
 );
}

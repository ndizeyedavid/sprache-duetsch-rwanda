import { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiMail, FiCheckSquare, FiAward } from 'react-icons/fi';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { SearchField } from '../../components/ui/SearchField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { humanize, listClasses, getClass, createConversation } from '../../lib/services';

export function TeacherPeople() {
 const { classGroupId = '' } = useParams();
 const navigate = useNavigate();
 const classes = useApi('teacher-classes', listClasses);
 const detail = useApi(`class-${classGroupId}`, () => getClass(classGroupId), Boolean(classGroupId));

 const [query, setQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState<string>('ALL');
 const [sort, setSort] = useState<'name' | 'id'>('name');
 const [selected, setSelected] = useState<Set<string>>(new Set());
 const [bulkError, setBulkError] = useState<string | null>(null);
 const [bulkSending, setBulkSending] = useState(false);

 const enrollments = useMemo(() => detail.data?.enrollments ?? [], [detail.data]);

 const filtered = useMemo(() => {
 let list = [...enrollments];
 if (query.trim()) {
 const needle = query.trim().toLowerCase();
 list = list.filter((e) =>
 `${e.student.user.firstName} ${e.student.user.lastName} ${e.student.studentCode}`.toLowerCase().includes(needle),
 );
 }
 if (statusFilter !== 'ALL') {
 list = list.filter((e) => e.student.status === statusFilter);
 }
 if (sort === 'name') {
 list.sort((a, b) =>
 `${a.student.user.firstName} ${a.student.user.lastName}`.localeCompare(
 `${b.student.user.firstName} ${b.student.user.lastName}`,
 ),
 );
 } else {
 list.sort((a, b) => a.student.studentCode.localeCompare(b.student.studentCode));
 }
 return list;
 }, [enrollments, query, statusFilter, sort]);

 function toggle(id: string) {
 setSelected((prev) => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 return next;
 });
 }

 function toggleAll() {
 if (selected.size === filtered.length) setSelected(new Set());
 else setSelected(new Set(filtered.map((e) => e.student.user.id)));
 }

 async function handleBulkMessage() {
 if (selected.size === 0) {
 setBulkError('Select at least one student to message.');
 return;
 }
 setBulkError(null);
 setBulkSending(true);
 try {
 await createConversation({ participantIds: [...selected] });
 setSelected(new Set());
 } catch (err) {
 setBulkError(apiErrorMessage(err, 'Could not start the conversation.'));
 } finally {
 setBulkSending(false);
 }
 }

 if (detail.loading) return <LoadingBlock label="Loading roster…" />;
 if (detail.error || !detail.data) {
 return <ErrorBlock message={detail.error ?? 'Could not load this class.'} onRetry={detail.refetch} />;
 }

 const group = detail.data;

 return (
 <div className="space-y-5">
 <Panel>
 <div className="flex flex-wrap items-center gap-3">
 <SectionHeader title={group.name} />
 <select
 value={classGroupId}
 onChange={(e) => navigate(`/teacher/classes/${e.currentTarget.value}/people`)}
 className="select select rounded-full border-line bg-base-200"
 aria-label="Switch class"
 >
 {(classes.data ?? []).map((g) => (
 <option key={g.id} value={g.id}>
 {g.name} · {g.level.code}
 </option>
 ))}
 </select>
 <Link to="/teacher" className="btn btn-sm rounded-full border-line bg-base-200">
 Back to dashboard
 </Link>
 </div>
 <p className="mt-1 text-xs text-muted">
 {group.level.code} · {group.intake.name} · {group.campus.name} · {humanize(group.shift)} · {enrollments.length} student{enrollments.length === 1 ? '' : 's'}
 </p>

 <div className="mt-4 flex flex-wrap gap-2">
 <SearchField value={query} onChange={setQuery} ariaLabel="Search students" placeholder="Search name or student ID…" />
 <select value={statusFilter} onChange={(e) => setStatusFilter(e.currentTarget.value)} className="select select rounded-full border-line bg-base-200" aria-label="Status filter">
 <option value="ALL">All statuses</option>
 <option value="ACTIVE">Active</option>
 <option value="PENDING">Pending</option>
 </select>
 <select value={sort} onChange={(e) => setSort(e.currentTarget.value as 'name' | 'id')} className="select select rounded-full border-line bg-base-200" aria-label="Sort by">
 <option value="name">Sort by name</option>
 <option value="id">Sort by ID</option>
 </select>
 <button
 type="button"
 onClick={toggleAll}
 className="btn btn-sm rounded-full border-line bg-base-200"
 >
 {selected.size === filtered.length && filtered.length > 0 ? 'Deselect all' : 'Select all'}
 </button>
 <button
 type="button"
 onClick={handleBulkMessage}
 disabled={bulkSending || selected.size === 0}
 className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
 >
 <FiMail aria-hidden />
 Message {selected.size > 0 ? `(${selected.size})` : ''}
 </button>
 </div>
 {bulkError ? (
 <p role="alert" className="mt-2 text-xs font-medium text-error">
 {bulkError}
 </p>
 ) : null}
 </Panel>

 <Panel>
 {filtered.length === 0 ? (
 <EmptyBlock title="No students match your search" hint="Try a different filter or switch class." />
 ) : (
 <div className="overflow-x-auto">
 <table className="table w-full text-xs">
 <thead>
 <tr className="text-muted">
 <th>
 <input type="checkbox" className="checkbox checkbox-xs" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} aria-label="Select all" />
 </th>
 <th className="text-left">Student</th>
 <th className="text-left">Student ID</th>
 <th className="text-left">Status</th>
 <th className="text-left">Actions</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map((row) => (
 <tr key={row.student.id} className="border-t border-line">
 <td className="py-3">
 <input
 type="checkbox"
 className="checkbox checkbox-xs"
 checked={selected.has(row.student.user.id)}
 onChange={() => toggle(row.student.user.id)}
 aria-label={`Select ${row.student.user.firstName}`}
 />
 </td>
 <td className="py-3 pr-4">
 <p className="font-semibold">
 {row.student.user.firstName} {row.student.user.lastName}
 </p>
 <p className="text-muted">{row.student.user.email}</p>
 </td>
 <td className="py-3 pr-4 font-mono text-[11px]">{row.student.studentCode}</td>
 <td className="py-3">
 <StatusBadge status={humanize(row.student.status)} />
 </td>
 <td className="py-3">
 <div className="flex flex-wrap gap-1">
 <Link
 to={`/teacher/attendance?classGroupId=${classGroupId}`}
 className="btn btn-xs gap-1 rounded-full border-line bg-base-100"
 >
 <FiCheckSquare aria-hidden />
 Attendance
 </Link>
 <Link
 to={`/teacher/grading?classGroupId=${classGroupId}`}
 className="btn btn-xs gap-1 rounded-full border-line bg-base-100"
 >
 <FiAward aria-hidden />
 Grade
 </Link>
 </div>
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

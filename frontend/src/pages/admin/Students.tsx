import { useMemo,useState } from 'react';
import { FiChevronRight,FiDownload } from 'react-icons/fi';
import { Link,useNavigate } from 'react-router-dom';
import { AcademicModalAction } from '../../components/admin/AcademicModalAction';
import { StudentPlacement } from '../../components/admin/StudentPlacement';
import { StudentRegisterSummary } from '../../components/admin/StudentRegisterSummary';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { Panel,SectionHeader } from '../../components/ui/Panel';
import { SearchField } from '../../components/ui/SearchField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage,downloadFile } from '../../lib/api';
import { isAcademic } from '../../lib/roles';
import { humanize,listLevels,listStudents } from '../../lib/services';
import { useSession } from '../../lib/session';

export function AdminStudents() {
 const { user } = useSession();
 const navigate = useNavigate();
 const canPlace = user ? isAcademic(user.role) : false;
 const students = useApi('admin-students', listStudents);
 const levels = useApi('levels-catalog', listLevels);
 const [query, setQuery] = useState('');
 const [exporting, setExporting] = useState(false);
 const [exportError, setExportError] = useState<string | null>(null);

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
 <StudentRegisterSummary rows={students.data} />
 {canPlace && <AcademicModalAction label="Record placement" title="Placement result" wide>{done => <StudentPlacement students={students.data ?? []} levels={levels.data ?? []} onSaved={() => { students.refetch(); done('Placement saved.'); }} />}</AcademicModalAction>}


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
 <th><span className="sr-only">Open</span></th>
 </tr>
 </thead>
 <tbody>
 {rows.map((row) => (
 <tr
 key={row.id}
 onClick={() => navigate(`/admin/students/${row.id}`)}
 className="cursor-pointer border-t border-line hover:bg-base-200"
 >
 <td className="py-3 pr-4">
 <Link to={`/admin/students/${row.id}`} onClick={(event) => event.stopPropagation()} className="font-semibold hover:underline">
 {row.user.firstName} {row.user.lastName}
 </Link>
 <p className="text-muted">{row.user.email}</p>
 </td>
 <td className="py-3 pr-4 font-medium">{row.studentCode}</td>
 <td className="py-3 pr-4">{row.currentLevel?.code ?? '—'}</td>
 <td className="py-3 pr-4">{row.campus?.name ?? '—'}</td>
 <td className="py-3">
 <StatusBadge status={humanize(row.status)} />
 </td>
 <td className="py-3 text-right text-muted">
 <FiChevronRight aria-hidden />
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

import { useMemo,useState } from 'react';
import { FiCompass,FiDollarSign,FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { BalanceFilter } from '../../components/admin/students/BalanceFilter';
import { StudentsTable } from '../../components/admin/students/StudentsTable';
import { SuspendStudentDialog } from '../../components/student-suspension/SuspendStudentDialog';
import { balanceOf,matchesBalance,type BalanceFilter as BalanceFilterValue } from '../../components/payments/quick-pay/quick-pay';
import { QuickPaymentDialog } from '../../components/payments/quick-pay/QuickPaymentDialog';
import { StudentPlacement } from '../../components/admin/StudentPlacement';
import { StudentRegisterSummary } from '../../components/admin/StudentRegisterSummary';
import { WORKSPACE_CONTEXT } from '../../components/admin/workspace-context';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { heroAction,heroGhost } from '../../components/hero/hero-actions';
import { PageHero } from '../../components/hero/PageHero';
import { Modal } from '../../components/ui/Modal';
import { Panel } from '../../components/ui/Panel';
import { SearchField } from '../../components/ui/SearchField';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage,downloadFile } from '../../lib/api';
import { isAcademic,isAdmin,isFinance } from '../../lib/roles';
import { listLevels,listStudents } from '../../lib/services';
import type { StudentRow } from '../../lib/services/student-row';
import { useSession } from '../../lib/session';

/** Finance admins share this register, so their header links stay inside the finance module. */
const FINANCE_LINKS = [{ label: 'Finance overview', to: '/admin/finance' }, { label: 'Transactions', to: '/admin/transactions' }];

export function AdminStudents() {
 const { user } = useSession();
 const canPlace = user ? isAcademic(user.role) : false;
 const academic = user ? isAdmin(user.role) : false;
 // Finance and super admins see balances and can record a payment from the row.
 const money = user ? isFinance(user.role) : false;
 const [balanceFilter, setBalanceFilter] = useState<BalanceFilterValue>('all');
 const [paying, setPaying] = useState<StudentRow | null>(null);
 const [paid, setPaid] = useState<string | null>(null);
 const [suspending, setSuspending] = useState<StudentRow | null>(null);
 const suspendDone = (message: string) => { setSuspending(null); setExportError(null); setPaid(message); students.refetch(); };
 const context = WORKSPACE_CONTEXT.students;
 const [placing, setPlacing] = useState(false);
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
 const list = (students.data ?? []).filter((row) =>
 (!needle || `${row.user.firstName} ${row.user.lastName} ${row.user.email} ${row.studentCode}`.toLowerCase().includes(needle))
 && (!money || matchesBalance(balanceOf(row), balanceFilter)));
 // Finance works the biggest balances first.
 return money ? [...list].sort((a, b) => (balanceOf(b)?.balance ?? 0) - (balanceOf(a)?.balance ?? 0)) : list;
 }, [students.data, query, money, balanceFilter]);

 return (
 <div className="space-y-5">
 <PageHero
 eyebrow={academic ? context.category : 'Student balances'}
 icon={academic ? context.icon : FiDollarSign}
 title="Students"
 description={academic
 ? 'Every learner in the register with their level, campus and status. Open a record for progress, attendance and certificates.'
 : 'Every learner with what they still owe. Record a payment straight from the list, or open a record for charges and receipts.'}
 art="learners"
 scoped
 meta={<StudentRegisterSummary rows={students.data} academic={academic} />}
 actions={<>
 <button type="button" disabled={exporting} onClick={handleExport} className={`${heroAction} disabled:border-primary-content disabled:bg-primary-content disabled:text-primary`}>
 {exporting ? <span className="loading loading-spinner loading-xs" /> : <FiDownload aria-hidden />}
 Export CSV
 </button>
 {canPlace ? (
 <button type="button" onClick={() => setPlacing(true)} className={heroGhost}>
 <FiCompass aria-hidden />
 Placement results
 </button>
 ) : null}
 {(academic ? context.links : FINANCE_LINKS).map((link) => (
 <Link key={link.to} to={link.to} className={heroGhost}>{link.label}</Link>
 ))}
 </>}
 />
 {exportError ? (
 <p role="alert" className="alert alert-error alert-soft text-xs">
 {exportError}
 </p>
 ) : null}

 <Panel>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Search students</span>
 <SearchField
 value={query}
 onChange={setQuery}
 ariaLabel="Search students"
 placeholder="Search name, email or student ID…"
 />
 </label>
 {money && students.data ? <div className="mt-3"><BalanceFilter rows={students.data} value={balanceFilter} onChange={setBalanceFilter} /></div> : null}
 {students.data ? (
 <p className="mt-2 text-xs text-muted">
 {rows.length === students.data.length ? `${rows.length} students` : `${rows.length} of ${students.data.length} students`}
 </p>
 ) : null}
 {paid ? <p role="status" className="alert alert-success alert-soft mt-3 text-xs">{paid}</p> : null}
 {students.loading ? (
 <LoadingBlock label="Loading students…" />
 ) : students.error || !students.data ? (
 <ErrorBlock message={students.error ?? 'Could not load students.'} onRetry={students.refetch} />
 ) : rows.length === 0 ? (
 <EmptyBlock title="No students found" hint="Try a different search or register the first student." />
 ) : (
 <StudentsTable rows={rows} money={money} onPay={(row) => { setPaid(null); setPaying(row); }}
 suspension={academic ? { onSuspend: (row) => { setPaid(null); setSuspending(row); }, onDone: suspendDone, onError: setExportError } : undefined} />
 )}
 </Panel>
 {money ? <QuickPaymentDialog student={paying} onClose={() => setPaying(null)}
 onDone={(message) => { setPaid(`${paying ? `${paying.user.firstName} ${paying.user.lastName}: ` : ''}${message}`); setPaying(null); students.refetch(); }} /> : null}
 {academic ? <SuspendStudentDialog student={suspending ? { id: suspending.id, name: `${suspending.user.firstName} ${suspending.user.lastName}` } : null}
 onClose={() => setSuspending(null)} onDone={suspendDone} /> : null}
 {canPlace ? (
 <Modal open={placing} onClose={() => setPlacing(false)} title="Placement results" boxClassName="max-w-3xl">
 <StudentPlacement students={students.data ?? []} levels={levels.data ?? []} onSaved={students.refetch} />
 </Modal>
 ) : null}
 </div>
 );
}

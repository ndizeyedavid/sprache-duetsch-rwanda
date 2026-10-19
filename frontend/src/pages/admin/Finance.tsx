import { FiAlertCircle,FiArrowUpRight,FiDollarSign,FiTrendingDown,FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { AcademicMetricCard } from '../../components/admin/AcademicMetricCard';
import { AcademicRateGauge } from '../../components/admin/AcademicRateGauge';
import { GroupedBar } from '../../components/charts/GroupedBar';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { heroAction,heroGhost } from '../../components/hero/hero-actions';
import { PageHero } from '../../components/hero/PageHero';
import { Panel,SectionHeader } from '../../components/ui/Panel';
import { useApi } from '../../hooks/useApi';
import { currencyAmount } from '../../lib/format';
import { listClaims } from '../../lib/payment-claims';
import { getFinanceDashboard,listCampuses,listLevels,money } from '../../lib/services';
import { PaypackMonitor } from '../../components/payments/PaypackMonitor';
import { COLORS } from '../../lib/theme';

export function AdminFinance() {
 const dashboard = useApi('finance-dashboard', getFinanceDashboard);
 const levels = useApi('levels-catalog', listLevels);
 const campuses = useApi('finance-campus-labels', listCampuses);
 const claims = useApi('payment-claims-count', () => listClaims('PENDING', 1, 1));
 const waiting = claims.data?.summary.pending ?? 0;

 const hero = (
 <PageHero eyebrow="Tuition overview" icon={FiDollarSign} title="Finance dashboard" art="finance" scoped
 description="What was billed, what came in and who needs a payment reminder."
 meta={waiting ? <Link to="/admin/transactions#approvals" className="hero-chip hero-chip-solid">{waiting} student {waiting === 1 ? 'payment' : 'payments'} waiting for approval</Link> : null}
 actions={<>
 <Link to="/admin/transactions" className={heroAction}>Transactions <FiArrowUpRight aria-hidden /></Link>
 <Link to="/admin/students" className={heroGhost}>Student balances</Link>
 </>} />
 );
 if (dashboard.loading) return <div className="space-y-5">{hero}<LoadingBlock label="Loading finance overview…" /></div>;
 if (dashboard.error || !dashboard.data) {
 return <div className="space-y-5">{hero}<ErrorBlock message={dashboard.error ?? 'Could not load finance data.'} onRetry={dashboard.refetch} /></div>;
 }

 const data = dashboard.data;
 const format = (amount: number) => currencyAmount(amount, data.currency);
 const levelName = (id: string): string =>
 levels.data?.find((level) => level.id === id)?.code ?? 'Unassigned';

 const billedVsCollected = data.byLevel.map((row) => ({
 level: levelName(row.key),
 billed: money(row.billed),
 collected: money(row.collected),
 }));

 return (
 <div className="space-y-5">
 {hero}
 <PaypackMonitor />
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <AcademicMetricCard label="Total billed" value={format(money(data.totalBilled))} note="Charges less approved discounts" icon={FiDollarSign} />
 <AcademicMetricCard label="Collected" value={format(money(data.totalCollected))} note="Payments less refunds" tone="success" icon={FiTrendingUp} />
 <AcademicMetricCard label="Outstanding" value={format(money(data.totalOutstanding))} note="Current unpaid obligations" tone="warning" icon={FiTrendingDown} />
 <AcademicMetricCard label="Overdue accounts" value={data.overdueCount} note="Accounts requiring payment follow-up" tone="info" icon={FiAlertCircle} />
 </div>

 <div className="grid gap-5 lg:grid-cols-3">
 <Panel className="lg:col-span-2">
 <SectionHeader title="Billed vs collected by level" />
 {billedVsCollected.length === 0 ? (
 <EmptyBlock title="No finance activity yet" hint="Charges and payments will appear here." />
 ) : (
 <GroupedBar
 data={billedVsCollected}
 xKey="level"
 barSize={20}
 series={[
 { key: 'billed', label: 'Billed', color: COLORS.navy },
 { key: 'collected', label: 'Collected', color: COLORS.brand },
 ]}
 height={260}
 />
 )}
 </Panel>

 <Panel>
 <SectionHeader title="Collection rate" />
 <div className="my-5 flex justify-center"><AcademicRateGauge value={data.collectionRate} label="Tuition collection rate" /></div>
 <p className="mt-1 text-xs text-muted">
 {format(money(data.totalCollected))} of {format(money(data.totalBilled))} collected.
 </p>
 <Link
 to="/admin/transactions"
 className="btn btn-sm mt-4 w-full rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content"
 >
 Manage transactions
 </Link>
 </Panel>
 </div>

 <div className="grid gap-5 lg:grid-cols-2">
 <Panel>
 <SectionHeader title="By payment method" />
 {data.byPaymentMethod.length === 0 ? (
 <EmptyBlock title="No payments recorded" />
 ) : (
 <ul className="space-y-2">
 {data.byPaymentMethod.map((row) => (
 <li
 key={row.methodId}
 className="rounded-box border border-base-300 bg-base-100 p-4 text-xs"
 >
 <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{row.name ?? 'Unknown method'}</span><span className="font-semibold">{format(money(row.total))}</span></div><progress aria-label={`${row.name ?? 'Payment method'} share of collected payments`} className="progress progress-success mt-3 h-1.5 w-full" value={money(row.total)} max={Math.max(1, money(data.totalCollected))} />
 </li>
 ))}
 </ul>
 )}
 </Panel>

 <Panel>
 <SectionHeader title="By campus" />
 {data.byCampus.length === 0 ? (
 <EmptyBlock title="No campus data yet" />
 ) : (
 <ul className="space-y-2">
 {data.byCampus.map((row) => (
 <li
 key={row.key}
 className="flex flex-wrap items-center justify-between gap-3 rounded-box border border-base-300 bg-base-100 p-4 text-xs"
 >
 <span className="font-medium">{campuses.data?.find(c => c.id === row.key)?.name ?? (row.key === 'UNASSIGNED' ? 'Unassigned' : 'Campus')}</span>
 <span className="text-muted">
 {format(money(row.collected))} / {format(money(row.billed))}
 </span>
 </li>
 ))}
 </ul>
 )}
 </Panel>
 </div>
 </div>
 );
}

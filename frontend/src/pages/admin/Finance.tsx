import { Link } from 'react-router-dom';
import { FiAlertCircle, FiDollarSign, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatTile } from '../../components/ui/StatTile';
import { GroupedBar } from '../../components/charts/GroupedBar';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { COLORS } from '../../lib/theme';
import { rwf } from '../../lib/format';
import { getFinanceDashboard, listLevels, money } from '../../lib/services';

export function AdminFinance() {
 const dashboard = useApi('finance-dashboard', getFinanceDashboard);
 const levels = useApi('levels-catalog', listLevels);

 if (dashboard.loading) return <LoadingBlock label="Loading finance overview…" />;
 if (dashboard.error || !dashboard.data) {
 return <ErrorBlock message={dashboard.error ?? 'Could not load finance data.'} onRetry={dashboard.refetch} />;
 }

 const data = dashboard.data;
 const levelName = (id: string): string =>
 levels.data?.find((level) => level.id === id)?.code ?? 'Unassigned';

 const billedVsCollected = data.byLevel.map((row) => ({
 level: levelName(row.key),
 billed: money(row.billed),
 collected: money(row.collected),
 }));

 return (
 <div className="space-y-5">
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <StatTile label="Total billed" value={rwf(money(data.totalBilled))} tone="navy" variant="solid" icon={FiDollarSign} />
 <StatTile label="Collected" value={rwf(money(data.totalCollected))} tone="brand" variant="solid" icon={FiTrendingUp} />
 <StatTile label="Outstanding" value={rwf(money(data.totalOutstanding))} tone="coral" variant="solid" icon={FiTrendingDown} />
 <StatTile label="Overdue accounts" value={String(data.overdueCount)} tone="sun" variant="solid" icon={FiAlertCircle} />
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
 <p className="text-3xl font-semibold text-brand">{data.collectionRate}%</p>
 <p className="mt-1 text-xs text-muted">
 {rwf(money(data.totalCollected))} of {rwf(money(data.totalBilled))} collected.
 </p>
 <Link
 to="/admin/transactions"
 className="btn btn-sm mt-4 w-full rounded-full border-0 bg-brand text-white hover:bg-brand/90"
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
 className="flex items-center justify-between gap-3 rounded-field bg-base-200 px-3 py-2 text-xs"
 >
 <span className="font-medium">{row.name ?? 'Unknown method'}</span>
 <span className="font-semibold text-brand">{rwf(money(row.total))}</span>
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
 className="flex items-center justify-between gap-3 rounded-field bg-base-200 px-3 py-2 text-xs"
 >
 <span className="font-medium">{row.key === 'UNASSIGNED' ? 'Unassigned' : row.key}</span>
 <span className="text-muted">
 {rwf(money(row.collected))} / {rwf(money(row.billed))}
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

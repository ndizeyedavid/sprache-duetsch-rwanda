import { useState } from 'react';
import { FiRefreshCw, FiSearch, FiSmartphone } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { checkPayment, isUnresolved, listPaypackCheckouts } from '../../lib/paypack';
import { Panel } from '../ui/Panel';
import { PaymentMonitorRow } from './PaymentMonitorRow';

const filters = ['All requests', 'Awaiting approval', 'Paid', 'Needs confirmation', 'Unsuccessful'] as const;
type Filter = typeof filters[number];
export function PaypackMonitor() {
  const requests = useApi('paypack-monitor', listPaypackCheckouts);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('All requests');
  const [search, setSearch] = useState('');
  const rows = requests.data ?? [];
  const filtered = rows.filter(row => {
    const match = filter === 'All requests' || (filter === 'Awaiting approval' && ['INITIATING', 'PENDING'].includes(row.status))
      || (filter === 'Paid' && row.status === 'SUCCESSFUL') || (filter === 'Needs confirmation' && row.status === 'UNKNOWN')
      || (filter === 'Unsuccessful' && row.status === 'FAILED');
    const text = `${row.student?.user.firstName ?? ''} ${row.student?.user.lastName ?? ''} ${row.student?.studentCode ?? ''} ${row.phone} ${row.id} ${row.providerRef ?? ''}`;
    return match && text.toLowerCase().includes(search.trim().toLowerCase());
  });
  const check = async (id: string) => {
    if (busyId) return;
    setBusyId(id); setError(null);
    try { await checkPayment(id); requests.refetch(); }
    catch (err) { setError(apiErrorMessage(err, 'Could not check status.')); }
    finally { setBusyId(null); }
  };
  return <Panel>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-box bg-base-200"><FiSmartphone aria-hidden /></span>
        <div><h2 className="text-base font-semibold">Mobile-money payments</h2><p className="mt-1 text-xs text-base-content/60">Latest 100 requests · confirmed payments update the ledger</p></div></div>
      <button className="btn btn-sm min-h-10" onClick={requests.refetch} disabled={requests.fetching}><FiRefreshCw className={requests.fetching ? 'animate-spin motion-reduce:animate-none' : ''} aria-hidden />{requests.fetching ? 'Refreshing…' : 'Refresh'}</button>
    </div>
    <div className="mt-5 grid grid-cols-3 gap-2 rounded-box border border-base-300 bg-base-200/30 p-3 text-center sm:gap-4">
      {[{ label: 'Awaiting', count: rows.filter(isUnresolved).length }, { label: 'Received', count: rows.filter(row => row.status === 'SUCCESSFUL').length },
        { label: 'To review', count: rows.filter(row => row.status === 'UNKNOWN').length }].map(item => <div key={item.label}><p className="text-xl font-semibold tabular-nums">{item.count}</p><p className="mt-1 text-xs text-base-content/60">{item.label}</p></div>)}
    </div>
    <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter payment requests">{filters.map(item => <button key={item} className={`btn btn-sm ${filter === item ? 'btn-active' : 'btn-ghost'}`} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <label className="input w-full xl:w-64"><FiSearch className="shrink-0 text-base-content/60" aria-hidden /><input type="search" aria-label="Search payment requests" placeholder="Name, phone or reference" value={search} onChange={event => setSearch(event.target.value)} /></label>
    </div>
    {requests.loading ? <p className="flex items-center gap-2 py-8 text-sm text-base-content/60" role="status"><span className="loading loading-spinner loading-sm" aria-hidden />Loading requests…</p> : null}
    {requests.error || error ? <p className="alert alert-error alert-soft mt-4 text-sm" role="alert">{requests.error ?? error}</p> : null}
    {!requests.loading && !requests.error && !filtered.length ? <div className="py-10 text-center"><FiSmartphone className="mx-auto text-2xl text-base-content/40" aria-hidden /><p className="mt-3 text-sm font-medium">{rows.length ? 'No matching payments' : 'No mobile-money payments yet'}</p><p className="mt-1 text-xs text-base-content/60">{rows.length ? 'Try another filter or search.' : 'Payment requests will appear here when a student starts checkout.'}</p></div> : null}
    <ul className="mt-3 divide-y divide-base-300">{filtered.map(row => <PaymentMonitorRow key={row.id} row={row} busy={busyId === row.id} onCheck={() => void check(row.id)} onDone={requests.refetch} />)}</ul>
  </Panel>;
}

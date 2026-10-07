import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { currencyAmount } from '../../lib/format';
import { checkPayment, isUnresolved, listPaypackCheckouts } from '../../lib/paypack';
import { Panel } from '../ui/Panel';
import { PaypackCloseForm } from './PaypackCloseForm';
import { PaypackReconcileForm } from './PaypackReconcileForm';

export function PaypackMonitor() {
  const requests = useApi('paypack-monitor', listPaypackCheckouts);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  return <Panel>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-base font-semibold">Paypack payment requests</h2>
      <button className="btn btn-sm" onClick={requests.refetch} disabled={requests.fetching}>Refresh</button>
    </div>
    <p className="mt-1 text-sm text-base-content/70">Only confirmed payments appear in the ledger. Showing the latest 100 requests.</p>
    {requests.loading ? <p className="mt-3" role="status">Loading requests…</p> : null}
    {requests.error || error ? <p className="mt-3 text-error" role="alert">{requests.error ?? error}</p> : null}
    {requests.data?.length === 0 ? <p className="mt-3 text-sm">No online payment requests yet.</p> : null}
    <ul className="mt-3 divide-y divide-base-300">
      {requests.data?.map(row => <li className="py-3" key={row.id}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 text-sm">
            <p className="font-semibold">{row.student?.user.firstName} {row.student?.user.lastName} · {row.student?.studentCode}</p>
            <p>{currencyAmount(Number(row.amount), row.currency)} · {row.phone} · {row.status.toLowerCase()}</p>
            <p className="break-all text-xs text-base-content/70">Request: {row.id}</p>
            {row.providerRef ? <p className="break-all text-xs text-base-content/70">Paypack: {row.providerRef}</p> : null}
          </div>
          {isUnresolved(row) && row.providerRef ? <button className="btn btn-sm" disabled={busyId === row.id} onClick={() => {
            setBusyId(row.id); setError(null);
            void checkPayment(row.id).then(requests.refetch)
              .catch(err => setError(apiErrorMessage(err, 'Could not check status.'))).finally(() => setBusyId(null));
          }}>Check status</button> : null}
        </div>
        {row.status === 'UNKNOWN' && !row.providerRef ? <div><PaypackReconcileForm id={row.id} onDone={requests.refetch} /><PaypackCloseForm id={row.id} onDone={requests.refetch} /></div> : null}
      </li>)}
    </ul>
  </Panel>;
}

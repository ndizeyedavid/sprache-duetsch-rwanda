import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import type { PaymentCheckout } from '../../lib/paypack';
import { checkPayment, listPaypackCheckouts } from '../../lib/paypack';
import { Panel } from '../ui/Panel';
import { PaymentMonitorRow } from './PaymentMonitorRow';

const STUCK_AFTER_MS = 30 * 60 * 1000;

/** A request needs finance only when its result is unclear or it has been stuck for a while. */
const needsFinance = (row: PaymentCheckout, now: number) =>
  row.status === 'UNKNOWN' || (['INITIATING', 'PENDING'].includes(row.status) && now - new Date(row.createdAt).getTime() > STUCK_AFTER_MS);

/**
 * Hidden day to day: paid requests are already in the ledger and failed ones need nothing.
 * Appears only when a mobile-money payment must be confirmed by hand.
 */
export function PaypackMonitor() {
  const requests = useApi('paypack-monitor', listPaypackCheckouts);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  const rows = (requests.data ?? []).filter(row => needsFinance(row, now));
  if (!rows.length && !error) return null;

  const check = async (id: string) => {
    if (busyId) return;
    setBusyId(id); setError(null);
    try { await checkPayment(id); requests.refetch(); }
    catch (err) { setError(apiErrorMessage(err, 'Could not check status.')); }
    finally { setBusyId(null); }
  };

  return (
    <Panel className="border-warning/40">
      <h2 className="text-base font-semibold">Mobile-money payments to confirm</h2>
      <p className="mt-1 text-sm text-muted">
        {rows.length === 1 ? 'One payment' : `${rows.length} payments`} did not get a clear result. Check the status, or confirm it with the reference.
      </p>
      {error ? <p className="alert alert-error alert-soft mt-4 text-sm" role="alert">{error}</p> : null}
      <ul className="mt-3 divide-y divide-base-300">
        {rows.map(row => <PaymentMonitorRow key={row.id} row={row} busy={busyId === row.id} onCheck={() => void check(row.id)} onDone={requests.refetch} />)}
      </ul>
    </Panel>
  );
}

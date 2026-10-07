import { useCallback, useEffect, useRef, useState } from 'react';
import { apiErrorMessage, apiErrorStatus } from '../../lib/api';
import { checkPayment, isUnresolved, listMyCheckouts, startPayment } from '../../lib/paypack';
import type { PaymentCheckout } from '../../lib/paypack';

export function usePaypackCheckout(onPaid: () => void) {
  const [rows, setRows] = useState<PaymentCheckout[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAvailable, setRetryAvailable] = useState(false);
  const inFlight = useRef(false);
  const request = useRef<{ amount: number; phone: string; requestKey: string } | null>(null);
  const paidCallback = useRef(onPaid);
  useEffect(() => { paidCallback.current = onPaid; }, [onPaid]);
  const load = useCallback(async () => {
    try { setRows(await listMyCheckouts()); setHistoryReady(true); setError(null); }
    catch (err) { setHistoryReady(false); setError(apiErrorMessage(err, 'Could not load mobile-money payments.')); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const pending = rows.find(isUnresolved);
  const refresh = useCallback(async (id: string) => {
    try {
      const next = await checkPayment(id);
      setRows(current => current.map(row => row.id === next.id ? next : row));
      setError(null);
      if (next.status === 'SUCCESSFUL') paidCallback.current();
    } catch (err) { setError(apiErrorMessage(err, 'Could not check payment status.')); }
  }, []);
  useEffect(() => {
    if (!pending?.providerRef) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh(pending.id);
    }, 20000);
    return () => window.clearInterval(timer);
  }, [pending?.id, pending?.providerRef, refresh]);
  const pay = async (amount: number, phone: string) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true); setError(null);
    // Keep the same key after a transport failure; changing the form must not silently create another debit.
    request.current ??= { amount, phone, requestKey: crypto.randomUUID() };
    try {
      const row = await startPayment(request.current);
      request.current = null; setRetryAvailable(false);
      setRows(current => [row, ...current.filter(item => item.id !== row.id)]);
      if (row.status === 'SUCCESSFUL') paidCallback.current();
    } catch (err) {
      const status = apiErrorStatus(err);
      const rejected = status !== undefined && [400, 401, 403, 409, 422].includes(status);
      if (rejected) request.current = null;
      setRetryAvailable(!rejected);
      await load();
      setError(apiErrorMessage(err, 'Could not start payment. Retry to check the same request.'));
    } finally { setBusy(false); inFlight.current = false; }
  };
  const retry = () => {
    if (request.current) void pay(request.current.amount, request.current.phone);
  };
  return { historyReady, retry, retryAvailable, rows, pending, loading, busy, error, pay, refresh, load };
}

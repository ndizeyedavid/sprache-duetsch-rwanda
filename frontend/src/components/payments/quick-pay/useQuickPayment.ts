import type { FormEvent } from 'react';
import { useEffect,useRef,useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiErrorMessage } from '../../../lib/api';
import { listPaymentMethods,listStudentEnrollments,recordPayment } from '../../../lib/services';
import { todayInput } from '../../payment-claims/utils';
import type { BalanceInfo } from './quick-pay';

type Recorded = { amount: string | number; receipt?: { receiptNumber: string } | null };

/** State + submit for the one-step "record payment" dialog on the students list. */
export function useQuickPayment(studentId: string | null, info: BalanceInfo | null, onDone: (message: string) => void) {
  const open = Boolean(studentId);
  const methods = useApi('payment-methods', listPaymentMethods, open);
  const enrollments = useApi(`quick-pay-enrolments-${studentId ?? ''}`, () => listStudentEnrollments(studentId!), open);
  const requestKey = useRef(crypto.randomUUID());
  const [amount, setAmount] = useState(''), [methodId, setMethodId] = useState(''), [reference, setReference] = useState('');
  const [paidAt, setPaidAt] = useState(todayInput()), [enrollmentId, setEnrollmentId] = useState(''), [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);

  // Fresh form for each student: whole balance pre-filled, today's date, new idempotency key.
  useEffect(() => {
    if (!studentId) return;
    requestKey.current = crypto.randomUUID();
    setAmount(info && info.balance > 0 ? String(info.balance) : ''); setReference(''); setNotes(''); setError(null);
    setPaidAt(todayInput()); setEnrollmentId('');
  }, [studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // A single active enrolment is allocated automatically, so finance reports keep the intake/level.
  const active = (enrollments.data ?? []).filter((row) => row.status === 'ACTIVE');
  useEffect(() => { if (active.length === 1) setEnrollmentId(active[0].id); }, [enrollments.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const method = methods.data?.find((row) => row.id === methodId);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!studentId || !info) return;
    setBusy(true); setError(null);
    try {
      const payment = await recordPayment({
        idempotencyKey: requestKey.current, studentId, enrollmentId: enrollmentId || undefined, methodId,
        amount: Number(amount), currency: info.currency, reference: reference.trim() || undefined,
        paidAt: new Date(`${paidAt}T12:00:00`).toISOString(), notes: notes.trim() || undefined,
      }) as Recorded;
      requestKey.current = crypto.randomUUID();
      onDone(`${info.currency} ${Number(amount).toLocaleString('en-US')} recorded${payment.receipt ? ` — receipt ${payment.receipt.receiptNumber}` : ''}.`);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not record the payment.'));
    } finally { setBusy(false); }
  }

  return {
    methods: methods.data ?? [], methodsLoading: methods.loading, enrollments: enrollments.data ?? [], method,
    values: { amount, methodId, reference, paidAt, enrollmentId, notes },
    set: { setAmount, setMethodId, setReference, setPaidAt, setEnrollmentId, setNotes },
    busy, error, submit,
  };
}

export type QuickPayment = ReturnType<typeof useQuickPayment>;

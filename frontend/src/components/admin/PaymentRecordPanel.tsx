import type { FormEvent } from 'react';
import { useRef, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import type { StudentRow } from '../../lib/services';
import { listPaymentMethods,listStudentEnrollments,recordPayment } from '../../lib/services';

export function PaymentRecordPanel({ students, onRecorded }: { students: StudentRow[]; onRecorded: () => void }) {
 const requestKey = useRef(crypto.randomUUID());
 const methods = useApi('payment-methods', listPaymentMethods);
 const [success, setSuccess] = useState<string | null>(null);
 const [payStudent, setPayStudent] = useState('');
 const [payEnrollment, setPayEnrollment] = useState('');
 const [payAmount, setPayAmount] = useState('');
 const [payMethod, setPayMethod] = useState('');
 const [payReference, setPayReference] = useState('');
 const [payError, setPayError] = useState<string | null>(null);
 const [paySaving, setPaySaving] = useState(false);
 const enrollments = useApi(`payment-enrollments-${payStudent}`, () => listStudentEnrollments(payStudent), Boolean(payStudent));
 const currency = students.find(row => row.id === payStudent)?.finance?.currency ?? "RWF";

 async function handleRecordPayment(event: FormEvent) {
 event.preventDefault();
 if (paySaving) return;
 setPayError(null); setSuccess(null);
 setPaySaving(true);
 try {
 await recordPayment({
 idempotencyKey: requestKey.current,
 studentId: payStudent,
 enrollmentId: payEnrollment || undefined,
 methodId: payMethod,
 amount: Number(payAmount),
 currency,
 reference: payReference.trim() || undefined,
 });
 requestKey.current = crypto.randomUUID();
 setPayAmount('');
 setPayReference('');
 onRecorded(); setSuccess('Payment recorded. The account balance has been recalculated.');
 } catch (err) {
 setPayError(apiErrorMessage(err, 'Could not record the payment.'));
 } finally {
 setPaySaving(false);
 }
 }

 return (
 <form onSubmit={handleRecordPayment} className="space-y-3">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Student</span>
 <select required value={payStudent} onChange={(event) => { setPayStudent(event.currentTarget.value); setPayEnrollment(''); }} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Choose…</option>
 {students.map((row) => (
 <option key={row.id} value={row.id}>
 {row.user.firstName} {row.user.lastName} ({row.studentCode})
 </option>
 ))}
 </select>
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Enrolment for reporting</span>
 <select className="select w-full" value={payEnrollment} disabled={!payStudent || enrollments.loading} onChange={event => setPayEnrollment(event.target.value)}>
 <option value="">Unallocated student payment</option>
 {enrollments.data?.map(row => <option key={row.id} value={row.id}>{row.level.code} · {row.intake.name}</option>)}
 </select>
 <p className="mt-1 text-xs text-muted">Choose the enrolment being paid to preserve its intake, campus and level in finance reports.</p>
 {enrollments.error ? <p role="alert" className="text-xs text-error">{enrollments.error}<button type="button" className="btn btn-xs" onClick={enrollments.refetch}>Retry</button></p> : null}
 </label>
 <div className="grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Amount ({currency})</span>
 <input required value={payAmount} onChange={(event) => setPayAmount(event.currentTarget.value)} type="number" min="1" step="0.01" inputMode="decimal" placeholder="25000" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Method</span>
 <select required value={payMethod} onChange={(event) => setPayMethod(event.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Choose…</option>
 {(methods.data ?? []).filter(method => method.isActive !== false).map((method) => (
 <option key={method.id} value={method.id}>
 {method.name}
 </option>
 ))}
 </select>
 </label>
 </div>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Reference</span>
 <input value={payReference} onChange={(event) => setPayReference(event.currentTarget.value)} required={methods.data?.find(method => method.id === payMethod)?.requiresReference} placeholder="Transaction reference" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 {success && <p role="status" className="alert alert-success alert-soft text-xs">{success}</p>}
 {payError ? (
 <p role="alert" className="text-xs font-medium text-error">
 {payError}
 </p>
 ) : null}
 <button type="submit" disabled={paySaving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
 {paySaving ? 'Recording…' : 'Record payment'}
 </button>
 </form>
 );
}

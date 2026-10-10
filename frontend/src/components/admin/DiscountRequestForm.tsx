import type { FormEvent } from 'react';
import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { StudentRow } from '../../lib/services';
import { createDiscount } from '../../lib/services';

export function DiscountRequestForm({ students, onRequested }: { students: StudentRow[]; onRequested: () => void }) {
 const [disStudent, setDisStudent] = useState('');
 const [disType, setDisType] = useState('FIXED');
 const [disValue, setDisValue] = useState('');
 const [disReason, setDisReason] = useState('');
 const [disError, setDisError] = useState<string | null>(null);
 const [disSaving, setDisSaving] = useState(false);
 async function handleCreateDiscount(event: FormEvent) {
 event.preventDefault();
 setDisError(null);
 setDisSaving(true);
 try {
 await createDiscount({
 studentId: disStudent,
 type: disType,
 value: Number(disValue),
 reason: disReason.trim(),
 });
 setDisValue('');
 setDisReason('');
 onRequested();
 } catch (err) {
 setDisError(apiErrorMessage(err, 'Could not create the discount.'));
 } finally {
 setDisSaving(false);
 }
 }

 return (
 <form onSubmit={handleCreateDiscount} className="space-y-3">
 <div className="grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Student</span>
 <select required value={disStudent} onChange={(event) => setDisStudent(event.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Select student</option>
 {students.map((row) => (
 <option key={row.id} value={row.id}>
 {row.user.firstName} {row.user.lastName}
 </option>
 ))}
 </select>
 </label>
 <div className="grid grid-cols-2 gap-2">
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Type</span>
 <select value={disType} onChange={(event) => setDisType(event.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="FIXED">Fixed RWF</option>
 <option value="PERCENTAGE">Percent %</option>
 </select>
 </label>
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Value</span>
 <input required value={disValue} onChange={(event) => setDisValue(event.currentTarget.value)} type="number" min="0.01" step="0.01" max={disType === 'PERCENTAGE' ? 100 : undefined} inputMode="decimal" placeholder="e.g. 5000 or 10" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 </div>
 </div>
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Reason</span>
 <input required value={disReason} onChange={(event) => setDisReason(event.currentTarget.value)} placeholder="e.g. Scholarship, hardship support" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 {disError ? (
 <p role="alert" className="text-xs font-medium text-error">
 {disError}
 </p>
 ) : null}
 <button type="submit" disabled={disSaving} className="btn btn-sm rounded-full border-0 bg-sun text-ink hover:bg-sun/90 disabled:opacity-60">
 {disSaving ? 'Submitting…' : 'Request discount'}
 </button>
 </form>
 );
}

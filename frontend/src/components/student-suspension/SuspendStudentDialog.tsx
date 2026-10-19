import { useState } from 'react';
import { FiSlash } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { QUICK_REASONS,suspendStudent } from '../../lib/student-suspension';
import { Dialog } from '../ui/overlay/Dialog';

type Props = { student: { id: string; name: string } | null; onClose: () => void; onDone: (message: string) => void };

/** Ban a student: pick or type a reason (the student sees it when they sign in), then confirm. */
export function SuspendStudentDialog({ student, onClose, onDone }: Props) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = reason.trim().length >= 5;

  async function submit() {
    if (!student || !valid) return;
    setBusy(true);
    setError(null);
    try {
      await suspendStudent(student.id, reason.trim());
      setReason('');
      onDone(`${student.name} is suspended. They will see your reason when they sign in.`);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not suspend this student.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={Boolean(student)} onClose={onClose} busy={busy} size="sm" icon={FiSlash}
      title={`Suspend ${student?.name ?? 'student'}`} subtitle="They can sign in, but only to read why."
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-ghost btn-sm rounded-full">Cancel</button>
          <button type="button" onClick={() => void submit()} disabled={!valid || busy} className="btn btn-sm ml-auto rounded-full border-0 bg-brand text-white hover:brightness-90 disabled:bg-base-300 disabled:text-muted">
            {busy ? <span className="loading loading-spinner loading-xs" /> : <FiSlash aria-hidden />} Suspend student
          </button>
        </>
      }>
      <p className="mb-2 text-xs font-semibold">Quick reasons</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_REASONS.map((text) => (
          <button key={text} type="button" onClick={() => setReason(text)}
            className={`rounded-full border px-3 py-1 text-left text-xs ${reason === text ? 'border-primary bg-primary text-primary-content' : 'border-line hover:border-primary'}`}>
            {text.split('.')[0]}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold">Reason the student will see</span>
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} maxLength={500}
          placeholder="Explain why the account is suspended and what they should do next."
          className="textarea w-full rounded-field border-line bg-base-200 text-sm" />
      </label>
      {error ? <p role="alert" className="mt-2 text-xs font-medium text-error">{error}</p> : null}
    </Dialog>
  );
}

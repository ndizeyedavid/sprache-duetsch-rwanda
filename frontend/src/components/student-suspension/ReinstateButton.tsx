import { useState } from 'react';
import { FiRotateCcw } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { reinstateStudent } from '../../lib/student-suspension';

type Props = { studentId: string; name: string; className: string; onDone: (message: string) => void; onError: (message: string) => void };

/** Lifts a suspension; asks once more on the same button so it is never a stray click. */
export function ReinstateButton({ studentId, name, className, onDone, onError }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  async function run() {
    if (!confirming) { setConfirming(true); return; }
    setBusy(true);
    try {
      await reinstateStudent(studentId);
      onDone(`${name} is active again.`);
    } catch (err) {
      onError(apiErrorMessage(err, 'Could not reinstate this student.'));
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }
  return (
    <button type="button" disabled={busy} onBlur={() => setConfirming(false)}
      onClick={(event) => { event.stopPropagation(); void run(); }} className={className}>
      {busy ? <span className="loading loading-spinner loading-xs" /> : <FiRotateCcw aria-hidden />}
      {confirming ? 'Confirm reinstate' : 'Reinstate'}
    </button>
  );
}

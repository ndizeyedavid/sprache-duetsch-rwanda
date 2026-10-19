import { useState } from 'react';
import { FiSlash } from 'react-icons/fi';
import { heroGhost } from '../hero/hero-actions';
import { ReinstateButton } from './ReinstateButton';
import { SuspendStudentDialog } from './SuspendStudentDialog';

type Props = { student: { id: string; name: string; suspended: boolean }; onChanged: () => void };

/** Suspend / Reinstate as a hero pill on a student record, plus the dialog and the outcome line. */
export function useRecordSuspension({ student, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const done = (text: string) => { setOpen(false); setMessage({ tone: 'ok', text }); onChanged(); };
  const action = student.suspended ? (
    <ReinstateButton studentId={student.id} name={student.name} className={heroGhost} onDone={done} onError={(text) => setMessage({ tone: 'error', text })} />
  ) : (
    <button type="button" className={heroGhost} onClick={() => { setMessage(null); setOpen(true); }}><FiSlash aria-hidden /> Suspend</button>
  );
  const extras = (
    <>
      {message ? <p role="status" className={`text-xs font-medium ${message.tone === 'error' ? 'text-error' : 'text-primary'}`}>{message.text}</p> : null}
      <SuspendStudentDialog student={open ? student : null} onClose={() => setOpen(false)} onDone={done} />
    </>
  );
  return { action, extras };
}

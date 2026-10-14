import { FiSlash } from 'react-icons/fi';

/** Shown to teachers and students on a cancelled class. */
export function CancelReasonNote({ status, reason }: { status: string; reason?: string | null }) {
  if (status !== 'CANCELLED') return null;
  return (
    <div role="note" className="alert alert-warning alert-soft items-start text-xs">
      <FiSlash aria-hidden className="mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold">This class was cancelled</p>
        <p className="mt-0.5 whitespace-pre-wrap">{reason ? `Reason: ${reason}` : 'No reason was given.'}</p>
      </div>
    </div>
  );
}

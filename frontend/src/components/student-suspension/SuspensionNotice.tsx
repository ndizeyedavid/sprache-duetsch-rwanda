import { FiSlash } from 'react-icons/fi';

type Props = { reason?: string | null; since?: string | null };

const day = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null);

/** Staff-side banner on a suspended student's record: the reason they were given. */
export function SuspensionNotice({ reason, since }: Props) {
  return (
    <div role="status" className="flex items-start gap-3 rounded-box border border-error bg-base-100 p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-error text-error-content"><FiSlash aria-hidden /></span>
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-error">Suspended{day(since) ? ` since ${day(since)}` : ''}</p>
        <p className="mt-0.5 text-muted">{reason || 'No reason recorded.'}</p>
      </div>
    </div>
  );
}

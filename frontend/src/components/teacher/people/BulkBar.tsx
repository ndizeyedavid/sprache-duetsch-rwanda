import { FiMail,FiX } from 'react-icons/fi';

type Props = { count: number; sending: boolean; error: string | null; onMessage: () => void; onClear: () => void };

/** Appears once learners are selected: message them together or clear the selection. */
export function BulkBar({ count, sending, error, onMessage, onClear }: Props) {
  if (!count && !error) return null;
  return (
    <div className="hero-band sticky bottom-20 z-20 flex flex-wrap items-center gap-3 rounded-box px-4 py-3 lg:bottom-4" role="region" aria-label="Selected students">
      <span className="text-sm font-semibold">{count} selected</span>
      {error ? <span role="alert" className="text-xs font-semibold">{error}</span> : null}
      <div className="ml-auto flex gap-2">
        <button type="button" onClick={onMessage} disabled={sending || !count} className="btn btn-sm gap-1 rounded-full border-0 bg-base-100 text-primary hover:bg-base-100">
          <FiMail aria-hidden />{sending ? 'Opening…' : `Message ${count}`}
        </button>
        <button type="button" onClick={onClear} className="btn btn-ghost btn-sm btn-circle text-primary-content" aria-label="Clear selection"><FiX aria-hidden /></button>
      </div>
    </div>
  );
}

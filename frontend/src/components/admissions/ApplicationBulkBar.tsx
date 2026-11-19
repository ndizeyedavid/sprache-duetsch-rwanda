import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import type { ApplicationStatus } from '../../lib/admissions-types';

type Props = { count: number; busy: boolean; onApply: (status: ApplicationStatus, reason?: string) => void; onClear: () => void };

/**
 * The same decision for every ticked application: start reviewing a batch, or withdraw/reject (a note is
 * required, as for one application). Applications that cannot take the step are skipped and listed.
 */
export function ApplicationBulkBar({ count, busy, onApply, onClear }: Props) {
  const [reason, setReason] = useState('');
  if (!count) return null;
  const noted = reason.trim().length > 0;
  return (
    <div role="region" aria-label="Selected applications" className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-box border border-primary bg-base-100 p-3 shadow-sm">
      <span className="text-sm font-semibold">{count} selected</span>
      <button type="button" disabled={busy} onClick={() => onApply('REVIEWING')} className="btn btn-sm rounded-full border-line bg-base-200 text-xs">Start review</button>
      <input value={reason} onChange={(event) => setReason(event.currentTarget.value)} maxLength={500} aria-label="Note for withdraw or reject"
        placeholder="Note (needed to withdraw or reject), e.g. duplicate of APP-2026-0008" className="input input-sm min-w-0 flex-1 rounded-full border-line bg-base-200 text-xs sm:max-w-sm" />
      <button type="button" disabled={busy || !noted} onClick={() => onApply('WITHDRAWN', reason.trim())} className="btn btn-sm rounded-full border-line bg-base-200 text-xs">Withdraw</button>
      <button type="button" disabled={busy || !noted} onClick={() => onApply('REJECTED', reason.trim())} className="btn btn-outline btn-error btn-sm rounded-full text-xs">Reject</button>
      {busy ? <span className="loading loading-spinner loading-xs" /> : null}
      <button type="button" onClick={onClear} className="btn btn-ghost btn-sm gap-1 rounded-full text-xs"><FiX aria-hidden />Clear</button>
    </div>
  );
}

import { FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { longDate } from './format';

/** Top band: the one thing a verifier needs to see first. */
export function VerifyStatus({ valid, revokedAt }: { valid: boolean; revokedAt: string | null }) {
  return valid ? (
    <div className="flex items-center gap-3 bg-success text-success-content px-6 py-4 sm:px-10">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success text-white"><FiCheck aria-hidden className="text-lg" /></span>
      <div>
        <p className="font-semibold text-success">Verified certificate</p>
        <p className="text-xs text-muted">Issued and confirmed by Deutsch Sprache RW.</p>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-3 bg-error text-error-content px-6 py-4 sm:px-10">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-error text-white"><FiAlertTriangle aria-hidden /></span>
      <div>
        <p className="font-semibold text-error">This certificate is no longer valid</p>
        <p className="text-xs text-muted">It was withdrawn by the school{revokedAt ? ` on ${longDate(revokedAt)}` : ''}.</p>
      </div>
    </div>
  );
}

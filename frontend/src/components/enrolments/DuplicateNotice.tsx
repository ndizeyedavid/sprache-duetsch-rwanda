import { FiAlertTriangle } from 'react-icons/fi';
import type { EnrollmentRow } from '../../lib/services';
import { humanize } from '../../lib/services';

/** Pre-submit guard for the duplicate the API rejects with 409. */
export function DuplicateNotice({ duplicate }: { duplicate: EnrollmentRow }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-field bg-sun text-warning-content px-3 py-2 text-[11px] font-medium text-[#8A6800]"
    >
      <FiAlertTriangle aria-hidden className="mt-0.5 shrink-0" />
      <span>
        Already enrolled in {duplicate.level.code} · {duplicate.intake.name} (
        {humanize(duplicate.status)}). Pick a different level or intake.
      </span>
    </p>
  );
}
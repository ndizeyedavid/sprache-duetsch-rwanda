import { FiLock,FiSlash,FiUnlock,FiXCircle } from 'react-icons/fi';
import { rwf } from '../../lib/format';
import type { EnrollmentRow } from '../../lib/services';
import { money } from '../../lib/services';
import { ACCESS_LABEL } from './constants';

const STYLE: Record<string, string> = {
  OPEN: 'bg-ok-soft text-ok',
  UNPAID: 'bg-[#FFF1E0] text-[#9A4A00]',
  SUSPENDED: 'bg-bad-soft text-bad',
  CLOSED: 'bg-base-200 text-muted',
};
const ICON = { OPEN: FiUnlock, UNPAID: FiLock, SUSPENDED: FiSlash, CLOSED: FiXCircle } as const;

/** Whether the student can open the course right now; finance roles also see what is still owed. */
export function AccessBadge({ row }: { row: EnrollmentRow }) {
  if (!row.access) return <span className="text-muted">—</span>;
  const Icon = ICON[row.access];
  const owed = row.tuition ? money(row.tuition.outstanding) : 0;
  return (
    <span className="inline-flex flex-col gap-0.5">
      <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${STYLE[row.access]}`}>
        <Icon aria-hidden />{ACCESS_LABEL[row.access]}
      </span>
      {row.tuition && owed > 0 ? <span className="text-[0.6875rem] text-muted">{rwf(owed)} owed{row.tuition.overdue ? ' · overdue' : ''}</span> : null}
    </span>
  );
}

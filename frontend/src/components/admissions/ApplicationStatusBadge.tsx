import type { ApplicationStatus } from '../../lib/admissions-types';
import { TONE_SURFACE } from '../../lib/status';
import { STATUS_LABEL,STATUS_TONE } from './constants';

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${TONE_SURFACE[STATUS_TONE[status]]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

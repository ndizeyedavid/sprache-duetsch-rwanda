import { FiMapPin,FiMonitor,FiUser,FiUsers } from 'react-icons/fi';
import { teacherName } from '../../../lib/sessions-ui';
import { modeText } from './status';

type Props = { classGroup: { name: string } | null; teacher: { firstName: string; lastName: string } | null; mode: string; provider: string | null; room: string | null };

/** Who and where, as a tidy two-column fact list. */
export function SessionFacts({ classGroup, teacher, mode, provider, room }: Props) {
  const rows = [
    { icon: FiUsers, label: 'Class', value: classGroup?.name ?? '—' },
    { icon: FiUser, label: 'Teacher', value: teacherName(teacher) },
    { icon: FiMonitor, label: 'Format', value: modeText(mode, provider) },
    ...(room ? [{ icon: FiMapPin, label: 'Room', value: room }] : []),
  ];
  return (
    <dl className="grid grid-cols-2 gap-2">
      {rows.map(({ icon: Icon, label, value }) => (
        <div key={label} className="min-w-0 rounded-box bg-base-200 px-3 py-2.5">
          <dt className="flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-wider text-muted"><Icon aria-hidden />{label}</dt>
          <dd className="mt-0.5 truncate text-sm font-medium" title={value}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

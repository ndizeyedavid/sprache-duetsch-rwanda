import type { RosterStudent } from './roster-data';
import { RosterRow } from './RosterRow';

type Props = {
  rows: RosterStudent[]; selected: Set<string>; threshold: number | null; classGroupId: string;
  onToggle: (userId: string) => void; onToggleAll: () => void; onMessage: (userIds: string[]) => void;
};

const HEAD = 'text-[0.625rem] font-semibold uppercase tracking-wider text-muted';

/** The class roster with a desktop header row; rows reflow into cards on phones. */
export function RosterTable({ rows, selected, threshold, classGroupId, onToggle, onToggleAll, onMessage }: Props) {
  const all = selected.size === rows.length && rows.length > 0;
  return (
    <div className="overflow-hidden rounded-box border border-line bg-base-100">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-line bg-base-200 px-4 py-2.5 lg:grid-cols-[auto_minmax(0,2.2fr)_7rem_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1.6fr)_auto]">
        <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={all} onChange={onToggleAll} aria-label="Select all students" />
        <span className={HEAD}>Student</span>
        <span className={`${HEAD} hidden lg:block`}>Status</span>
        <span className={`${HEAD} hidden lg:block`}>Attendance</span>
        <span className={`${HEAD} hidden lg:block`}>Score</span>
        <span className={`${HEAD} hidden lg:block`}>Support</span>
        <span className={`${HEAD} hidden w-[6.5rem] lg:block`}>Actions</span>
      </div>
      <ul>
        {rows.map((row) => (
          <RosterRow key={row.studentId} row={row} checked={selected.has(row.userId)} threshold={threshold} classGroupId={classGroupId}
            onToggle={() => onToggle(row.userId)} onMessage={() => onMessage([row.userId])} />
        ))}
      </ul>
    </div>
  );
}

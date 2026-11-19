import { useState } from 'react';
import { FiDownload,FiUsers,FiX } from 'react-icons/fi';
import type { ClassGroupItem,EnrollmentRow } from '../../lib/services';
import { classOptionLabel } from './utils';

type Props = {
  rows: EnrollmentRow[];
  groups: ClassGroupItem[];
  busy: boolean;
  onAssign: (classGroupId: string | null) => void;
  onExport: () => void;
  onClear: () => void;
};

/** What differs between the selected enrolments, so a class can't fit them all ("2 campuses: Kacyiru, Near Norrsken"). */
function mismatch(rows: EnrollmentRow[]): string | null {
  const parts = [
    ['level', rows.map((row) => row.level.code)],
    ['intake', rows.map((row) => row.intake.name)],
    ['campus', rows.map((row) => row.campus?.name ?? 'no campus')],
  ] as const;
  for (const [label, values] of parts) {
    const unique = [...new Set(values)];
    if (unique.length > 1) return `different ${label === 'campus' ? 'campuses' : `${label}s`} (${unique.join(', ')})`;
  }
  return null;
}

/** Classes every selected enrolment can join: same level, intake and campus (the API checks it too). */
function sharedClasses(rows: EnrollmentRow[], groups: ClassGroupItem[]): ClassGroupItem[] | null {
  const first = rows[0];
  if (!first) return [];
  if (mismatch(rows)) return null;
  return groups.filter((group) => group.isActive && group.levelId === first.level.id && group.intakeId === first.intake.id
    && (!first.campus || group.campusId === first.campus.id));
}

/** Actions for the ticked enrolments: place them in a class, take them out, or export them. */
export function EnrolmentBulkBar({ rows, groups, busy, onAssign, onExport, onClear }: Props) {
  const [classGroupId, setClassGroupId] = useState('');
  if (!rows.length) return null;
  const classes = sharedClasses(rows, groups);
  const valid = classes?.some((group) => group.id === classGroupId) ?? false;
  return (
    <div role="region" aria-label="Selected enrolments" className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-box border border-primary bg-base-100 p-3 shadow-sm">
      <span className="flex items-center gap-2 text-sm font-semibold"><FiUsers aria-hidden />{rows.length} selected</span>
      {classes === null ? (
        <span className="text-xs text-muted">One class can't fit them: the selected students are in {mismatch(rows)}.</span>
      ) : classes.length === 0 ? (
        <span className="text-xs text-muted">No active class for {rows[0]?.level.code} · {rows[0]?.intake.name}{rows[0]?.campus ? ` at ${rows[0].campus.name}` : ''} yet. Create one under Classes.</span>
      ) : (
        <>
          <select aria-label="Class for the selected students" value={valid ? classGroupId : ''} onChange={(event) => setClassGroupId(event.currentTarget.value)}
            className="select select-sm min-w-0 max-w-xs rounded-full border-line bg-base-100 text-xs">
            <option value="">Choose a class…</option>
            {classes.map((group) => <option key={group.id} value={group.id}>{classOptionLabel(group)}</option>)}
          </select>
          <button type="button" disabled={busy || !valid} onClick={() => onAssign(classGroupId)} className="btn btn-primary btn-sm rounded-full text-xs">
            {busy ? <span className="loading loading-spinner loading-xs" /> : null}Assign to class
          </button>
        </>
      )}
      {rows.some((row) => row.classGroup) ? (
        <button type="button" disabled={busy} onClick={() => onAssign(null)} className="btn btn-ghost btn-sm rounded-full text-xs">Remove from class</button>
      ) : null}
      <button type="button" onClick={onExport} className="btn btn-ghost btn-sm gap-1 rounded-full text-xs"><FiDownload aria-hidden />Export selected</button>
      <button type="button" onClick={onClear} className="btn btn-ghost btn-sm gap-1 rounded-full text-xs"><FiX aria-hidden />Clear</button>
    </div>
  );
}

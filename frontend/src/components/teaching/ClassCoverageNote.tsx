import { CORAL_BADGE,SUN_BADGE } from './constants';

type ClassCoverageNoteProps = {
  blocked: boolean;
  unapprovedCurrent: boolean;
  eligibleCount: number;
  active: boolean;
};

/** The one thing wrong with this row, in words — never signalled by colour alone. */
export function ClassCoverageNote({
  blocked,
  unapprovedCurrent,
  eligibleCount,
  active,
}: ClassCoverageNoteProps) {
  if (!active) {
    return (
      <span className="mt-2 inline-flex rounded-full bg-base-200 px-2.5 py-1 text-[11px] font-medium text-muted">
        Inactive class · assignments kept for history
      </span>
    );
  }

  if (unapprovedCurrent) {
    return (
      <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${SUN_BADGE}`}>
        Current teacher is not approved for {`this level`} — approve it in step 1 or pick someone else
      </span>
    );
  }

  if (blocked) {
    return (
      <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${CORAL_BADGE}`}>
        No active teacher is approved for {`this level`} — approve one in step 1 first
      </span>
    );
  }

  return (
    <span className="mt-2 inline-flex rounded-full bg-base-200 px-2.5 py-1 text-[11px] font-medium text-muted">
      {eligibleCount} active {eligibleCount === 1 ? 'teacher' : 'teachers'} approved for this level
    </span>
  );
}
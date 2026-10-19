import type { StudentRow } from '../../lib/services';

type Props = { rows: StudentRow[] | null; academic: boolean };

/** Register counts as white chips for the Students page hero (placement gaps only for academic staff). */
export function StudentRegisterSummary({ rows, academic }: Props) {
  if (!rows) return null;
  const count = (status: string) => rows.filter((row) => row.status === status).length;
  const unplaced = rows.filter((row) => row.currentLevel === null).length;
  return (
    <>
      <span className="hero-chip">{rows.length} learner{rows.length === 1 ? '' : 's'}</span>
      <span className="hero-chip">{count('ACTIVE')} active</span>
      <span className="hero-chip">{count('PENDING')} pending</span>
      {academic && unplaced ? <span className="hero-chip hero-chip-solid">{unplaced} without a level</span> : null}
    </>
  );
}

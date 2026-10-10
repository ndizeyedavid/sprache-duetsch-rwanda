import type { StudentRow } from '../../lib/services';
import { AcademicSummary } from './AcademicSummary';

export function StudentRegisterSummary({ rows }: { rows: StudentRow[] | null }) {
  if (!rows) return null;
  return <AcademicSummary items={[
    { label: 'Learners in register', value: rows.length, note: 'Loaded student profiles' },
    { label: 'Active learners', value: rows.filter(r => r.status === 'ACTIVE').length, note: 'Currently active accounts' },
    { label: 'Level assigned', value: rows.filter(r => r.currentLevel !== null).length, note: 'Profiles with a current level' },
    { label: 'Pending learners', value: rows.filter(r => r.status === 'PENDING').length, note: 'Awaiting activation' },
  ]} />;
}

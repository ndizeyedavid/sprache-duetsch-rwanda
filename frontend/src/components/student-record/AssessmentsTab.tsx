import { useApi } from '../../hooks/useApi';
import { getStudentSkills } from '../../lib/services/get-student-skills';
import { listStudentAttempts } from '../../lib/services/list-student-attempts';
import { money } from '../../lib/services/money';
import { StatTile } from '../ui/StatTile';
import { AttemptsTable } from './AttemptsTable';
import { SkillBreakdown } from './SkillBreakdown';

export function AssessmentsTab({ studentId }: { studentId: string }) {
  const attempts = useApi(`student-attempts-${studentId}`, () => listStudentAttempts(studentId));
  const skills = useApi(`student-skills-${studentId}`, () => getStudentSkills(studentId));

  const graded = (attempts.data ?? []).filter((row) => row.score !== null && money(row.maxScore) > 0);
  const average = graded.length
    ? Math.round(graded.reduce((sum, row) => sum + money(row.score) / money(row.maxScore), 0) / graded.length * 100)
    : null;
  const decided = graded.filter((row) => row.passed !== null);
  const passRate = decided.length ? Math.round((decided.filter((row) => row.passed).length / decided.length) * 100) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Attempts" value={String(attempts.data?.length ?? '—')} />
        <StatTile label="Average score" value={average === null ? '—' : `${average}%`} tone={average !== null && average < 60 ? 'coral' : 'brand'} />
        <StatTile label="Pass rate" value={passRate === null ? '—' : `${passRate}%`} />
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><AttemptsTable attempts={attempts} /></div>
        <SkillBreakdown skills={skills} />
      </div>
    </div>
  );
}

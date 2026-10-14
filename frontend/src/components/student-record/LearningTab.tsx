import type { ApiState } from '../../hooks/useApi';
import type { MyProgressLevel } from '../../lib/services/my-progress-level';
import type { StudentDetail } from '../../lib/services/student-detail';
import { EnrolmentList } from './EnrolmentList';
import { ProgressPanel } from './ProgressPanel';
import { SubmissionsPanel } from './SubmissionsPanel';

type Props = {
  student: StudentDetail;
  progress: ApiState<{ levels: MyProgressLevel[]; overallPercentage: number }>;
};

export function LearningTab({ student, progress }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid items-start gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ProgressPanel
            levels={progress.data?.levels ?? []}
            loading={progress.loading}
            error={progress.error}
            onRetry={progress.refetch}
          />
        </div>
        <div className="lg:col-span-2"><EnrolmentList enrollments={student.enrollments} /></div>
      </div>
      <SubmissionsPanel studentId={student.id} />
    </div>
  );
}

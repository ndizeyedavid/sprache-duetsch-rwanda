import { FiBookmark,FiUser,FiUsers } from 'react-icons/fi';
import type { StudentDetail } from '../../lib/services/student-detail';
import type { RecordAccess,RecordTab } from './constants';
import { DetailCard } from './DetailCard';
import { EnrolmentList } from './EnrolmentList';
import { RecordStatStrip } from './RecordStatStrip';
import { RecordTimeline } from './RecordTimeline';
import { TuitionSnapshot } from './TuitionSnapshot';
import { academicRows,guardianRows,personalRows } from './utils';

type Props = {
  student: StudentDetail;
  access: RecordAccess;
  progress: number | null;
  onOpen: (tab: RecordTab) => void;
};

const OVERVIEW_ENROLMENTS = 3;

export function OverviewTab({ student, access, progress, onOpen }: Props) {
  const more = student.enrollments.length > OVERVIEW_ENROLMENTS;
  return (
    <div className="space-y-4">
      {access.academic ? <RecordStatStrip student={student} progress={progress} /> : null}
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <EnrolmentList
            enrollments={student.enrollments}
            limit={OVERVIEW_ENROLMENTS}
            action={access.academic ? { label: more ? `View all ${student.enrollments.length}` : 'View progress', onClick: () => onOpen('learning') } : undefined}
          />
          <RecordTimeline student={student} />
        </div>
        <div className="space-y-4">
          {access.finance ? <TuitionSnapshot finance={student.finance} onOpen={() => onOpen('payments')} /> : null}
          <DetailCard title="Personal & contact" icon={FiUser} rows={personalRows(student)} />
          <DetailCard title="Study profile" icon={FiBookmark} rows={academicRows(student)} />
          <DetailCard title="Guardian" icon={FiUsers} rows={guardianRows(student)} />
        </div>
      </div>
    </div>
  );
}

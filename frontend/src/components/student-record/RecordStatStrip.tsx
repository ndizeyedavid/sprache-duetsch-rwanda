import { FiAward,FiBookOpen,FiCheckCircle,FiEdit3 } from 'react-icons/fi';
import type { StudentDetail } from '../../lib/services/student-detail';
import { ATTENDANCE_TARGET } from '../profile/constants';
import { StatTile } from '../ui/StatTile';

type Props = { student: StudentDetail; progress: number | null };

/** StatTile's `delta` is brand red; these are neutral captions, so they go in as muted children. */
function Hint({ children }: { children: string }) {
  return <p className="-mt-2 text-xs text-muted">{children}</p>;
}

/** Four academic headline numbers; each one opens the tab that explains it. */
export function RecordStatStrip({ student, progress }: Props) {
  const { attendance } = student;
  const valid = student.certificates.filter((row) => row.status !== 'REVOKED').length;
  const lowAttendance = attendance.total > 0 && attendance.percentage < ATTENDANCE_TARGET;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        label="Attendance"
        value={attendance.total ? `${attendance.percentage}%` : '—'}
        tone={lowAttendance ? 'coral' : 'brand'}
        icon={FiCheckCircle}
      >
        <Hint>{attendance.total ? `${attendance.present + attendance.late} of ${attendance.total} sessions attended` : 'No sessions marked yet'}</Hint>
      </StatTile>
      <StatTile
        label="Course progress"
        value={progress === null ? '—' : `${progress}%`}
        icon={FiBookOpen}
      >
        <Hint>Published lessons completed</Hint>
      </StatTile>
      <StatTile label="Assessment attempts" value={String(student.attemptsCount)} icon={FiEdit3}><Hint>Quizzes, tests &amp; exams</Hint></StatTile>
      <StatTile label="Certificates" value={String(valid)} icon={FiAward}><Hint>{valid === 1 ? 'Valid certificate' : 'Valid certificates'}</Hint></StatTile>
    </div>
  );
}

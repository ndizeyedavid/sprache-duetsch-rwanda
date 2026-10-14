import { useCallback } from 'react';
import { useParams,useSearchParams } from 'react-router-dom';
import { ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { AssessmentsTab } from '../../components/student-record/AssessmentsTab';
import { AttendanceTab } from '../../components/student-record/AttendanceTab';
import { CertificatesTab } from '../../components/student-record/CertificatesTab';
import type { RecordAccess,RecordTab } from '../../components/student-record/constants';
import { DEFAULT_TAB } from '../../components/student-record/constants';
import { LearningTab } from '../../components/student-record/LearningTab';
import { OverviewTab } from '../../components/student-record/OverviewTab';
import { PaymentsTab } from '../../components/student-record/PaymentsTab';
import { RecordTabs } from '../../components/student-record/RecordTabs';
import { StudentRecordHeader } from '../../components/student-record/StudentRecordHeader';
import { resolveTab } from '../../components/student-record/utils';
import { useApi } from '../../hooks/useApi';
import { isAdmin,isFinance } from '../../lib/roles';
import { getStudent } from '../../lib/services/get-student';
import { getStudentProgress } from '../../lib/services/get-student-progress';
import { useSession } from '../../lib/session';

/** One student's full record for admins: academic tabs for Academic/Super, money for Finance/Super. */
export function AdminStudentDetail() {
  const { studentId = '' } = useParams();
  const { user } = useSession();
  const access: RecordAccess = { academic: Boolean(user && isAdmin(user.role)), finance: Boolean(user && isFinance(user.role)) };
  const [params, setParams] = useSearchParams();
  const tab = resolveTab(params.get('tab'), access);

  const student = useApi(`student-record-${studentId}`, () => getStudent(studentId), Boolean(studentId));
  const wantsProgress = access.academic && (tab === 'overview' || tab === 'learning');
  const progress = useApi(`student-progress-${studentId}`, () => getStudentProgress(studentId), wantsProgress);

  const openTab = useCallback(
    (next: RecordTab) => setParams(next === DEFAULT_TAB ? {} : { tab: next }, { replace: true }),
    [setParams],
  );

  if (student.loading) return <LoadingBlock label="Loading student record…" />;
  if (student.error || !student.data) {
    return <ErrorBlock message={student.error ?? 'Could not load this student.'} onRetry={student.refetch} />;
  }

  const data = student.data;
  const counts: Partial<Record<RecordTab, number>> = {
    learning: data.enrollments.length,
    assessments: data.attemptsCount,
    attendance: data.attendance.total,
    certificates: data.certificates.length,
  };

  return (
    <div className="space-y-4">
      <StudentRecordHeader student={data} />
      <RecordTabs active={tab} access={access} onChange={openTab} counts={counts} />
      <div id={`record-panel-${tab}`} role="tabpanel" aria-labelledby={`record-tab-${tab}`}>
        {tab === 'overview' ? (
          <OverviewTab student={data} access={access} progress={progress.data?.overallPercentage ?? null} onOpen={openTab} />
        ) : null}
        {tab === 'learning' ? <LearningTab student={data} progress={progress} /> : null}
        {tab === 'assessments' ? <AssessmentsTab studentId={data.id} /> : null}
        {tab === 'attendance' ? <AttendanceTab studentId={data.id} summary={data.attendance} /> : null}
        {tab === 'certificates' ? <CertificatesTab studentId={data.id} /> : null}
        {tab === 'payments' ? <PaymentsTab studentId={data.id} finance={data.finance} /> : null}
      </div>
    </div>
  );
}

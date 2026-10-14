import type { CertificateEligibility as Eligibility } from '../../lib/services';

export function CertificateEligibility({ value }: { value: Eligibility }) {
  return <div className="rounded-box border border-base-300 p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">Completion check</h3><span className={`badge badge-sm ${value.eligible ? 'badge-success badge-soft' : 'badge-warning badge-soft'}`}>{value.eligible ? 'Ready to issue' : 'Requirements remaining'}</span></div>
    <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
      <div><dt className="text-muted">Lessons</dt><dd className="mt-1 font-medium">{value.lessonsCompleted} / {value.lessonsTotal}</dd></div>
      <div><dt className="text-muted">Final exams</dt><dd className="mt-1 font-medium">{value.finalExamPassed === null ? 'Not required' : value.finalExamPassed ? 'Passed' : 'Not yet passed'}</dd></div>
      {value.rules.minimumAttendance > 0 && <div><dt className="text-muted">Attendance</dt><dd className="mt-1 font-medium">{Math.round(value.attendancePercentage)}% / {value.rules.minimumAttendance}% required</dd></div>}
      {value.rules.requireHomework && <div><dt className="text-muted">Homework</dt><dd className="mt-1 font-medium">{value.homeworkPassed ? 'Passed' : 'Not yet passed'}</dd></div>}
    </dl>
    {value.reasons.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-muted">{value.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>}
  </div>;
}

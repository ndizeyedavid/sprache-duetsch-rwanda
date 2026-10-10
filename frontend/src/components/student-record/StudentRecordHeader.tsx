import { FiArrowLeft,FiMail,FiPhone } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { profilePhotoUrl } from '../../lib/profile-photo';
import { humanize } from '../../lib/services/humanize';
import type { StudentDetail } from '../../lib/services/student-detail';
import { initials } from '../profile/utils';
import { StatusBadge } from '../ui/StatusBadge';
import { currentEnrolment,fullName,shortDate } from './utils';

type Props = { student: StudentDetail };

/** Who this is and where they study, readable in one glance before any tab is opened. */
export function StudentRecordHeader({ student }: Props) {
  const { user, currentLevel } = student;
  const name = fullName(user);
  const enrolment = currentEnrolment(student);
  const facts = [
    { label: 'Level', value: currentLevel ? `${currentLevel.code} · ${currentLevel.title}` : 'Not placed yet' },
    { label: 'Class', value: enrolment?.classGroup?.name ?? 'No class yet' },
    { label: 'Campus', value: student.campus?.name ?? '—' },
    { label: 'Intake', value: student.intake?.name ?? '—' },
    { label: 'Shift', value: humanize(student.shift) },
  ];

  return (
    <div className="space-y-3">
      <Link to="/admin/students" className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink">
        <FiArrowLeft aria-hidden />All students
      </Link>
      <section className="card overflow-hidden border border-line bg-base-100">
        <div className="flex flex-wrap items-center gap-4 bg-brand p-5 text-white sm:gap-5 sm:p-6">
          <div className={`avatar ${user.avatarUrl ? '' : 'avatar-placeholder'}`}>
            <div className="size-16 rounded-box bg-white text-brand sm:size-20">
              {user.avatarUrl ? (
                <img src={profilePhotoUrl(user.avatarUrl)} alt={`${name} profile photo`} width={80} height={80} className="size-full object-cover" />
              ) : (
                <span className="text-xl font-bold sm:text-2xl">{initials(user.firstName, user.lastName)}</span>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs text-base-200">{student.studentCode}</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={humanize(student.status)} className="px-3 py-1" />
              {currentLevel ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand">{currentLevel.code}</span>
              ) : null}
              <span className="text-xs text-base-200">Student since {shortDate(student.createdAt)}</span>
            </div>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <a href={`mailto:${user.email}`} className="btn btn-sm gap-2 rounded-full border-0 bg-white text-brand">
              <FiMail aria-hidden />Email
            </a>
            {user.phone ? (
              <a href={`tel:${user.phone}`} className="btn btn-sm gap-2 rounded-full border border-white bg-transparent text-white">
                <FiPhone aria-hidden />Call
              </a>
            ) : null}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">{fact.label}</dt>
              <dd className="mt-0.5 truncate text-sm font-medium" title={fact.value}>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

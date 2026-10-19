import type { ReactNode } from 'react';
import { FiArrowLeft,FiMail,FiPhone,FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { profilePhotoUrl } from '../../lib/profile-photo';
import { humanize } from '../../lib/services/humanize';
import type { StudentDetail } from '../../lib/services/student-detail';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';
import { initials } from '../profile/utils';
import { currentEnrolment,fullName,shortDate } from './utils';

type Props = { student: StudentDetail | null; /** Extra hero pills (e.g. Suspend for academic staff). */ extraActions?: ReactNode };

const back = (
  <Link to="/admin/students" className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink">
    <FiArrowLeft aria-hidden />All students
  </Link>
);

/**
 * Who this is and where they study, readable in one glance before any tab is opened.
 * Renders a placeholder band while the record loads (or fails) so the page never jumps.
 */
export function StudentRecordHeader({ student, extraActions }: Props) {
  if (!student) {
    return (
      <div className="space-y-3">
        {back}
        <PageHero eyebrow="Student record" icon={FiUser} title="Student record" art="grades"
          description="Progress, attendance, certificates and payments for one learner." />
      </div>
    );
  }

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

  const avatar = (
    <span className="inline-flex shrink-0">
      <span className="flex size-14 items-center justify-center overflow-hidden rounded-box bg-base-100 text-primary sm:size-16">
        {user.avatarUrl ? (
          <img src={profilePhotoUrl(user.avatarUrl)} alt="" width={64} height={64} className="size-full object-cover" />
        ) : (
          <span className="text-lg font-bold sm:text-xl">{initials(user.firstName, user.lastName)}</span>
        )}
      </span>
    </span>
  );

  return (
    <div className="space-y-3">
      {back}
      <PageHero
        eyebrow={`Student record · ${student.studentCode}`}
        icon={FiUser}
        title={<span className="flex items-center gap-3 sm:gap-4">{avatar}<span className="min-w-0 break-words">{name}</span></span>}
        art="grades"
        meta={
          <>
            <span className="hero-chip hero-chip-solid">{humanize(student.status)}</span>
            {currentLevel ? <span className="hero-chip">{currentLevel.code}</span> : null}
            <span className="hero-chip">Student since {shortDate(student.createdAt)}</span>
          </>
        }
        actions={
          <>
            <a href={`mailto:${user.email}`} className={heroAction}>
              <FiMail aria-hidden />Email
            </a>
            {user.phone ? (
              <a href={`tel:${user.phone}`} className={heroGhost}>
                <FiPhone aria-hidden />Call
              </a>
            ) : null}
            {extraActions}
          </>
        }
        footer={
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
            {facts.map((fact) => (
              <div key={fact.label} className="min-w-0">
                <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">{fact.label}</dt>
                <dd className="mt-0.5 truncate text-sm font-medium" title={fact.value}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        }
      />
    </div>
  );
}

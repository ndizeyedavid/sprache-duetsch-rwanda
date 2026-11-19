import { formatDistanceToNowStrict } from 'date-fns';
import { FiAlertTriangle,FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { ApplicationMatches } from '../../lib/admissions-types';
import { STATUS_LABEL } from './constants';

type Student = ApplicationMatches['students'][number];

const studies = (student: Student): string =>
  student.enrollments.length ? student.enrollments.map((row) => `${row.level} · ${row.intake} (${row.status.toLowerCase()})`).join(', ') : 'not enrolled';
const seen = (student: Student): string =>
  student.lastLoginAt ? `signed in ${formatDistanceToNowStrict(new Date(student.lastLoginAt))} ago` : 'never signed in';

type Props = { matches: ApplicationMatches | null | undefined; onOpenApplication: (id: string) => void };

/**
 * The applicant's own account (the website makes one per email), student records that look like the same
 * person, and their other applications — so staff enrol one person once, not twice under two emails.
 */
export function ApplicationMatchesPanel({ matches, onOpenApplication }: Props) {
  if (!matches) return null;
  const own = matches.students.find((student) => student.own);
  const others = matches.students.filter((student) => !student.own);
  return (
    <section className="rounded-box border border-line bg-base-100 p-4 text-xs">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><FiUser aria-hidden />Student account</h3>
      {own ? (
        <p className="mt-2">
          <Link to={`/admin/students/${own.id}`} className="font-semibold text-brand hover:underline">{own.studentCode}</Link>
          {' '}· {seen(own)} · {studies(own)}
          <span className="block text-muted">Made by the website form for {own.email}.</span>
        </p>
      ) : <p className="mt-2 text-muted">No account for this email yet. Enrolling creates one and emails a link to set a password.</p>}

      {others.length ? (
        <div className="mt-3 rounded-field bg-bad-soft p-3">
          <p className="flex items-center gap-2 font-semibold text-bad"><FiAlertTriangle aria-hidden />Possibly the same person</p>
          <ul className="mt-2 space-y-1.5">
            {others.map((student) => (
              <li key={student.id}>
                <Link to={`/admin/students/${student.id}`} className="font-semibold text-ink hover:underline">{student.studentCode} · {student.name}</Link>
                <span className="block text-muted">{student.email} · same {student.via.join(', ')} · {studies(student)} · {seen(student)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-muted">If it is the same person, choose that student under “Enrol” so they keep one account.</p>
        </div>
      ) : null}

      {matches.applications.length ? (
        <div className="mt-3">
          <p className="font-semibold">Other applications from this person</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {matches.applications.map((row) => (
              <li key={row.id}>
                <button type="button" onClick={() => onOpenApplication(row.id)} className="btn btn-xs rounded-full border-line bg-base-200">
                  {row.reference} · {STATUS_LABEL[row.status]} · same {row.via.join(', ')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

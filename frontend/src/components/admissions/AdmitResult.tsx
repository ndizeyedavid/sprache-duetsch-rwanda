import { FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { AdmitResult as Result,ApplicationDetail } from '../../lib/admissions-types';

/** What enrolling did: which student, a new account's password link, and a website account left unused. */
export function AdmitResult({ result, app }: { result: Result; app: ApplicationDetail }) {
  const own = app.matches?.students.find((student) => student.own);
  const unused = own && own.id !== result.studentId && !own.enrollments.length ? own : null;
  const invite = result.invite;
  return (
    <section className="rounded-box border border-ok bg-ok-soft p-4 text-sm">
      <p className="flex items-center gap-2 font-semibold text-ok"><FiCheckCircle aria-hidden />
        {result.alreadyEnrolled ? 'Linked to the existing enrolment' : 'Enrolled'} · <Link to={`/admin/students/${result.studentId}`} className="underline">{result.studentCode}</Link>
      </p>
      <p className="mt-1 text-xs">
        {result.alreadyEnrolled ? 'This student already studies this level, so no second enrolment was made.'
          : 'The tuition charge is created. The student sees the course now and the lessons open once tuition is paid. Assign a class in Enrolments if you skipped it.'}
      </p>
      {invite ? (
        <p className="mt-2 text-xs">
          {invite.emailConfigured ? 'Password setup email queued' : 'Email is not configured on this server: share the setup link yourself'}
          {' '}(valid until {new Date(invite.expiresAt).toLocaleDateString()}).
          {invite.setupUrl ? <span className="mt-1 block break-all rounded-field bg-base-100 p-2 font-mono text-[0.6875rem]">{invite.setupUrl}</span> : null}
        </p>
      ) : null}
      {unused ? <p className="mt-2 text-xs">The website account {unused.studentCode} ({unused.email}) is not used now. You can withdraw it from its student record.</p> : null}
    </section>
  );
}

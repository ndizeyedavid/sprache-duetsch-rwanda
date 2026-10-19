import { useState } from 'react';
import type { ApplicationDetail,StudentFromApplication } from '../../lib/admissions-types';
import { SELECT } from './constants';
import type { AdmissionRefs } from './useAdmissionRefs';
import type { StudentRequest } from './useDrawerActions';

type Props = {
  app: ApplicationDetail;
  refs: AdmissionRefs;
  busy: boolean;
  created: StudentFromApplication | null;
  onCreate: (body: StudentRequest) => void;
};

/** Accepted → student account (or link an existing one), optionally enrolled straight away. */
export function CreateStudentAction({ app, refs, busy, created, onCreate }: Props) {
  const [enroll, setEnroll] = useState(false);
  const [classGroupId, setClassGroupId] = useState('');
  const [override, setOverride] = useState('');
  const canEnroll = Boolean(app.levelId && app.intakeId);
  const classes = refs.classes.filter((group) => group.isActive && group.levelId === app.levelId && group.intakeId === app.intakeId
    && (!app.campusId || group.campusId === app.campusId));

  if (created) return <InviteResult created={created} />;
  if (app.status !== 'ACCEPTED' || app.studentId) return null;

  return (
    <section className="rounded-box border border-line bg-base-100 p-4">
      <h3 className="text-sm font-semibold">Create student account</h3>
      <p className="mt-1 text-xs text-muted">
        Generates a student ID (status Pending) and emails a link to choose a password. If this email already has a student
        account, the application is linked to it instead.
      </p>
      {!app.campusId ? <p className="mt-2 text-xs font-medium text-error">Set a campus in Course details first.</p> : null}
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" className="checkbox checkbox-sm" disabled={!canEnroll} checked={enroll}
          onChange={(event) => { const next = event.currentTarget.checked; setEnroll(next); }} />
        Also enrol now{canEnroll ? ` in ${app.level?.code} · ${app.intake?.name}` : ' (set level and intake first)'}
      </label>
      {enroll ? (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <select aria-label="Class" className={SELECT} value={classGroupId} onChange={(event) => { const next = event.currentTarget.value; setClassGroupId(next); }}>
            <option value="">Assign a class later</option>
            {classes.map((group) => <option key={group.id} value={group.id}>{group.name} ({group._count.enrollments} enrolled)</option>)}
          </select>
          <input className="input input-sm w-full rounded-field border-line bg-base-200" placeholder="Override reason if enrolment is closed"
            value={override} maxLength={500} onChange={(event) => { const next = event.currentTarget.value; setOverride(next); }} />
        </div>
      ) : null}
      <button type="button" disabled={busy || !app.campusId} className="btn btn-sm mt-3 rounded-full border-0 bg-brand text-xs text-white hover:bg-night"
        onClick={() => onCreate({ enroll, classGroupId: enroll && classGroupId ? classGroupId : undefined,
          windowOverrideReason: enroll && override.trim().length >= 10 ? override.trim() : undefined })}>
        {busy ? <span className="loading loading-spinner loading-xs" /> : null}
        Create student account
      </button>
    </section>
  );
}

function InviteResult({ created }: { created: StudentFromApplication }) {
  const invite = created.invite;
  return (
    <section className="rounded-box border border-line bg-base-100 p-4 text-sm">
      <p className="font-semibold">Student {created.studentCode}{created.enrollmentId ? ' · enrolled' : ''}</p>
      {!invite ? <p className="mt-1 text-xs text-muted">Existing account linked. The student signs in with their current password.</p> : (
        <>
          <p className="mt-1 text-xs text-muted">
            {invite.emailConfigured ? 'Password setup email queued.' : 'Email is not configured on this server — share the setup link with the student yourself.'}
            {' '}Link valid until {new Date(invite.expiresAt).toLocaleDateString()}.
          </p>
          {invite.setupUrl ? <p className="mt-2 break-all rounded-field bg-base-200 p-2 font-mono text-[0.6875rem]">{invite.setupUrl}</p> : null}
        </>
      )}
    </section>
  );
}

import { useEffect,useState } from 'react';
import type { AdmitRequest,ApplicationDetail } from '../../lib/admissions-types';
import { classOptionLabel } from '../enrolments/utils';
import { classesFor,defaultStudent,intakesFor,suggestCampus,suggestIntake } from './admit-defaults';
import { SELECT } from './constants';
import type { AdmissionRefs } from './useAdmissionRefs';
import type { CoursePatch } from './useDrawerActions';

type Props = { app: ApplicationDetail; refs: AdmissionRefs; busy: boolean; onAdmit: (body: AdmitRequest) => void; onSaveCourse: (patch: CoursePatch) => void };

const label = 'mb-1 block text-xs text-muted';

/**
 * Enrol in one step: course, intake, campus and (optionally) class, and whom — the applicant's own
 * account, a student record staff recognise as the same person, or a new account. Enrolling creates the
 * tuition charge (lessons open once it is paid) and tells the student.
 */
export function AdmitPanel({ app, refs, busy, onAdmit, onSaveCourse }: Props) {
  const [levelId, setLevelId] = useState(app.levelId ?? '');
  const [intakeId, setIntakeId] = useState(app.intakeId ?? '');
  const [campusId, setCampusId] = useState(app.campusId ?? '');
  const [suggested, setSuggested] = useState(false);
  const [classGroupId, setClassGroupId] = useState('');
  const [studentId, setStudentId] = useState(() => defaultStudent(app));
  const [override, setOverride] = useState('');

  // Reference lists arrive after the drawer opens, and a new level clears the intake: fill blanks with suggestions.
  useEffect(() => {
    if (!levelId || (intakeId && campusId)) return;
    const intake = intakeId || suggestIntake(app, refs.intakes, levelId);
    if (!intakeId && intake) setIntakeId(intake);
    if (!campusId && intake) {
      const campus = suggestCampus(app, refs.classes, levelId, intake);
      if (campus.id) { setCampusId(campus.id); setSuggested(campus.suggested); }
    }
  }, [app, refs.intakes, refs.classes, levelId, intakeId, campusId]);

  const intake = refs.intakes.find((row) => row.id === intakeId);
  const closed = intake ? !intake.registrationOpen || intake.endDate.slice(0, 10) < new Date().toISOString().slice(0, 10) : false;
  const classes = classesFor(refs.classes, levelId, intakeId, campusId);
  const level = refs.levels.find((row) => row.id === levelId);
  const students = app.matches?.students ?? [];
  const chosen = students.find((student) => student.id === studentId);
  const studying = chosen?.enrollments.find((row) => row.level === level?.code && row.status === 'ACTIVE');
  const ready = Boolean(levelId && intakeId && campusId) && (!closed || override.trim().length >= 10);

  return (
    <section className="rounded-box border-2 border-primary bg-base-100 p-4">
      <h3 className="text-sm font-semibold">Enrol</h3>
      <p className="mt-1 text-xs text-muted">One step: the student is placed in the course, the tuition charge is created (lessons open once it is paid) and the student is told.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label><span className={label}>Level</span>
          <select className={SELECT} value={levelId} onChange={(event) => { setLevelId(event.currentTarget.value); setIntakeId(''); setClassGroupId(''); }}>
            <option value="">Choose a level</option>
            {refs.levels.filter((row) => row.isActive || row.id === app.levelId).map((row) => <option key={row.id} value={row.id}>{row.code} — {row.title}</option>)}
          </select></label>
        <label><span className={label}>Intake{closed ? ' · registration closed' : ''}</span>
          <select className={SELECT} value={intakeId} onChange={(event) => { setIntakeId(event.currentTarget.value); setClassGroupId(''); }}>
            <option value="">Choose an intake</option>
            {intakesFor(refs.intakes, levelId, app.intakeId).map((row) => <option key={row.id} value={row.id}>{row.name}{row.registrationOpen ? '' : ' (closed)'}</option>)}
          </select></label>
        <label><span className={label}>Campus{suggested ? ' · suggested, check with the applicant' : ''}</span>
          <select className={SELECT} value={campusId} onChange={(event) => { setCampusId(event.currentTarget.value); setSuggested(false); setClassGroupId(''); }}>
            <option value="">Choose a campus</option>
            {refs.campuses.map((row) => <option key={row.id} value={row.id}>{row.name ?? row.code}</option>)}
          </select></label>
        <label><span className={label}>Class (optional)</span>
          <select className={SELECT} value={classGroupId} onChange={(event) => setClassGroupId(event.currentTarget.value)} disabled={!classes.length}>
            <option value="">{classes.length ? 'Assign a class later' : 'No class for this course yet'}</option>
            {classes.map((group) => <option key={group.id} value={group.id}>{classOptionLabel(group)}</option>)}
          </select></label>
      </div>

      <fieldset className="mt-3">
        <legend className={label}>Enrol as</legend>
        <div className="space-y-1.5">
          {students.map((student) => (
            <label key={student.id} className="flex items-start gap-2 text-xs">
              <input type="radio" name={`admit-student-${app.id}`} className="radio radio-xs mt-0.5" checked={studentId === student.id} onChange={() => setStudentId(student.id)} />
              <span><span className="font-semibold">{student.studentCode} · {student.name}</span>
                <span className="block text-muted">{student.own ? 'The applicant’s own account' : `Existing student, same ${student.via.join(', ')}`} · {student.email}</span></span>
            </label>
          ))}
          {students.some((student) => student.own) ? null : (
            <label className="flex items-center gap-2 text-xs">
              <input type="radio" name={`admit-student-${app.id}`} className="radio radio-xs" checked={studentId === ''} onChange={() => setStudentId('')} />
              New student account for {app.email} (a password link is emailed)
            </label>
          )}
        </div>
      </fieldset>
      {studying ? <p className="mt-2 rounded-field bg-base-200 p-2 text-xs">Already studying {studying.level} ({studying.intake}): the application is linked to that enrolment, no second enrolment is made.</p> : null}
      {closed ? (
        <input className="input input-sm mt-2 w-full rounded-field border-line bg-base-200" maxLength={500} value={override} onChange={(event) => setOverride(event.currentTarget.value)}
          placeholder="Registration is closed: give a reason to enrol anyway (at least 10 characters, kept in the audit log)" />
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={busy || !ready} className="btn btn-primary btn-sm rounded-full text-xs"
          onClick={() => onAdmit({ levelId, intakeId, campusId, classGroupId: classGroupId || undefined, studentId: studentId || undefined, windowOverrideReason: closed ? override.trim() : undefined })}>
          {busy ? <span className="loading loading-spinner loading-xs" /> : null}Enrol student
        </button>
        <button type="button" disabled={busy || !levelId} className="btn btn-ghost btn-sm rounded-full text-xs"
          onClick={() => onSaveCourse({ levelId: levelId || null, intakeId: intakeId || null, campusId: campusId || null })}>
          Save course only
        </button>
      </div>
    </section>
  );
}

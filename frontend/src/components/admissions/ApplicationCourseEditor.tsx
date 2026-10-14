import { useState } from 'react';
import type { ApplicationDetail,Shift } from '../../lib/admissions-types';
import { SELECT,SHIFT_LABEL } from './constants';
import type { AdmissionRefs } from './useAdmissionRefs';
import type { CoursePatch } from './useDrawerActions';

type Props = { app: ApplicationDetail; refs: AdmissionRefs; busy: boolean; onSave: (patch: CoursePatch) => void };

/** Map what the applicant asked for onto a real level, intake and campus before deciding. */
export function ApplicationCourseEditor({ app, refs, busy, onSave }: Props) {
  const [levelId, setLevelId] = useState(app.levelId ?? '');
  const [intakeId, setIntakeId] = useState(app.intakeId ?? '');
  const [campusId, setCampusId] = useState(app.campusId ?? '');
  const [shift, setShift] = useState<Shift | ''>(app.shift ?? '');

  const intakes = refs.intakes.filter((intake) => intake.id === app.intakeId
    || (intake.isActive && (!levelId || intake.levels?.some((level) => level.id === levelId))));
  const changed = levelId !== (app.levelId ?? '') || intakeId !== (app.intakeId ?? '') || campusId !== (app.campusId ?? '') || shift !== (app.shift ?? '');

  return (
    <details className="rounded-box border border-line bg-base-100 p-4" open={!app.levelId || !app.campusId}>
      <summary className="cursor-pointer text-sm font-semibold">Course details</summary>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <select aria-label="Level" className={SELECT} value={levelId} onChange={(event) => { const next = event.currentTarget.value; setLevelId(next); setIntakeId(''); }}>
          <option value="">Level not set</option>
          {refs.levels.filter((level) => level.isActive || level.id === app.levelId).map((level) => <option key={level.id} value={level.id}>{level.code} — {level.title}</option>)}
        </select>
        <select aria-label="Intake" className={SELECT} value={intakeId} onChange={(event) => { const next = event.currentTarget.value; setIntakeId(next); }}>
          <option value="">Intake not set</option>
          {intakes.map((intake) => <option key={intake.id} value={intake.id}>{intake.name}</option>)}
        </select>
        <select aria-label="Campus" className={SELECT} value={campusId} onChange={(event) => { const next = event.currentTarget.value; setCampusId(next); }}>
          <option value="">Campus not set</option>
          {refs.campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name ?? campus.code}</option>)}
        </select>
        <select aria-label="Shift" className={SELECT} value={shift} onChange={(event) => { const next = event.currentTarget.value as Shift | ''; setShift(next); }}>
          <option value="">Any shift</option>
          {Object.entries(SHIFT_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <button type="button" disabled={busy || !changed} className="btn btn-sm mt-3 rounded-full border-line bg-base-200 text-xs"
        onClick={() => onSave({ levelId: levelId || null, intakeId: intakeId || null, campusId: campusId || null, shift: shift || null })}>
        Save course details
      </button>
    </details>
  );
}

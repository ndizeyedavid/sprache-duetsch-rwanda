import type { Catalog } from '../../lib/admissions-types';
import { seatsForLevel,seatsHint,shortDate } from './utils';
import type { ApplyFormState } from './useApplyForm';

const SELECT = 'select w-full rounded-field border-line bg-base-200';

/** What and where: level, intake offering it and campus. */
export function ApplyCourseFields({ form, catalog }: { form: ApplyFormState; catalog: Catalog }) {
  const { values, intakes, update } = form;
  const intake = intakes.find((item) => item.id === values.intakeId);
  const hint = intake && values.levelId ? seatsHint(seatsForLevel(intake, values.levelId)) : null;

  return (
    <>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium">Level</span>
        <select required value={values.levelId} className={SELECT}
          onChange={(event) => { const levelId = event.currentTarget.value; update({ levelId }); }}>
          <option value="">Choose a level</option>
          {catalog.levels.map((level) => (
            <option key={level.id} value={level.id}>{level.code} — {level.title}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium">Intake</span>
        <select value={values.intakeId} disabled={!values.levelId} className={SELECT}
          onChange={(event) => { const intakeId = event.currentTarget.value; update({ intakeId }); }}>
          <option value="">{intakes.length ? 'Next available intake' : 'No open intake — we will contact you'}</option>
          {intakes.map((item) => (
            <option key={item.id} value={item.id}>{item.name} · starts {shortDate(item.startDate)}</option>
          ))}
        </select>
        {hint ? <span className="mt-1 block text-xs font-medium text-brand">{hint}</span> : null}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium">Campus</span>
        <select value={values.campusId} className={SELECT}
          onChange={(event) => { const campusId = event.currentTarget.value; update({ campusId }); }}>
          <option value="">No preference</option>
          {catalog.campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
        </select>
      </label>
    </>
  );
}

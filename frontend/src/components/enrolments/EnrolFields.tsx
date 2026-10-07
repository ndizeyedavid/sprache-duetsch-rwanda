import { useFinanceAccess } from '../../hooks/useFinanceAccess';
import { rwf } from '../../lib/format';
import type { IntakeItem,LevelItem,StudentRow } from '../../lib/services';
import { money } from '../../lib/services';
import { DuplicateNotice } from './DuplicateNotice';
import { FormField } from './FormField';
import { InstallmentEditor } from './InstallmentEditor';
import { ReferenceSelect } from './ReferenceSelect';
import { STUDENT_FIELD_ID } from './constants';
import type { EnrolmentDraft } from './useEnrolmentDraft';
import { classOptionLabel } from './utils';

type Props = {
  draft: EnrolmentDraft;
  students: StudentRow[];
  levels: LevelItem[];
  intakes: IntakeItem[];
};

/** The five create-enrolment fields, with the guards rendered inline. */
export function EnrolFields({ draft, students, levels, intakes }: Props) {
  const canFinance = useFinanceAccess();
  const intake = intakes.find(row => row.id === draft.intakeId);
  const defaultFee = draft.level ? rwf(money(draft.level.defaultFee)) : null;
  const feeHint =
    draft.fee !== undefined && defaultFee
      ? `Overrides the level default of ${defaultFee}.`
      : defaultFee
        ? `Leave blank to use the level default of ${defaultFee}.`
        : 'Leave blank to use the level default fee.';

  return (
    <div className="space-y-4">
      {canFinance && intake ? <p className="text-xs">Registration: {rwf(Number(intake.registrationFee ?? 0))} · Books: {rwf(Number(intake.bookFee ?? 0))}. Charged once per student in this intake.</p> : null}
      <ReferenceSelect
        id={STUDENT_FIELD_ID}
        label="Student"
        required
        value={draft.studentId}
        onChange={draft.setStudentId}
        placeholder="Select student"
        options={students.map((student) => ({
          id: student.id,
          label: `${student.user.firstName} ${student.user.lastName} (${student.studentCode})`,
        }))}
      />

      <ReferenceSelect
        id="enrol-level"
        label="Level"
        required
        value={draft.levelId}
        onChange={draft.setLevelId}
        placeholder="Select level"
        options={levels
          .filter((item) => item.isActive)
          .map((item) => ({ id: item.id, label: `${item.code} · ${item.title}` }))}
      />

      <ReferenceSelect
        id="enrol-intake"
        label="Intake"
        required
        value={draft.intakeId}
        onChange={draft.setIntakeId}
        placeholder="Select intake"
        options={intakes
          .filter((item) => item.isActive)
          .map((item) => ({ id: item.id, label: item.name }))}
      />

      <ReferenceSelect
        id="enrol-class"
        label="Class group"
        value={draft.classGroupId}
        onChange={draft.setClassGroupId}
        placeholder="Assign class later"
        disabled={draft.classOptions.length === 0}
        options={draft.classOptions.map((group) => ({
          id: group.id,
          label: classOptionLabel(group),
        }))}
        hint={
          draft.classOptions.length === 0 && draft.levelId && draft.intakeId
            ? 'No active class group for this level and intake — enrol now, assign a class later.'
            : 'Optional. Only groups from the selected level and intake are listed.'
        }
      />

      {canFinance && <><FormField id="enrol-fee" label="Tuition override" hint={feeHint} error={draft.feeError}>
        <input
          id="enrol-fee"
          value={draft.feeInput}
          onChange={(event) => draft.setFeeInput(event.currentTarget.value)}
          inputMode="numeric"
          placeholder="e.g. 45000"
          className="input w-full rounded-field border-line bg-base-200 text-sm"
        />
      </FormField>

      <InstallmentEditor rows={draft.installments} onChange={draft.setInstallments} total={draft.fee ?? Number(draft.level?.defaultFee ?? 0)} /></>}
      <label className="block text-xs">Early/late enrolment override reason (if needed)
        <input className="input mt-1 w-full" minLength={10} value={draft.windowOverrideReason} onChange={event => draft.setWindowOverrideReason(event.target.value)} />
      </label>
      {draft.duplicate ? <DuplicateNotice duplicate={draft.duplicate} /> : null}
    </div>
  );
}
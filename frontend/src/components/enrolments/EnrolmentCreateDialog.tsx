import { FiUserPlus } from 'react-icons/fi';
import type { ClassGroupItem,EnrollmentRow,IntakeItem,LevelItem,StudentRow } from '../../lib/services';
import { Modal } from '../ui/Modal';
import { EnrolFields } from './EnrolFields';
import { FORM_HINT } from './constants';
import type { CreateEnrolmentPayload } from './types';
import { useEnrolmentDraft } from './useEnrolmentDraft';

type Props = {
  open: boolean;
  students: StudentRow[];
  levels: LevelItem[];
  intakes: IntakeItem[];
  groups: ClassGroupItem[];
  enrolments: EnrollmentRow[];
  saving: boolean;
  onClose: () => void;
  onCreate: (payload: CreateEnrolmentPayload, message: string) => Promise<boolean>;
};

/** Create counterpart to EnrolmentManageDialog: same shell, same footer rhythm. */
export function EnrolmentCreateDialog({
  open,
  students,
  levels,
  intakes,
  groups,
  enrolments,
  saving,
  onClose,
  onCreate,
}: Props) {
  const draft = useEnrolmentDraft(enrolments, levels, groups);

  async function handleCreate() {
    const student = students.find((row) => row.id === draft.studentId);
    const intake = intakes.find((row) => row.id === draft.intakeId);
    const ok = await onCreate(
      draft.payload(),
      `${student?.user.firstName ?? ''} ${student?.user.lastName ?? ''} enrolled in ${draft.level?.code ?? ''} · ${intake?.name ?? ''}`.trim(),
    );
    if (ok) {
      draft.reset();
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Enrol a student">
      <p className="mb-4 text-xs text-muted">{FORM_HINT}</p>

      <EnrolFields draft={draft} students={students} levels={levels} intakes={intakes} />

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="btn rounded-full border-line bg-base-100 text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={saving || draft.blocked}
          className="btn rounded-full border-0 bg-brand text-white hover:bg-night disabled:bg-base-300 disabled:text-muted"
        >
          {saving ? <span className="loading loading-spinner loading-sm" /> : <FiUserPlus aria-hidden />}
          Enrol student
        </button>
      </div>
    </Modal>
  );
}
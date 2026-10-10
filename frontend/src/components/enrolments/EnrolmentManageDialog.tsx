import { useFinanceAccess } from '../../hooks/useFinanceAccess';
import { useEffect,useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { rwf } from '../../lib/format';
import type { ClassGroupItem,EnrollmentRow } from '../../lib/services';
import { humanize,money } from '../../lib/services';
import { Modal } from '../ui/Modal';
import { FormField } from './FormField';
import type { InstallmentDraft } from './InstallmentEditor';
import { InstallmentEditor } from './InstallmentEditor';
import { ReferenceSelect } from './ReferenceSelect';
import { ACTIVE_ONLY_NOTE,REFUND_NOTE,STATUS_OPTIONS } from './constants';
import { parseInstallments } from './installment-utils';
import type { UpdateEnrolmentPatch } from './types';
import { classOptionLabel,classOptionsFor,parseFee } from './utils';

type Props = {
  row: EnrollmentRow | null;
  groups: ClassGroupItem[];
  saving: boolean;
  onClose: () => void;
  onSave: (id: string, patch: UpdateEnrolmentPatch, message: string) => Promise<boolean>;
};

/** Class assignment, status and tuition — the three things staff fix after enrolling. */
export function EnrolmentManageDialog({ row, groups, saving, onClose, onSave }: Props) {
  const canFinance = useFinanceAccess();
  const [classGroupId, setClassGroupId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [feeInput, setFeeInput] = useState('');
  const [scheduleRows, setScheduleRows] = useState<InstallmentDraft[]>([]);
  const [scheduleChanged, setScheduleChanged] = useState(false);

  const rowId = row?.id ?? null;

  useEffect(() => {
    if (!row) return;
    setClassGroupId(row.classGroup?.id ?? '');
    setStatus(row.status);
    setFeeInput('');
    setScheduleChanged(false);
    setScheduleRows((row.charges ?? []).filter(charge => charge.type === 'TUITION').sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '')).map(charge => ({ amount: String(charge.amount), dueDate: charge.dueDate?.slice(0, 10) ?? '' })));
  }, [rowId, row]);

  if (!row) return null;

  const classOptions = classOptionsFor(groups, row.level.id, row.intake.id);
  const { fee, error: feeError } = parseFee(feeInput);
  const currentFee = money(row.totalFee);
  const schedule = parseInstallments(scheduleRows, fee ?? currentFee);
  if (scheduleChanged && !scheduleRows.length) schedule.error = "Keep at least one tuition instalment with a due date.";
  const statusOption = STATUS_OPTIONS.find((option) => option.value === status);

  async function handleSave() {
    if (!row) return;
    const patch: UpdateEnrolmentPatch = {
      classGroupId: classGroupId === '' ? null : classGroupId,
      status,
    };
    if (fee !== undefined) patch.totalFee = fee;
    if (scheduleChanged || fee !== undefined && scheduleRows.length > 1) patch.installments = schedule.installments;
    const ok = await onSave(
      row.id,
      patch,
      `${row.student.user.firstName} ${row.student.user.lastName} updated — ${humanize(status)}${
        classGroupId ? ` in ${classOptions.find((group) => group.id === classGroupId)?.name ?? 'class'}` : ', no class'
      }.`,
    );
    if (ok) onClose();
  }

  return (
    <Modal open onClose={onClose} title="Manage enrolment">
      <div className="rounded-field bg-base-200 px-4 py-3">
        <p className="text-sm font-semibold text-ink">
          {row.student.user.firstName} {row.student.user.lastName}
        </p>
        <p className="mt-0.5 text-[11px] text-muted">
          {row.student.studentCode} · {row.level.code} · {row.intake.name} ·{' '}
          {row.classGroup?.name ?? 'no class'}
        </p>
      </div>

      <div className="mt-4 space-y-4">
        <ReferenceSelect
          id="manage-class"
          label="Class group"
          value={classGroupId}
          onChange={setClassGroupId}
          placeholder="No class assigned"
          disabled={classOptions.length === 0}
          options={classOptions.map((group) => ({ id: group.id, label: classOptionLabel(group) }))}
          hint={
            classOptions.length === 0
              ? `No active class group for ${row.level.code} in ${row.intake.name}.`
              : 'Only groups from this level and intake can be assigned.'
          }
        />

        <ReferenceSelect
          id="manage-status"
          label="Status"
          value={status}
          onChange={setStatus}
          placeholder=""
          options={STATUS_OPTIONS.map((option) => ({ id: option.value, label: option.label }))}
          hint={statusOption?.hint}
        />

        {canFinance && <><FormField
          id="manage-fee"
          label="Tuition override"
          error={feeError}
          hint={`Leave blank to keep ${rwf(currentFee)}. The linked tuition charge updates with it.`}
        >
          <input
            id="manage-fee"
            value={feeInput}
            onChange={(event) => setFeeInput(event.currentTarget.value)}
            inputMode="numeric"
            placeholder={`e.g. ${currentFee}`}
            className="input w-full rounded-field border-line bg-base-200 text-sm"
          />
        </FormField>

        <InstallmentEditor rows={scheduleRows} total={fee ?? currentFee} onChange={rows => { setScheduleRows(rows); setScheduleChanged(true); }} /></>}
        <p className="flex items-start gap-2 rounded-field bg-base-100 px-3 py-2 text-[11px] text-muted">
          <FiAlertTriangle aria-hidden className="mt-0.5 shrink-0 text-brand" />
          <span>
            {status === 'ACTIVE' ? ACTIVE_ONLY_NOTE : canFinance ? REFUND_NOTE : 'This changes academic access; financial records are handled separately.'}
          </span>
        </p>
      </div>

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
          onClick={handleSave}
          disabled={saving || Boolean(feeError) || ((scheduleChanged || fee !== undefined) && Boolean(schedule.error))}
          className="btn rounded-full border-0 bg-brand text-white hover:bg-night disabled:bg-base-300 disabled:text-muted"
        >
          {saving ? <span className="loading loading-spinner loading-sm" /> : null}
          Save changes
        </button>
      </div>
    </Modal>
  );
}
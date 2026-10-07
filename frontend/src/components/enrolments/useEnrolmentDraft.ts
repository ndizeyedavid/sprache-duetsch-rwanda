import { useState } from 'react';
import type { ClassGroupItem,EnrollmentRow,LevelItem } from '../../lib/services';
import { parseInstallments } from './installment-utils';
import type { InstallmentDraft } from './InstallmentEditor';
import type { CreateEnrolmentPayload } from './types';
import { classOptionsFor,duplicateEnrolment,parseFee } from './utils';

export type EnrolmentDraft = ReturnType<typeof useEnrolmentDraft>;

/**
 * Owns the create-form draft plus every guard the API would otherwise reject:
 * stale class choice, duplicate student+level+intake, malformed tuition.
 */
export function useEnrolmentDraft(
  enrolments: EnrollmentRow[],
  levels: LevelItem[],
  groups: ClassGroupItem[],
) {
  const [studentId, setStudentId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [intakeId, setIntakeId] = useState('');
  const [classGroupId, setClassGroupId] = useState('');
  const [feeInput, setFeeInput] = useState('');
  const [installments, setInstallments] = useState<InstallmentDraft[]>([]);
  const [windowOverrideReason, setWindowOverrideReason] = useState('');

  const level = levels.find((item) => item.id === levelId) ?? null;
  const classOptions = classOptionsFor(groups, levelId, intakeId);
  const duplicate = duplicateEnrolment(enrolments, { studentId, levelId, intakeId });
  const { fee, error: feeError } = parseFee(feeInput);

  const schedule = parseInstallments(installments, fee ?? Number(level?.defaultFee ?? 0));
  function reset() {
    setInstallments([]); setWindowOverrideReason('');
    setStudentId('');
    setLevelId('');
    setIntakeId('');
    setClassGroupId('');
    setFeeInput('');
  }

  return {
    installments, setInstallments, windowOverrideReason, setWindowOverrideReason,
    studentId,
    setStudentId,
    levelId,
    // Changing the level or intake invalidates any previously chosen class group.
    setLevelId: (value: string) => {
      setLevelId(value);
      setClassGroupId('');
    },
    intakeId,
    setIntakeId: (value: string) => {
      setIntakeId(value);
      setClassGroupId('');
    },
    classGroupId,
    setClassGroupId,
    feeInput,
    setFeeInput,
    level,
    classOptions,
    duplicate,
    fee,
    feeError,
    blocked: !studentId || !levelId || !intakeId || Boolean(duplicate) || Boolean(feeError) || Boolean(schedule.error),
    reset,
    payload(): CreateEnrolmentPayload {
      return {
        studentId,
        levelId,
        intakeId,
        classGroupId: classGroupId || undefined,
        totalFee: fee,
        installments: schedule.installments,
        windowOverrideReason: windowOverrideReason.trim() || undefined,
      };
    },
  };
}
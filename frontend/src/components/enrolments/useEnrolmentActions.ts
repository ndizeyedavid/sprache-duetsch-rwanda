import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { createEnrollment,updateEnrollment } from '../../lib/services';
import { assignEnrolmentsToClass } from '../../lib/services/enrolment-register';
import type { CreateEnrolmentPayload,UpdateEnrolmentPatch } from './types';

type EnrolmentActions = {
  /** True while the create form is submitting. */
  saving: boolean;
  /** Id of the row currently being updated, for per-row spinners. */
  savingId: string | null;
  error: string | null;
  success: string | null;
  create: (payload: CreateEnrolmentPayload, message: string) => Promise<boolean>;
  update: (id: string, patch: UpdateEnrolmentPatch, message: string) => Promise<boolean>;
  /** True while a bulk class change runs. */
  assigning: boolean;
  /** Place many enrolments in one class (or none); resolves true when none was skipped. */
  assign: (ids: string[], classGroupId: string | null) => Promise<boolean>;
  clearFeedback: () => void;
};

/**
 * Single owner for enrolment writes: one feedback channel for the create form and
 * the manage dialog, so a failed save always lands next to the control that caused it.
 */
export function useEnrolmentActions(refetch: () => void): EnrolmentActions {
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function startFeedback() {
    setError(null);
    setSuccess(null);
  }

  async function create(
    payload: CreateEnrolmentPayload,
    message: string,
  ): Promise<boolean> {
    startFeedback();
    setSaving(true);
    try {
      await createEnrollment(payload);
      setSuccess(message);
      refetch();
      return true;
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create the enrolment.'));
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function update(
    id: string,
    patch: UpdateEnrolmentPatch,
    message: string,
  ): Promise<boolean> {
    startFeedback();
    setSavingId(id);
    try {
      await updateEnrollment(id, patch);
      setSuccess(message);
      refetch();
      return true;
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not update the enrolment.'));
      return false;
    } finally {
      setSavingId(null);
    }
  }

  async function assign(ids: string[], classGroupId: string | null): Promise<boolean> {
    startFeedback();
    setAssigning(true);
    try {
      const result = await assignEnrolmentsToClass(ids, classGroupId);
      const done = result.assigned.length;
      if (done) setSuccess(`${done} student${done === 1 ? '' : 's'} ${classGroupId ? 'placed in the class' : 'taken out of their class'}.`);
      if (result.skipped.length) {
        setError(`${result.skipped.length} not changed: ${result.skipped.map((row) => `${row.name} (${row.reason})`).join('; ')}`);
      }
      refetch();
      return result.skipped.length === 0;
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not change the class.'));
      return false;
    } finally {
      setAssigning(false);
    }
  }

  return {
    saving,
    savingId,
    assigning,
    assign,
    error,
    success,
    create,
    update,
    clearFeedback: () => {
      setError(null);
      setSuccess(null);
    },
  };
}
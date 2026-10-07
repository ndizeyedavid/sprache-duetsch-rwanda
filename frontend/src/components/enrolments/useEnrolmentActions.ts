import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { createEnrollment,updateEnrollment } from '../../lib/services';
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
  clearFeedback: () => void;
};

/**
 * Single owner for enrolment writes: one feedback channel for the create form and
 * the manage dialog, so a failed save always lands next to the control that caused it.
 */
export function useEnrolmentActions(refetch: () => void): EnrolmentActions {
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
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

  return {
    saving,
    savingId,
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
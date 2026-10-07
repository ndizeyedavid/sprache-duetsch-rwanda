import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import {
createUser,
resetUserPassword,
updateUser,
updateUserRole,
} from '../../lib/services';
import type { StaffDraft,StaffProfilePatch } from './types';
import { staffName } from './utils';

type StaffActions = {
  /** True while the create dialog is submitting. */
  creating: boolean;
  /** Id of the row being written, for per-row and per-dialog spinners. */
  pendingId: string | null;
  error: string | null;
  success: string | null;
  create: (draft: StaffDraft) => Promise<boolean>;
  updateProfile: (
    id: string,
    patch: StaffProfilePatch,
    message: string,
  ) => Promise<boolean>;
  setStatus: (id: string, status: string, message: string) => Promise<boolean>;
  setRole: (id: string, role: string, message: string) => Promise<boolean>;
  resetPassword: (id: string, password: string, message: string) => Promise<boolean>;
  clearFeedback: () => void;
};

/**
 * Single owner for staff writes so a failed save always lands next to the control
 * that caused it, and the dialog can wait for `true` before it closes.
 */
export function useStaffActions(refetch: () => void): StaffActions {
  const [creating, setCreating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function startFeedback() {
    setError(null);
    setSuccess(null);
  }

  async function create(draft: StaffDraft): Promise<boolean> {
    startFeedback();
    setCreating(true);
    try {
      const user = await createUser({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        email: draft.email.trim().toLowerCase(),
        phone: draft.phone.trim() || undefined,
        password: draft.password,
        role: draft.role,
      });
      setSuccess(`${staffName(user)} added as a staff account — hand over the password, then set them Active.`);
      refetch();
      return true;
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create the account.'));
      return false;
    } finally {
      setCreating(false);
    }
  }

  async function run(
    id: string,
    write: () => Promise<unknown>,
    message: string,
    fallback: string,
  ): Promise<boolean> {
    startFeedback();
    setPendingId(id);
    try {
      await write();
      setSuccess(message);
      refetch();
      return true;
    } catch (err) {
      setError(apiErrorMessage(err, fallback));
      return false;
    } finally {
      setPendingId(null);
    }
  }

  const updateProfile = (id: string, patch: StaffProfilePatch, message: string) =>
    run(id, () => updateUser(id, patch), message, 'Could not save the details.');

  const setStatus = (id: string, status: string, message: string) =>
    run(id, () => updateUser(id, { status }), message, 'Could not change the account status.');

  const setRole = (id: string, role: string, message: string) =>
    run(id, () => updateUserRole(id, role), message, 'Could not change the role.');

  const resetPassword = (id: string, password: string, message: string) =>
    run(
      id,
      () => resetUserPassword(id, password),
      message,
      'Could not reset the password.',
    );

  return {
    creating,
    pendingId,
    error,
    success,
    create,
    updateProfile,
    setStatus,
    setRole,
    resetPassword,
    clearFeedback: () => {
      setError(null);
      setSuccess(null);
    },
  };
}
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { StaffField } from './StaffField';
import { StaffHandover } from './StaffHandover';
import { StaffPasswordInput } from './StaffPasswordInput';
import { ROLE_OPTIONS,STAFF_FIELD_CLASS,STAFF_SELECT_CLASS } from './constants';
import type { StaffDraft } from './types';
import { passwordProblem } from './utils';

type Props = {
  creatableRoles: string[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (draft: StaffDraft) => Promise<boolean>;
};

const BLANK: StaffDraft = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'TEACHER',
  password: '',
};

const EMAIL_PROBLEM = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Create staff account. The password stays in this form; once the API accepts it the
 * dialog swaps to the handover panel, because the password is never returned again.
 */
export function StaffCreateDialog({ creatableRoles, saving, onClose, onSubmit }: Props) {
  const [draft, setDraft] = useState<StaffDraft>(BLANK);
  const [touched, setTouched] = useState(false);
  const [issued, setIssued] = useState<{ email: string; password: string } | null>(null);

  const roles = ROLE_OPTIONS.filter((option) => creatableRoles.includes(option.value));
  const role = ROLE_OPTIONS.find((option) => option.value === draft.role);
  const emailError =
    draft.email.trim() !== '' && !EMAIL_PROBLEM.test(draft.email.trim())
      ? 'Enter a valid email address.'
      : null;
  const password = passwordProblem(draft.password);
  const canSubmit =
    draft.firstName.trim() !== '' &&
    draft.lastName.trim() !== '' &&
    EMAIL_PROBLEM.test(draft.email.trim()) &&
    password.valid;

  function set<K extends keyof StaffDraft>(key: K, value: StaffDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    const email = draft.email.trim().toLowerCase();
    const ok = await onSubmit({ ...draft });
    if (ok) {
      setIssued({ email, password: draft.password });
      setDraft(BLANK);
      setTouched(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={issued ? 'Account created' : 'Add staff account'}>
      {issued ? (
        <StaffHandover
          email={issued.email}
          password={issued.password}
          nextStep="Hand the password over in person now, then set the account Active from the roster."
          onDone={onClose}
        />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <StaffField
              id="staff-first"
              label="First name"
              error={touched && !draft.firstName.trim() ? 'Required.' : null}
            >
              <input
                id="staff-first"
                value={draft.firstName}
                onChange={(event) => set('firstName', event.currentTarget.value)}
                autoComplete="off"
                className={STAFF_FIELD_CLASS}
              />
            </StaffField>
            <StaffField
              id="staff-last"
              label="Last name"
              error={touched && !draft.lastName.trim() ? 'Required.' : null}
            >
              <input
                id="staff-last"
                value={draft.lastName}
                onChange={(event) => set('lastName', event.currentTarget.value)}
                autoComplete="off"
                className={STAFF_FIELD_CLASS}
              />
            </StaffField>
          </div>

          <div className="mt-4 space-y-4">
            <StaffField id="staff-email" label="Work email" error={emailError}>
              <input
                id="staff-email"
                type="email"
                value={draft.email}
                onChange={(event) => set('email', event.currentTarget.value)}
                autoComplete="off"
                placeholder="name@sparch.rw"
                className={STAFF_FIELD_CLASS}
              />
            </StaffField>
            <StaffField id="staff-phone" label="Phone" hint="Optional — used for reminders.">
              <input
                id="staff-phone"
                value={draft.phone}
                onChange={(event) => set('phone', event.currentTarget.value)}
                autoComplete="off"
                placeholder="+250 788 000 000"
                className={STAFF_FIELD_CLASS}
              />
            </StaffField>
            <StaffField id="staff-role" label="Role" hint={role?.scope}>
              <select
                id="staff-role"
                value={draft.role}
                onChange={(event) => set('role', event.currentTarget.value)}
                className={STAFF_SELECT_CLASS}
              >
                {roles.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </StaffField>
            <StaffPasswordInput
              id="staff-password"
              label="Temporary password"
              value={draft.password}
              onChange={(value) => set('password', value)}
              error={touched ? password.error : null}
              hint="Read it out over the phone rather than sending it in chat."
            />
            {role ? (
              <p className="rounded-field bg-base-200 px-3 py-2 text-[11px] text-muted">
                {role.limits}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn rounded-full border-line bg-base-100 text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn rounded-full border-0 bg-brand text-white hover:bg-night disabled:bg-base-300 disabled:text-muted"
            >
              {saving ? <span className="loading loading-spinner loading-sm" /> : null}
              Create account
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
import { useState } from 'react';
import { FiCheck,FiCopy } from 'react-icons/fi';
import { StaffField } from './StaffField';
import { STAFF_FIELD_CLASS } from './constants';

type Props = {
  email: string;
  password: string;
  /** What the person should do once they have the password. */
  nextStep: string;
  onDone: () => void;
};

/**
 * One-time credential reveal. The API never returns a password again, so this panel
 * is the only chance to hand it over — say so plainly instead of a bare success toast.
 */
export function StaffHandover({ email, password, nextStep, onDone }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    // Clipboard can reject without a secure context; the field stays selectable either way.
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <p className="rounded-field bg-brand text-primary-content px-4 py-3 text-xs font-medium text-[#B30A00]">
        <strong className="break-all">{email}</strong> is set up. {nextStep} The password is
        shown once and cannot be retrieved later.
      </p>

      <div className="mt-4">
        <StaffField id="handover-password" label="Temporary password">
          <div className="join w-full">
            <input
              id="handover-password"
              readOnly
              value={password}
              onFocus={(event) => event.currentTarget.select()}
              className={`${STAFF_FIELD_CLASS} join-item font-mono`}
            />
            <button
              type="button"
              onClick={copy}
              className="btn join-item border-line bg-base-200 text-ink"
            >
              {copied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
              <span className="sr-only">Copy password</span>
            </button>
          </div>
        </StaffField>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onDone}
          className="btn rounded-full border-0 bg-brand text-white hover:bg-night"
        >
          Done
        </button>
      </div>
    </div>
  );
}
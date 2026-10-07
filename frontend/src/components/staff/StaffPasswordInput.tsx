import { FiRefreshCw } from 'react-icons/fi';
import { StaffField } from './StaffField';
import {
MAX_PASSWORD_LENGTH,
MIN_PASSWORD_LENGTH,
STAFF_FIELD_CLASS,
} from './constants';
import { generatePassword } from './utils';

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  hint?: string;
};

/**
 * Temporary password with a one-tap generator — a typed-out password is where staff
 * accounts usually get something guessable, and the generator uses the Web Crypto RNG.
 */
export function StaffPasswordInput({
  id,
  label,
  value,
  onChange,
  error,
  hint = `A strong option beats a remembered one. They should change it after signing in.`,
}: Props) {
  return (
    <StaffField
      id={id}
      label={label}
      error={error}
      hint={`${hint} ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} characters.`}
    >
      <div className="join w-full">
        <input
          id={id}
          type="password"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          autoComplete="new-password"
          className={`${STAFF_FIELD_CLASS} join-item`}
        />
        <button
          type="button"
          onClick={() => onChange(generatePassword())}
          className="btn join-item border-line bg-base-200 text-xs text-ink"
        >
          <FiRefreshCw aria-hidden />
          Generate
        </button>
      </div>
    </StaffField>
  );
}
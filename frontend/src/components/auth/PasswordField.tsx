import { useId, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  /** Lets each auth page keep its own input and label look. */
  inputClassName?: string;
  labelClassName?: string;
};

/** Password input with an eye button that shows or hides what was typed. */
export function PasswordField({
  label, value, onChange, autoComplete = 'new-password', minLength, maxLength, placeholder,
  inputClassName = 'input w-full', labelClassName = 'mb-1.5 block text-xs font-medium',
}: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return <div>
    <label htmlFor={id} className={labelClassName}>{label}</label>
    <div className="relative">
      <input id={id} className={`${inputClassName} pr-11`} type={visible ? 'text' : 'password'} minLength={minLength} maxLength={maxLength}
        required autoComplete={autoComplete} placeholder={placeholder} value={value} onChange={e => onChange(e.currentTarget.value)} />
      <button type="button" onClick={() => setVisible(v => !v)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}
        className="btn btn-ghost btn-sm btn-square absolute right-1.5 top-1/2 z-10 -translate-y-1/2 text-muted">
        {visible ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
      </button>
    </div>
  </div>;
}

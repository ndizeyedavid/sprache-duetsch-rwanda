import type { ReactNode } from 'react';
import { FormField } from './FormField';

export const FIELD_CLASS = 'select w-full rounded-field border-line bg-base-200 text-sm';

type Option = { id: string; label: string };

type Props = {
  id: string;
  label: string;
  value: string;
  options: Option[];
  placeholder: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  disabled?: boolean;
};

/** Labelled select over reference data (levels, intakes, class groups). */
export function ReferenceSelect({
  id,
  label,
  value,
  options,
  placeholder,
  onChange,
  hint,
  error,
  required = false,
  disabled = false,
}: Props) {
  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        required={required}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.value)}
        className={`${FIELD_CLASS} disabled:cursor-not-allowed disabled:text-muted`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
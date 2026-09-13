import { FiSearch } from 'react-icons/fi';

type SearchFieldProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  ariaLabel?: string;
};

export function SearchField({
  placeholder = 'Search...',
  value,
  onChange,
  className = '',
  ariaLabel = 'Search',
}: SearchFieldProps) {
  return (
    <label className={`input input-sm flex items-center gap-2 rounded-full border-0 bg-base-200 ${className}`}>
      <FiSearch className="text-muted" aria-hidden />
      <input
        type="search"
        className="grow bg-transparent text-sm outline-none"
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

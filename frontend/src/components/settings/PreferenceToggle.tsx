type Props = {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** A labelled daisyUI toggle row with a one-line explanation. */
export function PreferenceToggle({ label, hint, checked, onChange }: Props) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-box border border-line bg-base-100 p-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-muted">{hint}</span>
      </span>
      <input
        type="checkbox"
        className="toggle toggle-primary mt-0.5 shrink-0"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
    </label>
  );
}

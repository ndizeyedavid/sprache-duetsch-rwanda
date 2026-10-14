import { parseInstallments } from './installment-utils';
export type InstallmentDraft = { amount: string; dueDate: string };
export function InstallmentEditor({ rows, onChange, total }: { rows: InstallmentDraft[]; onChange: (rows: InstallmentDraft[]) => void; total: number }) {
  const { error } = parseInstallments(rows, total);
  return <fieldset className="space-y-3 rounded-box border border-base-300 p-3">
    <legend className="px-1 text-sm font-medium">Tuition payment schedule</legend>
    <p className="text-xs text-muted">Leave empty for one payment due at the intake start. Registration and book fees are separate.</p>
    {rows.map((row, index) => <div key={index} className="flex flex-wrap gap-2">
      <input aria-label={`Instalment ${index + 1} amount`} type="number" min="0.01" step="0.01" value={row.amount} className="input input-sm min-w-0 flex-1" onChange={event => onChange(rows.map((item, i) => i === index ? { ...item, amount: event.target.value } : item))} />
      <input aria-label={`Instalment ${index + 1} due date`} type="date" value={row.dueDate} className="input input-sm" onChange={event => onChange(rows.map((item, i) => i === index ? { ...item, dueDate: event.target.value } : item))} />
      <button type="button" className="btn btn-sm" aria-label={`Remove instalment ${index + 1}`} onClick={() => onChange(rows.filter((_, i) => i !== index))}>Remove</button>
    </div>)}
    <button type="button" className="btn btn-sm" disabled={rows.length >= 24} onClick={() => onChange([...rows, { amount: '', dueDate: '' }])}>Add instalment</button>
    {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
  </fieldset>;
}

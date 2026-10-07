import type { InstallmentDraft } from './InstallmentEditor';
export function parseInstallments(rows: InstallmentDraft[], total: number) {
  if (!rows.length) return { installments: undefined, error: null };
  const installments = rows.map(row => ({ amount: Number(row.amount), dueDate: `${row.dueDate}T00:00:00.000Z` }));
  const invalid = rows.some((row, i) => !row.dueDate || !Number.isFinite(Number(row.amount)) || Number(row.amount) <= 0 || (i > 0 && row.dueDate <= rows[i - 1].dueDate));
  const sum = installments.reduce((value, row) => value + Math.round(row.amount * 100), 0);
  return { installments, error: invalid ? 'Enter positive amounts and increasing due dates.' : sum !== Math.round(total * 100) ? 'Instalments must add up to tuition.' : null };
}

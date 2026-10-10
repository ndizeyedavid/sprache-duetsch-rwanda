/** Transaction fields stay private; catalogue price fields have a scoped exception. */
const financialFields = new Set([
  'finance', 'financeStatus', 'totalFee', 'defaultFee', 'registrationFee', 'bookFee',
  'currency', 'totalDue', 'totalPaid', 'balance', 'discountTotal', 'charges',
  'payments', 'discounts', 'refunds', 'receipts', 'installments', 'amount', 'dueDate',
]);

export function hasFinancialFields(value: unknown, allowed: ReadonlySet<string> = new Set()): boolean {
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, child]) => (financialFields.has(key) && !allowed.has(key)) || hasFinancialFields(child));
}

export function withoutFinancialFields(value: unknown, allowed: ReadonlySet<string> = new Set()): unknown {
  if (isFinancialEvent(value)) return null;
  if (Array.isArray(value)) return value.filter(item => !isFinancialEvent(item)).map(item => withoutFinancialFields(item, allowed));
  if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !financialFields.has(key) || allowed.has(key))
    .map(([key, child]) => [key, withoutFinancialFields(child, allowed)]));
}

/** Course catalogue pricing is academic configuration, not transaction access. */
export const coursePriceFields = new Set(['defaultFee', 'currency']);

function isFinancialEvent(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const type = (value as { type?: string }).type;
  return type === 'PAYMENT' || type === 'PAYMENT_RECEIVED' || type === 'PAYMENT_OVERDUE';
}

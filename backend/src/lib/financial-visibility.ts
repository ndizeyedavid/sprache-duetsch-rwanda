/** Financial fields must never leave the API in academic staff responses. */
const financialFields = new Set([
  'finance', 'financeStatus', 'totalFee', 'defaultFee', 'registrationFee', 'bookFee',
  'currency', 'totalDue', 'totalPaid', 'balance', 'discountTotal', 'charges',
  'payments', 'discounts', 'refunds', 'receipts', 'installments', 'amount', 'dueDate',
]);

export function hasFinancialFields(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, child]) => financialFields.has(key) || hasFinancialFields(child));
}

export function withoutFinancialFields(value: unknown): unknown {
  if (isFinancialEvent(value)) return null;
  if (Array.isArray(value)) return value.filter(item => !isFinancialEvent(item)).map(withoutFinancialFields);
  if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !financialFields.has(key))
    .map(([key, child]) => [key, withoutFinancialFields(child)]));
}

function isFinancialEvent(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const type = (value as { type?: string }).type;
  return type === 'PAYMENT' || type === 'PAYMENT_RECEIVED' || type === 'PAYMENT_OVERDUE';
}

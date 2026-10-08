/** "RWF 25,000" — whole francs, two decimals for other currencies. */
export function currencyLabel(amount: number, currency: string): string {
  const digits = currency === 'RWF' ? 0 : 2;
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

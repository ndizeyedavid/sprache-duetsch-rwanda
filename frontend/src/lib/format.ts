const numberFormat = new Intl.NumberFormat('en-US');

/** Rwandan Franc, e.g. `RWF 45,000`. */
export function rwf(amount: number): string {
  return `RWF ${numberFormat.format(amount)}`;
}

export function num(value: number): string {
  return numberFormat.format(value);
}

/** Short numeric label used on cards, e.g. `43,322` or `1.5k`. */
export function compact(value: number): string {
  if (value >= 1000) {
    const thousands = value / 1000;
    return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`;
  }
  return numberFormat.format(value);
}

export function percent(value: number): string {
  return `${value}%`;
}

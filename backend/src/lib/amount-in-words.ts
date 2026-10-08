const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const SCALES: [number, string][] = [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']];

function underThousand(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds) parts.push(`${ONES[hundreds]} hundred`);
  if (rest) parts.push(rest < 20 ? ONES[rest] : `${TENS[Math.floor(rest / 10)]}${rest % 10 ? `-${ONES[rest % 10]}` : ''}`);
  return parts.join(' and ');
}

/** Whole-number amount in English words, e.g. 25000 → "twenty-five thousand". */
export function numberInWords(value: number): string {
  let n = Math.floor(Math.abs(value));
  if (n === 0) return ONES[0];
  const parts: string[] = [];
  for (const [size, name] of SCALES) {
    if (n >= size) { parts.push(`${underThousand(Math.floor(n / size))} ${name}`); n %= size; }
  }
  if (n) parts.push(underThousand(n));
  return parts.join(' ');
}

const CURRENCY_WORDS: Record<string, [string, string]> = { RWF: ['Rwandan franc', 'Rwandan francs'], USD: ['US dollar', 'US dollars'], EUR: ['euro', 'euros'] };

/** "Twenty-five thousand Rwandan francs" (cents are written as "and 50/100" when present). */
export function amountInWords(amount: number, currency: string): string {
  const whole = Math.floor(Math.abs(amount));
  const cents = Math.round((Math.abs(amount) - whole) * 100);
  const [one, many] = CURRENCY_WORDS[currency] ?? [currency, currency];
  const words = `${numberInWords(whole)} ${whole === 1 ? one : many}${cents ? ` and ${cents}/100` : ''}`;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

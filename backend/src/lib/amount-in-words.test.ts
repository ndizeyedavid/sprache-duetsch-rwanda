import { describe, expect, it } from 'vitest';
import { amountInWords, numberInWords } from './amount-in-words.js';

describe('amount in words', () => {
  it('writes common tuition amounts', () => {
    expect(amountInWords(25000, 'RWF')).toBe('Twenty-five thousand Rwandan francs');
    expect(amountInWords(45000, 'RWF')).toBe('Forty-five thousand Rwandan francs');
    expect(amountInWords(1, 'RWF')).toBe('One Rwandan franc');
  });
  it('handles hundreds, millions and cents', () => {
    expect(numberInWords(1250500)).toBe('one million two hundred and fifty thousand five hundred');
    expect(numberInWords(110)).toBe('one hundred and ten');
    expect(amountInWords(12.5, 'USD')).toBe('Twelve US dollars and 50/100');
  });
});

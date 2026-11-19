import { describe,expect,it } from 'vitest';
import { whatsappNumber } from './utils';

describe('admissions utils', () => {
  it('turns Rwandan phone numbers into WhatsApp numbers', () => {
    expect(whatsappNumber('0788 123 456')).toBe('250788123456');
    expect(whatsappNumber('+250 788-123-456')).toBe('250788123456');
    expect(whatsappNumber('788123456')).toBe('250788123456');
    expect(whatsappNumber('+49 151 23456789')).toBe('4915123456789');
    expect(whatsappNumber('123')).toBeNull();
    expect(whatsappNumber(null)).toBeNull();
  });
});

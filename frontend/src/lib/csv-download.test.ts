import { describe,expect,it } from 'vitest';
import { csvCell,toCsv } from './csv-download';

describe('csv export', () => {
  it('quotes cells with commas, quotes and line breaks', () => {
    expect(csvCell('Kigali, Rwanda')).toBe('"Kigali, Rwanda"');
    expect(csvCell('Say "Hallo"')).toBe('"Say ""Hallo"""');
    expect(csvCell(null)).toBe('');
    expect(toCsv([['a', 1], ['b', 'x\ny']])).toBe('a,1\r\nb,"x\ny"');
  });

  it('keeps spreadsheet formulas from running', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('+1+1')).toBe("'+1+1");
    expect(csvCell('+250 788 000 000')).toBe('+250 788 000 000');
  });
});

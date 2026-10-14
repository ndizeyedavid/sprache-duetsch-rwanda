import { describe,expect,it } from 'vitest';
import { formatRangeInZone,sessionTimeLabels,zonedInputs,zonedToUtcIso } from './session-time';

describe('session time display', () => {
  const start = '2026-10-12T16:00:00.000Z', end = '2026-10-12T18:00:00.000Z';
  it('renders in the session timezone', () => {
    const r = formatRangeInZone(start, end, 'Africa/Kigali');
    expect([r.start, r.end, r.zone]).toEqual(['18:00', '20:00', 'Africa/Kigali']);
  });
  it('adds local time only when the wall clock differs', () => {
    expect(sessionTimeLabels(start, end, 'Africa/Kigali', 'Africa/Kigali').local).toBeNull();
    expect(sessionTimeLabels(start, end, 'Africa/Kigali', 'Africa/Harare').local).toBeNull();
    // Berlin matches Kigali in summer time (UTC+2) but not in winter (UTC+1).
    expect(sessionTimeLabels(start, end, 'Africa/Kigali', 'Europe/Berlin').local).toBeNull();
    expect(sessionTimeLabels('2026-12-01T16:00:00Z', '2026-12-01T18:00:00Z', 'Africa/Kigali', 'Europe/Berlin').local?.start).toBe('17:00');
    expect(sessionTimeLabels(start, end, 'Africa/Kigali', 'America/New_York').local?.start).toBe('12:00');
  });
  it('falls back to the viewer zone for a missing or invalid zone', () => {
    expect(formatRangeInZone(start, end, 'Not/AZone').zone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });
});

describe('zoned inputs round-trip', () => {
  it('reads wall-clock parts in a zone', () => {
    expect(zonedInputs('2026-10-12T16:00:00.000Z', 'Africa/Kigali')).toEqual({ date: '2026-10-12', time: '18:00' });
    expect(zonedInputs('2026-10-12T23:30:00.000Z', 'Africa/Kigali')).toEqual({ date: '2026-10-13', time: '01:30' });
  });
  it('converts a zoned wall-clock time to UTC, across DST', () => {
    expect(zonedToUtcIso('2026-10-12', '18:00', 'Africa/Kigali')).toBe('2026-10-12T16:00:00.000Z');
    expect(zonedToUtcIso('2026-07-01', '09:00', 'Europe/Berlin')).toBe('2026-07-01T07:00:00.000Z');
    expect(zonedToUtcIso('2026-12-01', '09:00', 'Europe/Berlin')).toBe('2026-12-01T08:00:00.000Z');
  });
});

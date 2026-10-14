/** Session times are shown in the session's own timezone, plus the viewer's when that differs. */
export const viewerTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

function validZone(timeZone: string | null | undefined): string {
  if (!timeZone) return viewerTimeZone();
  try { new Intl.DateTimeFormat('en', { timeZone }); return timeZone; } catch { return viewerTimeZone(); }
}

const dateFmt = (timeZone: string) => new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const timeFmt = (timeZone: string) => new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const zoneName = (timeZone: string, at: Date) =>
  new Intl.DateTimeFormat('en-GB', { timeZone, timeZoneName: 'short' }).formatToParts(at).find(p => p.type === 'timeZoneName')?.value ?? '';

export type ZonedRange = { date: string; start: string; end: string; zone: string; label: string };

export function formatRangeInZone(startAt: string, endAt: string, timeZone: string | null | undefined): ZonedRange {
  const zone = validZone(timeZone);
  const start = new Date(startAt), end = new Date(endAt);
  const date = dateFmt(zone).format(start), from = timeFmt(zone).format(start), to = timeFmt(zone).format(end);
  const abbr = zoneName(zone, start);
  return { date, start: from, end: to, zone, label: `${date} · ${from}–${to} ${zone.replaceAll('_', ' ')}${abbr ? ` (${abbr})` : ''}` };
}

/** Session-zone range, and the viewer's local range only when the wall-clock differs. */
export function sessionTimeLabels(startAt: string, endAt: string, timeZone: string | null | undefined, viewerZone = viewerTimeZone()) {
  const session = formatRangeInZone(startAt, endAt, timeZone);
  const local = formatRangeInZone(startAt, endAt, viewerZone);
  const differs = session.date !== local.date || session.start !== local.start || session.end !== local.end;
  return { session, local: differs ? local : null };
}

/** Wall-clock parts of an instant in a zone, for prefilling date/time inputs. */
export function zonedInputs(iso: string, timeZone: string | null | undefined): { date: string; time: string } {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: validZone(timeZone), year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date(iso)).map(p => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

/** Converts a wall-clock date + time in `timeZone` to a UTC ISO string (DST-safe via two passes). */
export function zonedToUtcIso(date: string, time: string, timeZone: string | null | undefined): string {
  const zone = validZone(timeZone);
  const wall = Date.parse(`${date}T${time}:00Z`);
  let guess = wall;
  for (let i = 0; i < 2; i++) {
    const shown = zonedInputs(new Date(guess).toISOString(), zone);
    guess += wall - Date.parse(`${shown.date}T${shown.time}:00Z`);
  }
  return new Date(guess).toISOString();
}

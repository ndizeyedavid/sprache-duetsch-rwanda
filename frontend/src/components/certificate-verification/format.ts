/** Long, unambiguous dates for third parties (dates are stored in UTC). */
export const longDate = (value: string | null) => value
  ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  : '—';

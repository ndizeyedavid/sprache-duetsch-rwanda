export function formatResponse(response: unknown): string {
  if (response === null || response === undefined) return '—';
  if (typeof response === 'string') return response;
  if (Array.isArray(response)) return response.join(', ');
  try { return JSON.stringify(response, null, 1); } catch { return String(response); }
}

export function isAudioResponse(v: unknown): string | null {
  if (typeof v === 'string' && (v.startsWith('http') || v.startsWith('/')) && /\.(mp3|wav|m4a|ogg|webm)(\?|$)/i.test(v)) return v;
  return null;
}

export function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Conversation } from '../../lib/services';

export function dedupeParticipants<T extends { user: { id: string } }>(participants: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const p of participants) {
    if (!seen.has(p.user.id)) {
      seen.add(p.user.id);
      out.push(p);
    }
  }
  return out;
}

export function threadTitle(thread: Conversation, myId: string | null | undefined): string {
  if (thread.title) return thread.title;
  const others = dedupeParticipants(thread.participants).filter((m) => m.user.id !== myId);
  if (others.length === 0) return 'Just me';
  return others.slice(0, 2).map((m) => `${m.user.firstName} ${m.user.lastName}`).join(', ');
}

export function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

export function accentFor(name: string): string {
  const accents = ['bg-brand text-white', 'bg-info text-white', 'bg-success text-white', 'bg-sun text-night', 'bg-coral text-white', 'bg-night text-white'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return accents[hash % accents.length];
}

export function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch { return ''; }
}

export function snippet(body: string, len = 42): string {
  if (body.length <= len) return body;
  return `${body.slice(0, len)}…`;
}

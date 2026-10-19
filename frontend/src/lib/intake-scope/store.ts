import { useSyncExternalStore } from 'react';

/**
 * The intake a staff member is working in, shared by every staff page.
 * Saved per user in localStorage so it survives reloads and sign-ins, and
 * synced across tabs through the `storage` event. `null` means all intakes.
 */
const KEY_PREFIX = 'sparch.intakeScope.';

let userId: string | null = null;
let intakeId: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function read(id: string): string | null {
  try {
    return localStorage.getItem(KEY_PREFIX + id) || null;
  } catch {
    return null;
  }
}

/** Called by the session once we know who is signed in (null on sign-out or for students). */
export function bindIntakeScope(nextUserId: string | null) {
  const next = nextUserId ? read(nextUserId) : null;
  if (nextUserId === userId && next === intakeId) return;
  userId = nextUserId;
  intakeId = next;
  emit();
}

export function setIntakeScope(next: string | null) {
  if (next === intakeId) return;
  intakeId = next;
  if (userId) {
    try {
      if (next) localStorage.setItem(KEY_PREFIX + userId, next);
      else localStorage.removeItem(KEY_PREFIX + userId);
    } catch {
      /* private mode: keep it for this tab only */
    }
  }
  emit();
}

export function getIntakeScope(): string | null {
  return intakeId;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (userId && event.key === KEY_PREFIX + userId) {
      intakeId = event.newValue || null;
      emit();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Current intake scope id (null = all intakes); re-renders on change. */
export function useIntakeScope(): string | null {
  return useSyncExternalStore(subscribe, getIntakeScope, () => null);
}

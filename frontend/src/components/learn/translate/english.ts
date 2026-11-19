import { useSyncExternalStore } from 'react';

// "Show English" switch for lesson text, remembered on this device. Beginners (A1/A2) start with
// English on; B1/B2 start with it off (tap a sentence's EN button, or any word, to see a meaning).
const KEY = 'sparch.showEnglish';
const listeners = new Set<() => void>();

function read(level: string): boolean {
  const saved = localStorage.getItem(`${KEY}.${level}`);
  return saved === null ? /^A/i.test(level) : saved === '1';
}

export function setShowEnglish(level: string, value: boolean) {
  localStorage.setItem(`${KEY}.${level}`, value ? '1' : '0');
  listeners.forEach((listener) => listener());
}

export function useShowEnglish(level: string): boolean {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    () => read(level),
    () => true,
  );
}

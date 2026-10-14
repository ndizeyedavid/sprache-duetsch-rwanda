import type { Item } from './types';

/** Mirrors the server's lenient alternative check (backend accepted-answers.ts). */
const loose = (value: string) => value.toLocaleLowerCase('de').replace(/[….,;]+/g, ' ').replace(/\s+/g, ' ').trim();
const strict = (value: string) => value.trim().toLocaleLowerCase('de');

/** True when the given answer matches the revealed key or any accepted alternative. */
export function isAcceptedAnswer(given: string, item: Item): boolean {
  if (item.answer !== undefined && strict(given) === strict(item.answer)) return true;
  return loose(given) !== '' && (item.answers ?? []).some(answer => typeof answer === 'string' && loose(answer) === loose(given));
}

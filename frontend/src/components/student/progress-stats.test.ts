import { describe,expect,it } from 'vitest';
import { learningStreak,progressNudge } from './progress-stats';

const day = (d: number) => new Date(2026, 9, d, 10);

describe('learningStreak', () => {
  it('counts consecutive days ending today', () => {
    expect(learningStreak([day(17), day(16), day(15), day(13)], day(17))).toBe(3);
  });
  it('still counts a streak that ended yesterday', () => {
    expect(learningStreak([day(16), day(15)], day(17))).toBe(2);
  });
  it('is zero after a missed day', () => {
    expect(learningStreak([day(14)], day(17))).toBe(0);
  });
});

describe('progressNudge', () => {
  it('encourages a first lesson when the week is empty', () => {
    expect(progressNudge({ weekly: 0, streak: 0, left: 10, total: 10 }).heading).toBe('Jeder Tag zählt.');
  });
  it('celebrates a finished course', () => {
    expect(progressNudge({ weekly: 0, streak: 0, left: 0, total: 10 }).heading).toBe('Fantastisch!');
  });
});

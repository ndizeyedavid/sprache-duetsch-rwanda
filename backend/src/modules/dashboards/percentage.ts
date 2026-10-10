import { round2 } from './round2.js';
export const percentage = (numerator: number, denominator: number): number =>
  denominator > 0 ? round2((numerator / denominator) * 100) : 0;

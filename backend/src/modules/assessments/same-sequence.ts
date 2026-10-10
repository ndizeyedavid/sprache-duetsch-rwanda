export const sameSequence = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

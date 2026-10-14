/**
 * Optional alternative answers for structured self-study items (`items[].answers`).
 * Alternatives are compared leniently: case, ellipses ("…", "..."), commas, semicolons
 * and repeated spaces are ignored, so "werde ... anrufen" and "Werde anrufen" match.
 * `answers` is hidden from students by sanitizeActivityConfig until they submit.
 */
const loose = (value: string) =>
  value.toLocaleLowerCase('de').replace(/[….,;]+/g, ' ').replace(/\s+/g, ' ').trim();

export function matchesAlternative(response: string, answers: unknown): boolean {
  if (!Array.isArray(answers)) return false;
  const given = loose(response);
  return given !== '' && answers.some(answer => typeof answer === 'string' && loose(answer) === given);
}

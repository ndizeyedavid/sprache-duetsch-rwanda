/**
 * Staff endpoints whose GET honours `?intakeId=` (kept in sync with the API).
 * Anything not listed here — reference data, the intakes list itself, people,
 * messages, student self-service — is never scoped.
 */
const SCOPED: RegExp[] = [
  /^\/dashboards\/(academic|finance|management|teacher|at-risk|retention|grading-backlog)$/,
  /^\/payments(\/(export|charges|discounts|receipts|reports\/(summary|outstanding)))?$/,
  /^\/students(\/(export|placements\/queue))?$/,
  /^\/(enrollments|classes|sessions|certificates|assignments)$/,
  /^\/attendance\/(summary|export)$/,
  /^\/assessments\/(attempts(\/export)?|skills)$/,
  /^\/content\/activity-submissions$/,
  /^\/applications(\/(summary|waitlist))?$/,
  /^\/payments\/manual\/claims$/,
  /^\/content\/levels\/overview$/,
];

export function isScopedPath(path: string): boolean {
  const clean = '/' + path.replace(/^https?:\/\/[^/]+/, '').replace(/^\/?(api\/)?/, '').replace(/\/$/, '');
  return SCOPED.some((pattern) => pattern.test(clean));
}

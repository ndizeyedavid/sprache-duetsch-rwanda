import type { ApplicationMatches } from '../../lib/admissions-types';

/** List hints: the applicant applied before, or may already be a student under another email. */
export function MatchBadges({ matches }: { matches: ApplicationMatches | null | undefined }) {
  if (!matches) return null;
  const others = matches.students.filter((student) => !student.own);
  const enrolled = others.filter((student) => student.enrollments.some((row) => row.status === 'ACTIVE'));
  const badges: { text: string; title: string; tone: string }[] = [];
  if (matches.applications.length) badges.push({ text: `Applied ${matches.applications.length + 1}×`, tone: 'bg-[#FFF1E0] text-[#9A4A00]',
    title: `Also: ${matches.applications.map((row) => row.reference).join(', ')}` });
  if (enrolled.length) badges.push({ text: `Already a student · ${enrolled[0]?.studentCode}`, tone: 'bg-bad-soft text-bad',
    title: enrolled.map((row) => `${row.studentCode} ${row.name}: ${row.enrollments.map((e) => `${e.level} ${e.status.toLowerCase()}`).join(', ')}`).join('\n') });
  else if (others.length) badges.push({ text: 'Possible duplicate', tone: 'bg-[#FFF1E0] text-[#9A4A00]',
    title: others.map((row) => `${row.studentCode} ${row.name} (same ${row.via.join(', ')})`).join('\n') });
  if (!badges.length) return null;
  return <span className="mt-1 flex flex-wrap gap-1">{badges.map((badge) => (
    <span key={badge.text} title={badge.title} className={`rounded-full px-2 py-0.5 text-[0.625rem] font-semibold ${badge.tone}`}>{badge.text}</span>
  ))}</span>;
}

import { useEffect,useState } from 'react';
import { getMyAssessmentResult } from '../../../lib/services/my-assessment-result';
import type { MyAssessmentResult } from '../../../lib/services/my-assessment-result';

const LABELS: Record<string, string> = {
  LISTENING: 'Hören · Listening', READING: 'Lesen · Reading', WRITING: 'Schreiben · Writing',
  VOCABULARY: 'Wortschatz · Words', GRAMMAR: 'Grammatik · Grammar', SPEAKING: 'Sprechen · Speaking',
};
const points = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);

/** The latest result split by part, like a Goethe result sheet; teacher-marked parts show as pending. */
export function ResultParts({ assessmentId, refreshKey }: { assessmentId: string; refreshKey?: string }) {
  const [result, setResult] = useState<MyAssessmentResult | null>(null);
  useEffect(() => {
    let active = true;
    getMyAssessmentResult(assessmentId).then((value) => { if (active) setResult(value); }).catch(() => { if (active) setResult(null); });
    return () => { active = false; };
  }, [assessmentId, refreshKey]);
  if (!result || result.parts.length < 2) return null;
  return (
    <section className="card border border-base-300 bg-base-100 p-4 sm:p-5" aria-label="Result by part">
      <h3 className="text-base font-bold">Your result by part</h3>
      <p className="text-xs text-muted">Goethe exams report each part separately. Aim for at least 60% in every part.</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {result.parts.map((part) => {
          const percent = part.maxScore ? Math.round(part.score / part.maxScore * 100) : 0;
          return <li key={part.skill} className="rounded-field border border-base-300 p-3">
            <span className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-semibold" lang="de">{LABELS[part.skill] ?? part.skill}</span>
              <span className="text-xs text-muted">{part.pending ? 'Waiting for your teacher' : `${points(part.score)}/${points(part.maxScore)} · ${percent}%`}</span>
            </span>
            <progress className={`progress mt-2 h-1.5 w-full ${part.pending ? '' : percent >= 60 ? 'progress-success' : 'progress-warning'}`} value={part.pending ? 0 : percent} max={100} aria-label={`${LABELS[part.skill] ?? part.skill} score`} />
          </li>;
        })}
      </ul>
    </section>
  );
}

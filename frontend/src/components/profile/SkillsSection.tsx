import { FiZap } from 'react-icons/fi';
import type { SkillStat } from '../../lib/services';
import { humanize } from '../../lib/services';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';
import { SectionState } from './SectionState';
import { skillBand } from './constants';
import { clampPercent,weakestFirst } from './utils';

type Props = { skills: SkillStat[] | null; loading: boolean; error: string | null; onRetry: () => void };

export function SkillsSection({ skills, loading, error, onRetry }: Props) {
  const ranked = weakestFirst(skills ?? []);
  const answers = ranked.reduce((sum, skill) => sum + skill.answered, 0);

  return (
    <Panel>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <FiZap aria-hidden className="text-brand" />My skills
        </h2>
        {answers ? <p className="text-xs text-muted">Weakest first · {answers} graded answers</p> : null}
      </div>

      <div className="mt-4">
        <SectionState
          loading={loading}
          loadingLabel="Loading your skills…"
          error={error}
          onRetry={onRetry}
          isEmpty={!ranked.length}
          emptyTitle="No graded work yet"
          emptyHint="Skill scores appear here once your quizzes and exams are graded."
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {ranked.map((skill) => {
              const band = skillBand(skill.percentage);
              return (
                <li key={skill.skill} className="rounded-box border border-line bg-base-100 p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-semibold">{humanize(skill.skill)}</p>
                    <p className="shrink-0 text-sm font-semibold tabular-nums">{clampPercent(skill.percentage)}%</p>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={skill.percentage} tone={band.tone} />
                  </div>
                  <p className="mt-2 text-xs text-muted tabular-nums">
                    {skill.earned} of {skill.possible} points
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted">{band.hint}</p>
                </li>
              );
            })}
          </ul>
        </SectionState>
      </div>
    </Panel>
  );
}

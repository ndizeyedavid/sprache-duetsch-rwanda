import { FiZap } from 'react-icons/fi';
import type { ApiState } from '../../hooks/useApi';
import { humanize } from '../../lib/services/humanize';
import type { SkillStat } from '../../lib/services/skill-stat';
import { skillBand } from '../profile/constants';
import { SectionState } from '../profile/SectionState';
import { clampPercent,weakestFirst } from '../profile/utils';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';

/** Hören/Lesen/Schreiben/Sprechen/grammar scores from graded work, weakest first so gaps stand out. */
export function SkillBreakdown({ skills }: { skills: ApiState<SkillStat[]> }) {
  const ranked = weakestFirst(skills.data ?? []);

  return (
    <Panel>
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <FiZap aria-hidden className="text-brand" />Skills
      </h2>
      <div className="mt-3">
        <SectionState
          loading={skills.loading}
          loadingLabel="Loading skills…"
          error={skills.error}
          onRetry={skills.refetch}
          isEmpty={!ranked.length}
          emptyTitle="No graded work yet"
          emptyHint="Skill scores appear once quizzes and exams are graded."
        >
          <ul className="space-y-3">
            {ranked.map((skill) => (
              <li key={skill.skill}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium">{humanize(skill.skill)}</span>
                  <span className="font-semibold tabular-nums">{clampPercent(skill.percentage)}%</span>
                </div>
                <ProgressBar value={skill.percentage} tone={skillBand(skill.percentage).tone} className="mt-1.5" />
                <p className="mt-1 text-xs text-muted tabular-nums">{skill.earned} of {skill.possible} points · {skill.answered} answers</p>
              </li>
            ))}
          </ul>
        </SectionState>
      </div>
    </Panel>
  );
}

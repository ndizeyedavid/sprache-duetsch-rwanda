import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyProgressLevel } from '../../lib/services';
import { humanize } from '../../lib/services';
import { ProgressBar } from '../ui/ProgressBar';
import type { Tally } from './utils';
import { clampPercent,levelTally,moduleState,moduleTally,resumeTarget } from './utils';

type Module = MyProgressLevel['modules'][number];

function ModuleRow({ module }: { module: Module }) {
  const tally: Tally = moduleTally(module);
  const state = moduleState(tally);
  const node = state === 'Complete' ? 'bg-brand' : state === 'In Progress' ? 'bg-sun' : 'bg-base-300';

  return (
    <li className="relative">
      <span aria-hidden className={`absolute -left-[27px] top-1.5 size-3 rounded-full border-2 border-base-100 ${node}`} />
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="min-w-0 text-xs">
          <span className="font-medium">{module.title}</span>
          <span className="text-muted"> · {humanize(state)}</span>
        </p>
        <p className="shrink-0 text-xs text-muted tabular-nums">
          {tally.done}/{tally.total}
        </p>
      </div>
    </li>
  );
}

/** One level rendered as a spine: a rail of modules where completed nodes fill in,
 *  so distance travelled is legible without reading a single number.
 *  Staff views pass `showResume={false}`: the "Up next" link opens the student's own course player. */
export function ProgressSpine({ level, showResume = true }: { level: MyProgressLevel; showResume?: boolean }) {
  const percent = clampPercent(level.completionPercentage);
  const tally = levelTally(level);
  const resume = showResume ? resumeTarget(level) : null;
  const modules = [...level.modules].sort((a, b) => a.order - b.order);

  return (
    <article className="rounded-box border border-line bg-base-100 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">{level.level.code}</span>
            <span className="text-sm font-semibold">{level.level.title}</span>
          </p>
          <p className="mt-1.5 text-xs text-muted">
            {level.level.levelLabel} · {tally.done} of {tally.total} lessons done
          </p>
        </div>
        <p className="text-lg font-semibold tabular-nums">{percent}%</p>
      </div>

      <div className="mt-3">
        <ProgressBar value={percent} />
      </div>

      {modules.length ? (
        <ol className="mt-5 space-y-3 border-l-2 border-line pl-5">
          {modules.map((module) => (
            <ModuleRow key={module.id} module={module} />
          ))}
        </ol>
      ) : null}

      {resume ? (
        <Link to={resume.coursePath} className="mt-5 flex items-center justify-between gap-3 rounded-box bg-base-200 px-4 py-3">
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted">
              Up next · {resume.moduleTitle}
            </span>
            <span className="mt-0.5 block truncate text-xs font-semibold">{resume.title}</span>
          </span>
          <FiArrowRight aria-hidden className="shrink-0 text-brand" />
        </Link>
      ) : null}
    </article>
  );
}

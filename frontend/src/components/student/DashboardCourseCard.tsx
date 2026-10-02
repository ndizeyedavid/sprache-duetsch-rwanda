import { Link } from 'react-router-dom';
import { FiBookOpen, FiGrid } from 'react-icons/fi';
import { ProgressBar } from '../ui/ProgressBar';
import { COLORS } from '../../lib/theme';

const PALETTE = [COLORS.brand, '#5b8def', COLORS.sun, COLORS.coral, '#4cbc9a', COLORS.navy];

function colorFor(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

type Props = {
  levelId: string;
  code: string;
  title: string;
  levelLabel: string;
  completion: number;
  completed: number;
  total: number;
};

export function DashboardCourseCard({ code, title, levelLabel, completion, completed, total }: Props) {
  const accent = colorFor(code);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-box border border-line bg-base-100 transition">
      <span className="h-1.5 w-full" style={{ background: accent }} aria-hidden />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: `${accent}14`, color: accent }}>
            <FiBookOpen aria-hidden className="text-xs" />{code} · {levelLabel}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug">{title}</h3>
        <div className="mt-3">
          <ProgressBar value={completion} tone={completion === 100 ? 'brand' : completion > 50 ? 'sun' : 'navy'} />
        </div>
        <p className="mt-2 text-xs text-muted">{completed}/{total} lessons · {completion}%</p>
        <Link to={`/courses/${code.toLowerCase()}/learn`} className="btn btn-sm mt-3 gap-1 rounded-full border-0 text-white hover:opacity-90" style={{ background: accent }}>
          <FiGrid aria-hidden />Continue
        </Link>
      </div>
    </article>
  );
}

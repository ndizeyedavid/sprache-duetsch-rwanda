import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { RadialStat } from '../charts/RadialStat';

type Props = { completion: number; code: string | null; nextTitle: string | null };

export function CourseProgressCard({ completion, code, nextTitle }: Props) {
  return (
    <div className="flex flex-col items-center p-5 text-center">
      <RadialStat value={completion} size={152} className="mx-auto">
        <span className="text-2xl font-bold text-ink">{completion}%</span>
        <span className="mt-1 max-w-28 text-[11px] leading-snug text-muted">of {code ?? 'syllabus'} finished</span>
      </RadialStat>
      <h3 className="mt-3 text-sm font-bold">My progress</h3>
      <p className="mt-1 max-w-[16rem] truncate text-xs text-muted">{nextTitle ? `Next: ${nextTitle}` : 'All lessons completed'}</p>
      <Link to="/courses" className="btn btn-sm mt-3 gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90">
        Open my course <FiArrowRight aria-hidden />
      </Link>
    </div>
  );
}

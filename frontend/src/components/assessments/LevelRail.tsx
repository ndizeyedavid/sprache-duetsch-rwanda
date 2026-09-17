import { FiGrid } from 'react-icons/fi';

type Level = { id: string; code: string; title: string; levelLabel: string };

type Props = {
 levels: Level[];
 selectedId: string | null;
 onSelect: (id: string) => void;
 counts?: Record<string, { questions: number; assessments: number }>;
};

export function LevelRail({ levels, selectedId, onSelect, counts }: Props) {
 if (levels.length === 0) return <p className="text-xs text-muted">No levels assigned.</p>;
 return (
 <div className="flex flex-wrap items-center gap-2">
 <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
 <FiGrid aria-hidden /> Level
 </span>
 <div className="flex flex-wrap gap-2">
 {levels.map((level) => {
 const active = selectedId === level.id;
 const stat = counts?.[level.id];
 return (
 <button
 key={level.id}
 type="button"
 onClick={() => onSelect(level.id)}
 className={`btn btn-sm rounded-full ${active ? 'border-0 bg-brand text-white' : 'border-line bg-base-200'}`}
 >
 {level.code} · {level.levelLabel}
 {stat ? <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[11px] ${active ? 'bg-white/20' : 'bg-base-100'}`}>{stat.questions}Q · {stat.assessments}A</span> : null}
 </button>
 );
 })}
 </div>
 </div>
 );
}

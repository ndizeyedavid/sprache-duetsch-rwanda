import { FiCalendar, FiSearch, FiX } from 'react-icons/fi';
import { DATE_PRESETS } from './constants';
import type { PresetId } from './constants';

type Props = {
  preset: PresetId;
  onPreset: (p: PresetId) => void;
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  classId: string | null;
  onClass: (v: string | null) => void;
  classes: { id: string; name: string; level: { code: string } }[];
  assessmentId: string | null;
  onAssessment: (v: string | null) => void;
  assessments: { id: string; title: string; levelId: string }[];
  q: string;
  onQ: (v: string) => void;
  onClear: () => void;
};

export function ReportsToolbar({ preset, onPreset, from, to, onFrom, onTo, classId, onClass, classes, assessmentId, onAssessment, assessments, q, onQ, onClear }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted"><FiCalendar aria-hidden />Date</span>
        <div className="flex flex-wrap gap-1.5">
          {DATE_PRESETS.map((p) => (
            <button key={p.id} type="button" onClick={() => onPreset(p.id)} className={`btn btn-xs rounded-full ${preset === p.id ? 'border-0 bg-brand text-white' : 'border-line bg-base-100'}`}>{p.label}</button>
          ))}
        </div>
        {preset === 'custom' ? (
          <span className="flex flex-wrap items-center gap-2">
            <input type="date" value={from} onChange={(e) => onFrom(e.currentTarget.value)} className="input input-sm rounded-full border-line bg-base-100 text-xs" />
            <span className="text-xs text-muted">to</span>
            <input type="date" value={to} onChange={(e) => onTo(e.currentTarget.value)} className="input input-sm rounded-full border-line bg-base-100 text-xs" />
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={classId ?? ''} onChange={(e) => onClass(e.currentTarget.value || null)} className="select select-sm rounded-full border-line bg-base-100 text-xs">
          <option value="">All my classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.level.code}</option>)}
        </select>
        <select value={assessmentId ?? ''} onChange={(e) => onAssessment(e.currentTarget.value || null)} className="select select-sm rounded-full border-line bg-base-100 text-xs">
          <option value="">All assessments</option>
          {assessments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
        <div className="relative ml-auto">
          <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => onQ(e.currentTarget.value)} placeholder="Search student or assessment…" className="input input-sm rounded-full border-line bg-base-100 pl-9 pr-8 text-xs" />
          {q ? <button type="button" onClick={() => onQ('')} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"><FiX aria-hidden /></button> : null}
        </div>
        {(preset !== 'all' || classId || assessmentId || q) ? <button type="button" onClick={onClear} className="btn btn-xs rounded-full border-line bg-base-100">Clear filters</button> : null}
      </div>
    </div>
  );
}

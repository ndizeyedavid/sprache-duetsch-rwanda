import { FiAward, FiChevronLeft, FiChevronRight, FiClock, FiUser } from 'react-icons/fi';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../common/PageState';
import { StatusBadge } from '../ui/StatusBadge';
import { humanize } from '../../lib/services';
import { AnswerCard } from './AnswerCard';

type Attempt = {
 id: string; status: string; attemptNumber: number; score: number | null; maxScore: number; passed: boolean | null; feedback: string | null;
 student: { name: string; studentCode: string };
 assessment: { title: string; passMark: unknown; type: string };
 answers: { id: string; prompt: string; type: string; maxPoints: number; response: unknown; isCorrect: boolean | null; pointsAwarded: number; feedback: string | null }[];
};

type Props = {
 selectedId: string | null;
 loading: boolean;
 error: string | null;
 data: Attempt | null;
 onRetry: () => void;
 index: number;
 total: number;
 onPrev: () => void;
 onNext: () => void;
 points: Record<string, string>;
 onPoints: (id: string, v: string) => void;
 feedback: Record<string, string>;
 onFeedback: (id: string, v: string) => void;
 overall: string;
 onOverall: (v: string) => void;
 passed: boolean;
 onPassed: (v: boolean) => void;
 saveError: string | null;
 saved: boolean;
 saving: boolean;
 onSave: () => void;
 onSaveAndNext: () => void;
};

export function GradingDetail({ selectedId, loading, error, data, onRetry, index, total, onPrev, onNext, points, onPoints, feedback, onFeedback, overall, onOverall, passed, onPassed, saveError, saved, saving, onSave, onSaveAndNext }: Props) {
 if (!selectedId) return <EmptyBlock title="Select a submission" hint="Pick a submission on the left — Canvas SpeedGrader opens here. Use ← → to hop between students." />;
 if (loading) return <LoadingBlock label="Loading submission…" />;
 if (error || !data) return <ErrorBlock message={error ?? 'Could not load.'} onRetry={onRetry} />;

 const hasAnswers = data.answers.length > 0;
 const earned = Object.values(points).reduce((acc, v) => acc + (Number(v) || 0), 0);
 const possible = data.maxScore;

 return (
 <div>
 <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-base-100/80 px-5 py-3 backdrop-blur">
 <div className="min-w-0">
 <h2 className="truncate text-sm font-bold leading-tight">{data.assessment.title}</h2>
 <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
 <FiUser aria-hidden />{data.student.name} · {data.student.studentCode} · Attempt {data.attemptNumber}
 <span className="hidden sm:inline">·</span><FiClock aria-hidden />{index + 1} of {total}
 <span className="rounded-full bg-base-200 px-2 py-0.5 font-medium">{humanize(data.assessment.type)} · pass {String(data.assessment.passMark)}%</span>
 </p>
 </div>
 <div className="flex items-center gap-2">
 <button type="button" onClick={onPrev} disabled={index <= 0} className="btn btn-xs btn-circle border-line bg-base-200 disabled:opacity-30" aria-label="Previous"><FiChevronLeft aria-hidden /></button>
 <button type="button" onClick={onNext} disabled={index < 0 || index >= total - 1} className="btn btn-xs btn-circle border-line bg-base-200 disabled:opacity-30" aria-label="Next"><FiChevronRight aria-hidden /></button>
 <StatusBadge status={humanize(data.status)} />
 </div>
 </div>

 <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
 <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-[#B30A00]"><FiAward aria-hidden className="inline" /> {earned} / {possible} pts</span>
 {data.score != null ? <span className="rounded-full bg-base-200 px-3 py-1 font-medium">{data.score} scored</span> : null}
 {data.passed != null ? <span className={`rounded-full px-3 py-1 font-medium ${data.passed ? 'bg-brand-soft text-[#B30A00]' : 'bg-coral-soft text-[#D8482F]'}`}>{data.passed ? 'Passed' : 'Not passed'}</span> : null}
 </div>

 {!hasAnswers ? <EmptyBlock title="No answers" hint="This attempt has no recorded answers." /> : (
 <ul className="space-y-3">
 {data.answers.map((a, i) => (
 <AnswerCard key={a.id} index={i} total={data.answers.length} prompt={a.prompt} response={a.response} maxPoints={a.maxPoints} points={points[a.id] ?? String(a.pointsAwarded)} onPoints={(v) => onPoints(a.id, v)} feedback={feedback[a.id] ?? ''} onFeedback={(v) => onFeedback(a.id, v)} isCorrect={a.isCorrect} />
 ))}
 </ul>
 )}

 <div className="mt-5 space-y-3 rounded-box border border-line bg-base-200/30 p-4">
 <label className="block"><span className="mb-1.5 block text-xs font-semibold">Overall feedback (visible to student)</span><textarea value={overall} onChange={(e) => onOverall(e.currentTarget.value)} placeholder="Great work — watch the dative after 'mit'…" rows={3} className="textarea w-full rounded-box border-line bg-base-100 text-sm" /></label>
 <label className="flex cursor-pointer items-center gap-3 rounded-box border border-line bg-base-100 p-3">
 <input type="checkbox" className="toggle toggle-sm border-line bg-base-200 checked:bg-brand checked:border-brand" checked={passed} onChange={(e) => onPassed(e.currentTarget.checked)} />
 <span className="text-sm font-medium">Mark as passed</span>
 <span className="ml-auto text-xs text-muted">{passed ? 'Student will see Passed' : 'Not passed'}</span>
 </label>
 {saveError ? <p role="alert" className="rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]">{saveError}</p> : null}
 {saved ? <p role="status" className="rounded-box bg-brand-soft px-3 py-2 text-xs font-medium text-[#B30A00]">Grade saved ✓</p> : null}
 <div className="flex flex-wrap gap-2">
 <button type="button" disabled={saving} onClick={onSave} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">{saving ? <span className="loading loading-spinner loading-xs" /> : null}Save grade</button>
 <button type="button" disabled={saving} onClick={onSaveAndNext} className="btn btn-sm rounded-full border-line bg-base-100 disabled:opacity-60">Save & next →</button>
 </div>
 </div>
 </div>
 );
}

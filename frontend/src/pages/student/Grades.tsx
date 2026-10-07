import { useMemo,useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { ProgressionPanel } from '../../components/grades/ProgressionPanel';
import { ResultsHero } from '../../components/grades/ResultsHero';
import { ResultsList } from '../../components/grades/ResultsList';
import { ResultsOverview } from '../../components/grades/ResultsOverview';
import { buildGradeEntries,resultsCsv } from '../../components/grades/result-model';
import { useApi } from '../../hooks/useApi';
import { listMyHomework } from '../../lib/homework';
import { getMyAssessments,getMyAttempts,getMySkills } from '../../lib/services';
const views = [{ key: '', label: 'All work' }, { key: 'ready', label: 'Graded' }, { key: 'waiting', label: 'Awaiting review' }, { key: 'returned', label: 'Needs attention' }];
export function Grades() {
  const [params, setParams] = useSearchParams();
  const progress = params.get('tab') === 'Progression';
  const [status, setStatus] = useState('');
  const [course, setCourse] = useState('');
  const assessments = useApi('my-assessments', getMyAssessments);
  const homework = useApi('homework-grades', listMyHomework);
  const attempts = useApi('my-attempts', getMyAttempts);
  const skills = useApi('my-skills', getMySkills);
  const entries = useMemo(() => buildGradeEntries(assessments.data ?? [], homework.data ?? []), [assessments.data, homework.data]);
  const courses = [...new Set(entries.map(e => e.course))].sort();
  const filtered = entries.filter(e => (!status || e.state === status) && (!course || e.course === course));
  const loading = assessments.loading || homework.loading;
  const error = assessments.error || homework.error;
  function setView(value: boolean) { const next = new URLSearchParams(params); if (value) next.set('tab', 'Progression'); else next.delete('tab'); setParams(next); }
  function download() {
    const url = URL.createObjectURL(new Blob([resultsCsv(filtered)], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'my-results.csv'; link.click(); URL.revokeObjectURL(url);
  }
  return <div className="space-y-5">
    <ResultsHero entries={entries} />
    {loading ? <LoadingBlock label="Loading your results…" /> : error ? <ErrorBlock message={error} onRetry={() => { assessments.refetch(); homework.refetch(); }} /> : <>
      <ResultsOverview entries={entries} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 pb-3"><div className="flex gap-2" aria-label="Grades views">{[{ value: false, label: 'Results & feedback' }, { value: true, label: 'Learning trends' }].map(v => <button key={v.label} aria-pressed={progress === v.value} className={`btn btn-sm ${progress === v.value ? 'btn-neutral' : 'btn-ghost'}`} onClick={() => setView(v.value)}>{v.label}</button>)}</div>{!progress ? <button onClick={download} disabled={!filtered.length} className="btn btn-sm btn-ghost"><FiDownload aria-hidden />Download results</button> : null}</div>
      {progress ? attempts.loading || skills.loading ? <LoadingBlock label="Loading learning trends…" /> : attempts.error || skills.error ? <ErrorBlock message={attempts.error ?? skills.error!} onRetry={() => { attempts.refetch(); skills.refetch(); }} /> : <ProgressionPanel assessments={assessments.data ?? []} attempts={attempts.data ?? []} skills={skills.data ?? null} /> : <>
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2" aria-label="Result status">{views.map(v => <button key={v.key} onClick={() => setStatus(v.key)} aria-pressed={status === v.key} className={`btn btn-sm rounded-full ${status === v.key ? 'btn-neutral' : 'btn-ghost border border-base-300'}`}>{v.label}<span className="opacity-60">{entries.filter(e => !v.key || e.state === v.key).length}</span></button>)}</div>{courses.length > 1 ? <label className="flex items-center gap-2 text-xs">Course<select className="select select-sm w-32" value={course} onChange={e => setCourse(e.target.value)}><option value="">All courses</option>{courses.map(c => <option key={c}>{c}</option>)}</select></label> : null}</div>
        <ResultsList entries={filtered} reset={() => { setStatus(''); setCourse(''); }} />
        <p className="px-1 text-xs leading-5 text-base-content/55">Quiz and exam results show your best score. Homework shows your current reviewed submission. The average is a guide to your progress, not a final course grade.</p>
      </>}
    </>}
  </div>;
}

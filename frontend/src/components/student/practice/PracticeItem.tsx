import { useState } from 'react';
import { submitActivity } from '../../../lib/services';
import { apiErrorMessage } from '../../../lib/api';
import { ExerciseFields } from './ExerciseFields';
import type { Activity, Answer, Config } from './types';
import { useShuffledOptions } from '../../../hooks/useShuffledOptions';

export function PracticeItem({ activity }: { activity: Activity }) {
  const config = (activity.config ?? {}) as Config;
  const options = useShuffledOptions(config.options ?? [], activity.id);
  const previous = activity.mySubmission?.response;
  const initial = config.items ? previous && typeof previous === 'object' && !Array.isArray(previous) ? previous as Record<string, string> : {}
    : typeof previous === 'string' || typeof previous === 'number' ? previous : '';
  const [response, setResponse] = useState<Answer>(initial);
  const [saved, setSaved] = useState(!!activity.mySubmission && (!config.items || typeof previous === 'object'));
  const [correct, setCorrect] = useState<boolean | null>(activity.mySubmission?.isCorrect ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reveal, setReveal] = useState(false);
  const answers = typeof response === 'object' ? response : {};
  const answered = config.items?.filter(item => !!answers[item.id]?.trim()).length ?? 0;
  const ready = config.items ? answered === config.items.length : typeof response === 'string' ? !!response.trim() : typeof response === 'number';
  const auto = !!config.options || !!config.items?.every(item => item.answer !== undefined);
  function change(value: Answer) { setResponse(value); setSaved(false); setReveal(false); }
  async function check() {
    setBusy(true); setError('');
    try { const result = await submitActivity(activity.id, response); setCorrect(result.isCorrect); setSaved(true); }
    catch (e) { setError(apiErrorMessage(e, 'Could not save your answer. Please try again.')); }
    finally { setBusy(false); }
  }
  return <div className="space-y-5">
    <p className="whitespace-pre-wrap text-sm leading-relaxed">{config.instruction || activity.instructions}</p>
    {config.items ? <>
      <p className="text-xs text-base-content/60">{answered} of {config.items.length} answered</p>
      <ExerciseFields group={activity.id} items={config.items} answers={answers} checked={saved} onChange={(id, value) => change({ ...answers, [id]: value })} />
    </> : config.options ? <fieldset className="grid gap-2" aria-label={activity.instructions || activity.title}>
      {options.map(({ value: option, index: i }) => <label key={i} className={`flex cursor-pointer items-center gap-3 rounded-box border p-3 text-sm ${response === i ? 'border-primary bg-base-200' : 'border-base-300'}`}>
        <input className="radio radio-primary radio-sm" type="radio" name={activity.id} checked={response === i} onChange={() => change(i)} />{option}
      </label>)}
    </fieldset> : <textarea className="textarea w-full" rows={5} aria-label={`Your answer to ${activity.title}`} placeholder="Write your answer…" value={typeof response === 'object' ? '' : response} onChange={e => change(e.target.value)} />}
    <div className="flex flex-wrap items-center gap-3 border-t border-base-300 pt-4">
      <button className="btn btn-primary" disabled={busy || !ready} onClick={() => void check()}>{busy ? <span className="loading loading-spinner loading-xs" /> : null}{auto ? 'Check answers' : 'Save response'}</button>
      {saved && config.modelAnswer && !auto ? <button className="btn btn-ghost btn-sm" onClick={() => setReveal(!reveal)}>{reveal ? 'Hide' : 'Compare with'} model answer</button> : null}
      {saved ? <span role="status" className={`text-sm font-semibold ${correct === false ? 'text-error' : 'text-success'}`}>{correct === true ? 'All correct!' : correct === false ? 'Review the marked answers' : 'Response saved'}</span> : null}
    </div>
    {saved && correct === false && config.explanation ? <p className="rounded-box bg-base-200 p-3 text-sm">Answer: {config.explanation}</p> : null}
    {reveal ? <div className="rounded-box bg-base-200 p-4 text-sm leading-relaxed"><p className="mb-2 font-semibold">Model answer</p>{config.modelAnswer}</div> : null}
    {error ? <p role="alert" className="text-sm text-error">{error}</p> : null}
  </div>;
}

import { useEffect, useState } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import {
  getStaffAttempt,
  gradeAttempt,
  humanize,
  isoDate,
  listAttempts,
} from '../../lib/services';

const FILTERS = ['SUBMITTED', 'GRADED', 'IN_PROGRESS'] as const;

function formatResponse(response: unknown): string {
  if (response === null || response === undefined) return '—';
  if (typeof response === 'string') return response;
  return JSON.stringify(response);
}

export function TeacherGrading() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('SUBMITTED');
  const attempts = useApi(`attempts-${filter}`, () => listAttempts(filter));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detail = useApi(
    `attempt-${selectedId ?? 'none'}`,
    () => getStaffAttempt(selectedId ?? ''),
    selectedId !== null,
  );

  const [points, setPoints] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [overall, setOverall] = useState('');
  const [passed, setPassed] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Seed the form whenever a different attempt is opened.
  useEffect(() => {
    const attempt = detail.data;
    if (!attempt) return;
    const answers = attempt.answers ?? [];
    setPoints(Object.fromEntries(answers.map((answer) => [answer.id, String(answer.pointsAwarded)])));
    setFeedback(Object.fromEntries(answers.map((answer) => [answer.id, answer.feedback ?? ''])));
    setOverall(attempt.feedback ?? '');
    setPassed(attempt.passed ?? true);
    setSaved(false);
    setSaveError(null);
  }, [detail.data]);

  function pick(id: string) {
    setSelectedId(id);
  }

  async function handleSave() {
    if (!selectedId || !detail.data) return;
    setSaving(true);
    setSaveError(null);
    try {
      await gradeAttempt(selectedId, {
        answers: (detail.data.answers ?? []).map((answer) => ({
          answerId: answer.id,
          pointsAwarded: Number(points[answer.id] ?? answer.pointsAwarded),
          feedback: feedback[answer.id]?.trim() || undefined,
        })),
        feedback: overall.trim() || undefined,
        passed,
      });
      setSaved(true);
      attempts.refetch();
      detail.refetch();
    } catch (err) {
      setSaveError(apiErrorMessage(err, 'Could not save the grade.'));
    } finally {
      setSaving(false);
    }
  }

  const list = attempts.data ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel className="lg:col-span-1">
        <SectionHeader title="Submissions" />
        <div className="mb-3 flex flex-wrap gap-2">
          {FILTERS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setFilter(name);
                setSelectedId(null);
              }}
              className={`btn btn-xs rounded-full ${
                filter === name ? 'border-0 bg-brand text-white' : 'border-line bg-base-200'
              }`}
            >
              {humanize(name)}
            </button>
          ))}
        </div>
        {attempts.loading ? (
          <LoadingBlock label="Loading submissions…" />
        ) : attempts.error ? (
          <ErrorBlock message={attempts.error} onRetry={attempts.refetch} />
        ) : list.length === 0 ? (
          <EmptyBlock title="Nothing here" hint="Submissions from your students appear here." />
        ) : (
          <ul className="space-y-2">
            {list.map((attempt) => (
              <li key={attempt.id}>
                <button
                  type="button"
                  onClick={() => pick(attempt.id)}
                  className={`w-full rounded-field p-3 text-left transition-colors ${
                    selectedId === attempt.id ? 'bg-brand-tint' : 'bg-base-200 hover:bg-brand-tint/60'
                  }`}
                >
                  <span className="block truncate text-xs font-semibold">{attempt.assessment.title}</span>
                  <span className="mt-1 block text-[11px] text-muted">
                    {attempt.student.user.firstName} {attempt.student.user.lastName} ·{' '}
                    {isoDate(attempt.submittedAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="lg:col-span-2">
        {!selectedId ? (
          <EmptyBlock title="Select a submission" hint="Choose a submission on the left to grade it." />
        ) : detail.loading ? (
          <LoadingBlock label="Loading submission…" />
        ) : detail.error || !detail.data ? (
          <ErrorBlock message={detail.error ?? 'Could not load this submission.'} onRetry={detail.refetch} />
        ) : (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-semibold">{detail.data.assessment.title}</h1>
                <p className="text-xs text-muted">
                  {detail.data.student.name} · {detail.data.student.studentCode} · Attempt{' '}
                  {detail.data.attemptNumber}
                </p>
              </div>
              <StatusBadge status={humanize(detail.data.status)} />
            </div>

            <ul className="mt-4 space-y-3">
              {detail.data.answers.map((answer) => (
                <li key={answer.id} className="rounded-field bg-base-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold leading-snug">{answer.prompt}</p>
                    <span className="shrink-0 text-[11px] text-muted">
                      max {answer.maxPoints}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap rounded-field bg-base-100 px-3 py-2 text-xs">
                    {formatResponse(answer.response)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 text-[11px] text-muted">
                      Points
                      <input
                        type="number"
                        min={0}
                        max={answer.maxPoints}
                        value={points[answer.id] ?? ''}
                        onChange={(event) =>
                          setPoints((current) => ({ ...current, [answer.id]: event.target.value }))
                        }
                        className="input input-xs w-20 rounded-field border-line bg-base-100"
                      />
                    </label>
                    <input
                      value={feedback[answer.id] ?? ''}
                      onChange={(event) =>
                        setFeedback((current) => ({ ...current, [answer.id]: event.target.value }))
                      }
                      placeholder="Feedback for this answer (optional)"
                      className="input input-xs grow rounded-field border-line bg-base-100"
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-3">
              <textarea
                value={overall}
                onChange={(event) => setOverall(event.target.value)}
                placeholder="Overall feedback (optional)"
                rows={2}
                className="textarea w-full rounded-field border-line bg-base-200"
              />
              <label className="flex items-center gap-2 text-xs font-medium">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-success"
                  checked={passed}
                  onChange={(event) => setPassed(event.target.checked)}
                />
                Mark as passed
              </label>
              {saveError ? (
                <p role="alert" className="text-xs font-medium text-error">
                  {saveError}
                </p>
              ) : null}
              {saved ? <p className="text-xs font-medium text-brand">Grade saved.</p> : null}
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
              >
                {saving ? <span className="loading loading-spinner loading-sm" /> : null}
                Save grade
              </button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

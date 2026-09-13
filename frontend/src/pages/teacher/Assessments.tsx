import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import {
  createAssessment,
  createQuestion,
  humanize,
  listAssessments,
  listClasses,
  listLevels,
  listQuestions,
  money,
} from '../../lib/services';

const QUESTION_TYPES = [
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'FILL_BLANK',
  'MATCHING',
  'ORDERING',
  'SHORT_TEXT',
  'ESSAY',
] as const;
const SKILLS = ['VOCABULARY', 'GRAMMAR', 'LISTENING', 'READING', 'WRITING', 'SPEAKING'] as const;
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
const ASSESSMENT_TYPES = ['QUIZ', 'MODULE_TEST', 'FINAL_EXAM', 'PLACEMENT'] as const;

const TABS = ['Question bank', 'Assessments'] as const;

export function TeacherAssessments() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Question bank');
  const classes = useApi('teacher-classes', listClasses);
  const levels = useApi('levels-catalog', listLevels);

  const allowedLevels = useMemo(() => {
    const ids = new Set((classes.data ?? []).map((group) => group.levelId));
    return (levels.data ?? []).filter((level) => ids.has(level.id));
  }, [classes.data, levels.data]);

  if (classes.loading || levels.loading) return <LoadingBlock label="Loading your levels…" />;
  if (classes.error || levels.error) {
    return (
      <ErrorBlock
        message={classes.error ?? levels.error ?? 'Could not load your levels.'}
        onRetry={() => {
          classes.refetch();
          levels.refetch();
        }}
      />
    );
  }
  if (allowedLevels.length === 0) {
    return (
      <EmptyBlock
        title="No levels assigned"
        hint="You can create assessments once an academic admin assigns you to a class group."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Assessments" className="tabs tabs-boxed w-fit bg-base-100 p-1">
          {TABS.map((name) => (
            <button
              key={name}
              role="tab"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={`tab ${tab === name ? 'tab-active' : ''}`}
            >
              {name}
            </button>
          ))}
        </div>
        <Link to="/teacher/grading" className="btn btn-sm rounded-full border-line bg-base-100">
          Go to grading
        </Link>
      </div>

      {tab === 'Question bank' ? (
        <QuestionBank levels={allowedLevels} />
      ) : (
        <AssessmentBuilder levels={allowedLevels} />
      )}
    </div>
  );
}

function QuestionBank({ levels }: { levels: { id: string; code: string; title: string }[] }) {
  const questions = useApi('question-bank', listQuestions);
  const [levelId, setLevelId] = useState(levels[0]?.id ?? '');
  const [type, setType] = useState<string>('SINGLE_CHOICE');
  const [skill, setSkill] = useState<string>('VOCABULARY');
  const [difficulty, setDifficulty] = useState<string>('EASY');
  const [prompt, setPrompt] = useState('');
  const [points, setPoints] = useState('1');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const levelCode = (id: string) => levels.find((level) => level.id === id)?.code ?? '—';

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createQuestion({
        levelId,
        type,
        skill,
        difficulty,
        prompt: prompt.trim(),
        points: Number(points) || 1,
        correctAnswer: correctAnswer.trim() || undefined,
      });
      setPrompt('');
      setCorrectAnswer('');
      questions.refetch();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create the question.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel className="lg:col-span-1">
        <SectionHeader title="New question" />
        <form onSubmit={handleCreate} className="space-y-3">
          <select required value={levelId} onChange={(e) => setLevelId(e.target.value)} className="select w-full rounded-field border-line bg-base-200" aria-label="Level">
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.code} · {level.title}
              </option>
            ))}
          </select>
          <div className="grid gap-3 sm:grid-cols-3">
            <select value={type} onChange={(e) => setType(e.target.value)} className="select w-full rounded-field border-line bg-base-200" aria-label="Question type">
              {QUESTION_TYPES.map((option) => (
                <option key={option} value={option}>
                  {humanize(option)}
                </option>
              ))}
            </select>
            <select value={skill} onChange={(e) => setSkill(e.target.value)} className="select w-full rounded-field border-line bg-base-200" aria-label="Skill">
              {SKILLS.map((option) => (
                <option key={option} value={option}>
                  {humanize(option)}
                </option>
              ))}
            </select>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="select w-full rounded-field border-line bg-base-200" aria-label="Difficulty">
              {DIFFICULTIES.map((option) => (
                <option key={option} value={option}>
                  {humanize(option)}
                </option>
              ))}
            </select>
          </div>
          <textarea required value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Question prompt" rows={3} className="textarea w-full rounded-field border-line bg-base-200" />
          <textarea value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="Correct answer (optional, text or JSON)" rows={2} className="textarea w-full rounded-field border-line bg-base-200" />
          <input value={points} onChange={(e) => setPoints(e.target.value)} inputMode="numeric" placeholder="Points" className="input input-sm w-full rounded-field border-line bg-base-200" />
          {error ? (
            <p role="alert" className="text-xs font-medium text-error">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
            {saving ? <span className="loading loading-spinner loading-sm" /> : 'Add question'}
          </button>
        </form>
      </Panel>

      <Panel className="lg:col-span-2">
        <SectionHeader title={`Questions (${questions.data?.length ?? 0})`} />
        {questions.loading ? (
          <LoadingBlock label="Loading questions…" />
        ) : questions.error ? (
          <ErrorBlock message={questions.error} onRetry={questions.refetch} />
        ) : !questions.data || questions.data.length === 0 ? (
          <EmptyBlock title="No questions yet" hint="Build your question bank with the form." />
        ) : (
          <ul className="space-y-2">
            {questions.data.slice(0, 40).map((question) => (
              <li key={question.id} className="rounded-field bg-base-200 px-3 py-2 text-xs">
                <p className="font-medium leading-snug">{question.prompt}</p>
                <p className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted">
                  <span>{levelCode(question.levelId)}</span>
                  <span>· {humanize(question.type)}</span>
                  <span>· {humanize(question.skill)}</span>
                  <span>· {humanize(question.difficulty)}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function AssessmentBuilder({ levels }: { levels: { id: string; code: string; title: string }[] }) {
  const assessments = useApi('assessments-list', listAssessments);
  const questions = useApi('question-bank', listQuestions);

  const [levelId, setLevelId] = useState(levels[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>('QUIZ');
  const [passMark, setPassMark] = useState('50');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [maxAttempts, setMaxAttempts] = useState('1');
  const [isPublished, setIsPublished] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const levelQuestions = (questions.data ?? []).filter((q) => q.levelId === levelId);
  const levelCode = (id: string) => levels.find((level) => level.id === id)?.code ?? '—';

  function toggle(questionId: string) {
    setSelected((current) => ({ ...current, [questionId]: !current[questionId] }));
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const chosen = levelQuestions
        .filter((q) => selected[q.id])
        .map((q, index) => ({ questionId: q.id, order: index }));
      await createAssessment({
        levelId,
        title: title.trim(),
        type,
        passMark: Number(passMark) || 50,
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        maxAttempts: maxAttempts ? Number(maxAttempts) : undefined,
        isPublished,
        questions: chosen,
      });
      setTitle('');
      setSelected({});
      assessments.refetch();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create the assessment.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel>
        <SectionHeader title="New assessment" />
        <form onSubmit={handleCreate} className="space-y-3">
          <select
            required
            value={levelId}
            onChange={(e) => {
              setLevelId(e.target.value);
              setSelected({});
            }}
            className="select w-full rounded-field border-line bg-base-200"
            aria-label="Level"
          >
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.code} · {level.title}
              </option>
            ))}
          </select>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assessment title" className="input w-full rounded-field border-line bg-base-200" />
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={type} onChange={(e) => setType(e.target.value)} className="select w-full rounded-field border-line bg-base-200" aria-label="Assessment type">
              {ASSESSMENT_TYPES.map((option) => (
                <option key={option} value={option}>
                  {humanize(option)}
                </option>
              ))}
            </select>
            <input value={passMark} onChange={(e) => setPassMark(e.target.value)} inputMode="numeric" placeholder="Pass mark %" className="input input-sm w-full rounded-field border-line bg-base-200" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} inputMode="numeric" placeholder="Duration (minutes)" className="input input-sm w-full rounded-field border-line bg-base-200" />
            <input value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} inputMode="numeric" placeholder="Max attempts" className="input input-sm w-full rounded-field border-line bg-base-200" />
          </div>
          <label className="flex items-center gap-2 text-xs font-medium">
            <input type="checkbox" className="checkbox checkbox-sm" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            Publish immediately
          </label>

          <div className="rounded-field bg-base-200 p-3">
            <p className="text-xs font-semibold">Questions ({levelQuestions.filter((q) => selected[q.id]).length} selected)</p>
            {levelQuestions.length === 0 ? (
              <p className="mt-1 text-[11px] text-muted">No questions for this level yet — add some in the question bank.</p>
            ) : (
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {levelQuestions.map((question) => (
                  <li key={question.id}>
                    <label className="flex items-start gap-2 text-[11px]">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs mt-0.5"
                        checked={Boolean(selected[question.id])}
                        onChange={() => toggle(question.id)}
                      />
                      <span className="line-clamp-2">{question.prompt}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error ? (
            <p role="alert" className="text-xs font-medium text-error">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
            {saving ? <span className="loading loading-spinner loading-sm" /> : 'Create assessment'}
          </button>
        </form>
      </Panel>

      <Panel>
        <SectionHeader title={`Assessments (${assessments.data?.length ?? 0})`} />
        {assessments.loading ? (
          <LoadingBlock label="Loading assessments…" />
        ) : assessments.error ? (
          <ErrorBlock message={assessments.error} onRetry={assessments.refetch} />
        ) : !assessments.data || assessments.data.length === 0 ? (
          <EmptyBlock title="No assessments yet" hint="Create a quiz or exam with the form." />
        ) : (
          <ul className="space-y-2">
            {assessments.data.map((assessment) => (
              <li key={assessment.id} className="rounded-field bg-base-200 px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold">{assessment.title}</p>
                  <StatusBadge status={assessment.isPublished ? 'Active' : 'Pending'} />
                </div>
                <p className="mt-0.5 text-muted">
                  {levelCode(assessment.levelId)} · {humanize(assessment.type)} · pass {money(assessment.passMark)}%
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

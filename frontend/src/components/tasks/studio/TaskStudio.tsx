import { useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiX } from 'react-icons/fi';
import { BookLoader } from '../../common/BookLoader';
import { questionError } from '../../questions/validate';
import type { TaskKind, TaskTarget } from '../task-types';
import type { StepId } from '../task-validation';
import { STEPS } from '../task-validation';
import { useTaskStudio } from '../useTaskStudio';
import { BasicsStep } from './BasicsStep';
import { ContentStep } from './ContentStep';
import { SettingsStep } from './SettingsStep';
import { StudentPreview } from './StudentPreview';
import { StudioSteps } from './StudioSteps';
import { StudioTopBar } from './StudioTopBar';

type Option = { id: string; label: string };
type Props = { target: TaskTarget; scope: { classGroupId?: string; levelId?: string }; classes: Option[]; levels: Option[]; onClose: () => void; onSaved: (saved: { id: string; kind: TaskKind }) => void };

/** One editor for homework, quizzes and tests: three steps on the left, the student view on the right. */
export function TaskStudio({ target, scope, classes, levels, onClose, onSaved }: Props) {
  const studio = useTaskStudio(target, scope);
  const { draft: d, issues } = studio;
  const [step, setStep] = useState<StepId>(target.id ? 'content' : 'basics');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const index = STEPS.findIndex(s => s.id === step);
  const scopeLabel = (d.kind === 'HOMEWORK' ? classes.find(c => c.id === d.classGroupId) : levels.find(l => l.id === d.levelId))?.label ?? '';

  function back() { if (!studio.dirty || confirm('Leave without saving your changes?')) onClose(); }
  async function save(publish: boolean) {
    const needed = publish ? STEPS.find(s => issues[s.id])
      : issues.basics ? STEPS[0] : issues.settings ? STEPS[2] : d.questions.length && questionError(d.questions) ? STEPS[1] : undefined;
    if (needed) { setStep(needed.id); setNotice(issues[needed.id] ?? questionError(d.questions) ?? ''); return; }
    setNotice('');
    const saved = await studio.save(publish ? 'PUBLISHED' : d.status);
    if (saved) onSaved(saved);
  }

  if (studio.loading) return <BookLoader label="Opening…" className="min-h-[50vh]" />;
  const preview = <StudentPreview draft={d} scopeLabel={scopeLabel} />;
  return (
    <div className="space-y-4">
      <StudioTopBar draft={d} existing={!!target.id} dirty={studio.dirty} saving={studio.saving} onBack={back} onPreview={() => setPreviewOpen(true)} onSave={publish => void save(publish)} />
      <StudioSteps step={step} issues={issues} onStep={setStep} homeworkWork={d.kind === 'HOMEWORK' && d.homeworkMode === 'work'} />
      {studio.locked ? <p className="rounded-box bg-warning/10 px-4 py-2 text-xs">Students have submitted work, so the instructions and questions are locked. Dates and limits can still change.</p> : null}
      {notice || studio.error ? <p role="alert" className="rounded-box bg-error/10 px-4 py-2 text-sm text-error">{notice || studio.error}</p> : null}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]">
        <section className="card min-w-0 border border-base-300/70 bg-base-100 p-4 sm:p-6">
          {step === 'basics' ? <BasicsStep draft={d} update={studio.update} switchKind={studio.switchKind} creating={!target.id} locked={studio.locked} classes={classes} levels={levels} />
            : step === 'content' ? <ContentStep draft={d} update={studio.update} locked={studio.locked} />
            : <SettingsStep draft={d} update={studio.update} locked={studio.locked} existing={!!target.id} />}
          <div className="mt-6 flex justify-between border-t border-base-300/70 pt-4">
            <button type="button" className="btn btn-ghost btn-sm rounded-full" disabled={index === 0} onClick={() => setStep(STEPS[index - 1].id)}><FiArrowLeft aria-hidden />Back</button>
            {index < STEPS.length - 1 ? <button type="button" className="btn btn-sm rounded-full" onClick={() => setStep(STEPS[index + 1].id)}>Next<FiArrowRight aria-hidden /></button> : null}
          </div>
        </section>
        <aside className="sticky top-4 hidden max-h-[calc(100vh-2rem)] overflow-y-auto rounded-box bg-base-200/60 p-3 xl:block" aria-label="Student preview">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted">Student view</p>{preview}
        </aside>
      </div>
      {previewOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-base-200 p-4 xl:hidden" role="dialog" aria-label="Student preview">
          <div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold">Student view</p><button type="button" className="btn btn-ghost btn-sm btn-square" aria-label="Close preview" onClick={() => setPreviewOpen(false)}><FiX aria-hidden /></button></div>
          {preview}
        </div>
      ) : null}
    </div>
  );
}

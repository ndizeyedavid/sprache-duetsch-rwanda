import { FiCheck } from 'react-icons/fi';
import type { StepId, StepIssues } from '../task-validation';
import { STEPS } from '../task-validation';


/** Three tabs; each shows a tick when done or a dot when something is missing. */
export function StudioSteps({ step, issues, onStep, homeworkWork }: { step: StepId; issues: StepIssues; onStep: (s: StepId) => void; homeworkWork: boolean }) {
  return (
    <nav aria-label="Steps" className="flex gap-1 overflow-x-auto">
      {STEPS.map((s, i) => {
        const active = step === s.id; const issue = issues[s.id];
        return (
          <button key={s.id} type="button" onClick={() => onStep(s.id)} aria-current={active ? 'step' : undefined} title={issue ?? 'Ready'}
            className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${active ? 'bg-brand/10 font-semibold text-brand' : 'text-base-content/70 hover:bg-base-200'}`}>
            <span className={`grid size-5 place-items-center rounded-full text-[11px] ${issue ? 'bg-base-200 text-base-content/70' : 'bg-success text-white'}`}>{issue ? i + 1 : <FiCheck aria-hidden />}</span>
            {s.id === 'content' && homeworkWork ? 'Task' : s.label}
          </button>
        );
      })}
    </nav>
  );
}

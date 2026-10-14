import type { PlacementSession } from '../../lib/services/placement-types';
import { isAnswered } from './utils';

type Props = {
  questions: PlacementSession['questions'];
  responses: Record<string, unknown>;
  index: number;
  onJump: (index: number) => void;
};

/** Collapsible grid to jump between questions; answered ones are filled. */
export function PlacementNavigator({ questions, responses, index, onJump }: Props) {
  return (
    <details className="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
      <summary className="collapse-title min-h-0 py-3 text-xs font-semibold">All questions</summary>
      <div className="collapse-content">
        <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
          {questions.map((item, position) => {
            const done = isAnswered(responses[item.question.id]);
            const active = position === index;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onJump(position)}
                aria-current={active ? 'step' : undefined}
                aria-label={`Question ${position + 1}${done ? ', answered' : ''}`}
                className={`btn btn-xs h-8 rounded-field px-0 ${active ? 'btn-primary' : done ? 'btn-neutral' : 'btn-ghost border-base-300'}`}
              >
                {position + 1}
              </button>
            );
          })}
        </div>
      </div>
    </details>
  );
}

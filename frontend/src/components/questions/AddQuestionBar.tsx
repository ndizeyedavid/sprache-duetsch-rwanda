import { QUESTION_TYPES } from './question-meta';

/** One click adds a question of that type and opens it. */
export function AddQuestionBar({ onAdd, disabled, autoOnly = false }: { onAdd: (type: string) => void; disabled: boolean; autoOnly?: boolean }) {
  return (
    <div className="rounded-box border border-dashed border-base-300 p-3">
      <p className="mb-2 text-xs font-medium text-muted">Add a question</p>
      <div className="flex flex-wrap gap-1.5">
        {QUESTION_TYPES.filter(([, meta]) => !autoOnly || meta.auto).map(([type, meta]) => {
          const Icon = meta.icon;
          return (
            <button key={type} type="button" disabled={disabled} onClick={() => onAdd(type)} title={meta.label}
              className="btn btn-sm gap-1.5 rounded-full border-base-300 bg-base-100 font-normal hover:border-brand hover:text-brand">
              <Icon aria-hidden />{meta.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

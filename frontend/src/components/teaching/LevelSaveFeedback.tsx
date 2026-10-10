import { FiCheck } from 'react-icons/fi';

type LevelSaveFeedbackProps = {
  error: string | null;
  saved: boolean;
  /** Class name parsed out of the 409 that blocked a level removal. */
  conflictClass: string | null;
  onRevealClass: (className: string) => void;
};

/** Save outcome for one teacher card: why it failed, what unblocks it, or confirmation. */
export function LevelSaveFeedback({
  error,
  saved,
  conflictClass,
  onRevealClass,
}: LevelSaveFeedbackProps) {
  if (error) {
    return (
      <div role="alert" className="alert alert-error alert-vertical mt-4 rounded-box py-2.5 sm:alert-horizontal">
        <span className="text-xs leading-5">{error}</span>
        {conflictClass ? (
          <button
            type="button"
            onClick={() => onRevealClass(conflictClass)}
            className="btn btn-sm shrink-0 rounded-full"
          >
            Go to {conflictClass}
          </button>
        ) : null}
      </div>
    );
  }

  if (saved) {
    return (
      <p role="status" className="mt-4 flex items-center gap-1.5 text-xs font-medium text-brand">
        <FiCheck aria-hidden />
        Teaching levels saved.
      </p>
    );
  }

  return null;
}
import { FiAlertTriangle,FiCheckCircle,FiX } from 'react-icons/fi';

type Props = {
  error: string | null;
  success: string | null;
  onDismiss: () => void;
};

/** Single feedback channel for enrolment writes, announced politely either way. */
export function EnrolFeedback({ error, success, onDismiss }: Props) {
  if (!error && !success) return null;

  return (
    <div aria-live="polite">
      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-field bg-coral text-error-content px-4 py-3">
          <FiAlertTriangle aria-hidden className="mt-0.5 shrink-0 text-[#D8482F]" />
          <p className="grow text-xs font-medium text-[#D8482F]">{error}</p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="btn btn-ghost btn-xs btn-circle text-[#D8482F]"
          >
            <FiX aria-hidden />
          </button>
        </div>
      ) : success ? (
        <div className="flex items-start gap-3 rounded-field bg-brand text-primary-content px-4 py-3">
          <FiCheckCircle aria-hidden className="mt-0.5 shrink-0 text-brand" />
          <p className="grow text-xs font-medium text-[#B30A00]">{success}</p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss confirmation"
            className="btn btn-ghost btn-xs btn-circle text-[#B30A00]"
          >
            <FiX aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
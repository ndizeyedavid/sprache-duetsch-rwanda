import { useState } from 'react';
import { FiArrowLeft,FiArrowRight,FiCheck } from 'react-icons/fi';

type Props = {
  index: number;
  total: number;
  answered: number;
  submitting: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onExit: () => void;
};

/** Previous / next navigation; the last step asks for confirmation before submitting. */
export function PlacementSubmitBar({ index, total, answered, submitting, onPrev, onNext, onSubmit, onExit }: Props) {
  const [confirming, setConfirming] = useState(false);
  const last = index >= total - 1;
  const missing = total - answered;

  if (confirming) {
    return (
      <div role="alertdialog" aria-labelledby="placement-confirm" className="alert alert-vertical items-stretch gap-3 sm:alert-horizontal">
        <p id="placement-confirm" className="text-sm">
          {missing > 0 ? `${missing} question${missing === 1 ? ' is' : 's are'} unanswered. ` : 'All questions answered. '}
          Submit now? You cannot change answers afterwards.
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-sm btn-ghost rounded-full" disabled={submitting} onClick={() => setConfirming(false)}>
            Keep working
          </button>
          <button type="button" className="btn btn-sm btn-primary gap-1 rounded-full" disabled={submitting} onClick={onSubmit}>
            {submitting ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />}
            Submit test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex gap-2">
        <button type="button" className="btn btn-sm rounded-full" onClick={onPrev} disabled={index === 0 || submitting}>
          <FiArrowLeft aria-hidden />
          <span className="hidden sm:inline">Previous</span>
        </button>
        <button type="button" className="btn btn-sm btn-ghost rounded-full" onClick={onExit} disabled={submitting}>
          Save &amp; exit
        </button>
      </div>
      {last ? (
        <button type="button" className="btn btn-sm btn-primary gap-1 rounded-full" onClick={() => setConfirming(true)} disabled={submitting}>
          Review &amp; submit
          <FiCheck aria-hidden />
        </button>
      ) : (
        <button type="button" className="btn btn-sm btn-primary gap-1 rounded-full" onClick={onNext} disabled={submitting}>
          Next
          <FiArrowRight aria-hidden />
        </button>
      )}
    </div>
  );
}

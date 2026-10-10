import { FiInbox } from 'react-icons/fi';

type Props = {
  filtered: boolean;
  onClear: () => void;
};

/** Empty register vs. empty result set get different explanations and next steps. */
export function StaffEmpty({ filtered, onClear }: Props) {
  return (
    <div className="flex flex-col items-center rounded-box border border-dashed border-line bg-base-100 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-field bg-base-200 text-muted">
        <FiInbox aria-hidden size={22} />
      </span>
      <p className="mt-4 text-sm font-semibold text-ink">
        {filtered ? 'No staff accounts match these filters' : 'No staff accounts yet'}
      </p>
      <p className="mt-1 max-w-sm text-xs text-muted">
        {filtered
          ? 'Widen the search or clear the filters to see the whole staff directory.'
          : 'Add the first account from the button above. Students are created at registration, not here.'}
      </p>
      {filtered ? (
        <button
          type="button"
          onClick={onClear}
          className="btn btn-sm mt-4 rounded-full border-0 bg-brand text-white hover:bg-night"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
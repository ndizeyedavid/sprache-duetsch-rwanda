import { FiPlus } from 'react-icons/fi';
import { SearchField } from '../ui/SearchField';
import { SegmentedControl } from '../ui/SegmentedControl';
import { PRIMARY_BTN } from './constants';

type IntakeToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  phase: string;
  onPhaseChange: (value: string) => void;
  onCreate: () => void;
};

const PHASE_OPTIONS = ['All', 'Upcoming', 'Enrolling', 'Running', 'Ended'];

/** Toolbar: search by code/name, filter by lifecycle phase, and open the create form. */
export function IntakeToolbar({
  query,
  onQueryChange,
  phase,
  onPhaseChange,
  onCreate,
}: IntakeToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchField
          value={query}
          onChange={onQueryChange}
          ariaLabel="Search intakes by code or name"
          placeholder="Search code or name…"
          className="sm:max-w-xs"
        />
        <button type="button" onClick={onCreate} className={`${PRIMARY_BTN} sm:ml-auto`}>
          <FiPlus aria-hidden /> New intake
        </button>
      </div>
      <div>
        <SegmentedControl
          options={PHASE_OPTIONS}
          value={phase}
          onChange={onPhaseChange}
          ariaLabel="Filter by phase"
          wrap
        />
      </div>
    </div>
  );
}

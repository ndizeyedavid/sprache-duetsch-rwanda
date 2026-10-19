import { SearchField } from '../ui/SearchField';
import { SegmentedControl } from '../ui/SegmentedControl';
import type { RegistrationFilter } from './types';

type IntakeToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  filter: RegistrationFilter;
  onFilterChange: (value: RegistrationFilter) => void;
};

const FILTERS: RegistrationFilter[] = ['All', 'Open', 'Closed', 'Archived'];

/** Toolbar: search by code/name and filter by registration status (creating lives in the page hero). */
export function IntakeToolbar({ query, onQueryChange, filter, onFilterChange }: IntakeToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <SearchField
        value={query}
        onChange={onQueryChange}
        ariaLabel="Search intakes by code or name"
        placeholder="Search code or name…"
        className="lg:max-w-xs"
      />
      <SegmentedControl
        options={FILTERS}
        value={filter}
        onChange={(value) => onFilterChange(value as RegistrationFilter)}
        ariaLabel="Filter by registration"
        wrap
      />
    </div>
  );
}

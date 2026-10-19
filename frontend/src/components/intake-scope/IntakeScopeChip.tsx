import { FiCalendar,FiX } from 'react-icons/fi';
import { useIntakeScopeDetails } from './intake-context';
import { dateRange } from './utils';

/** Hero chip telling staff which intake the page below is filtered to. */
export function IntakeScopeChip() {
  const { enabled, selected, select } = useIntakeScopeDetails();
  if (!enabled) return null;
  if (!selected) {
    return <span className="hero-chip"><FiCalendar aria-hidden />All intakes</span>;
  }
  return (
    <span className="hero-chip hero-chip-solid" title={dateRange(selected)}>
      <FiCalendar aria-hidden />{selected.name}
      <button type="button" onClick={() => select(null)} aria-label="Show all intakes" className="-mr-1 rounded-full p-0.5 hover:bg-base-200">
        <FiX aria-hidden />
      </button>
    </span>
  );
}

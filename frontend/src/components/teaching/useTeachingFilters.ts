import { useCallback,useMemo,useState } from 'react';
import type { ClassGroupItem } from '../../lib/services';
import type { TeachingTeacher } from '../../lib/teaching';
import { EMPTY_TEACHING_FILTERS } from './constants';
import type { Coverage,CoverageFilter,TeachingFilters } from './types';
import type { RevealClass } from './useRevealClass';
import {
filterClasses,
filterTeachers,
hasTeachingFilters,
teachingCoverage,
} from './utils';

type TeachingFilterState = {
  filters: TeachingFilters;
  coverage: CoverageFilter;
  coverageStats: Coverage;
  visibleTeachers: TeachingTeacher[];
  visibleClasses: ClassGroupItem[];
  hasFilters: boolean;
  filter: (patch: Partial<TeachingFilters>) => void;
  setCoverage: (next: CoverageFilter) => void;
  reset: () => void;
};

/**
 * Owns every piece of filter state on this page so the page component stays a
 * layout shell. Search, level and account status narrow the teacher cards and
 * the class roster together; the coverage filter narrows the roster alone.
 */
export function useTeachingFilters(
  teachers: TeachingTeacher[],
  classes: ClassGroupItem[],
  reveal: RevealClass,
): TeachingFilterState {
  const [filters, setFilters] = useState<TeachingFilters>(EMPTY_TEACHING_FILTERS);
  const [coverage, setCoverageState] = useState<CoverageFilter>('');

  const reset = useCallback(() => {
    setFilters(EMPTY_TEACHING_FILTERS);
    setCoverageState('');
    reveal.clear();
  }, [reveal]);

  const filter = useCallback(
    (patch: Partial<TeachingFilters>) => {
      setFilters((current) => ({ ...current, ...patch }));
      reveal.clear();
    },
    [reveal],
  );

  const setCoverage = useCallback(
    (next: CoverageFilter) => {
      setCoverageState(next);
      reveal.clear();
    },
    [reveal],
  );

  const coverageStats = useMemo(() => teachingCoverage(teachers, classes), [teachers, classes]);
  const visibleTeachers = useMemo(() => filterTeachers(teachers, filters), [teachers, filters]);
  const visibleClasses = useMemo(
    () => filterClasses(classes, teachers, filters, coverage),
    [classes, teachers, filters, coverage],
  );

  return {
    filters,
    coverage,
    coverageStats,
    visibleTeachers,
    visibleClasses,
    hasFilters: hasTeachingFilters(filters) || Boolean(coverage),
    filter,
    setCoverage,
    reset,
  };
}
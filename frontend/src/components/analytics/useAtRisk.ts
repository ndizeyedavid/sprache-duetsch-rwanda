import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import type { AtRiskFilter } from '../../lib/analytics-api';
import { getAtRiskStudents } from '../../lib/analytics-api';

type Filter = Omit<AtRiskFilter, 'page' | 'pageSize'>;

/** At-risk list with its own page; changing the filter goes back to page 1. */
export function useAtRisk(filter: Filter, pageSize = 10) {
  const filterKey = JSON.stringify(filter);
  const [page, setPage] = useState(1);
  const [pageFor, setPageFor] = useState(filterKey);
  if (pageFor !== filterKey) { setPageFor(filterKey); setPage(1); }
  const current = pageFor === filterKey ? page : 1;
  const state = useApi(`at-risk-${filterKey}-${current}-${pageSize}`, () => getAtRiskStudents({ ...filter, page: current, pageSize }));
  return { state, page: current, setPage };
}

export type AtRiskState = ReturnType<typeof useAtRisk>;

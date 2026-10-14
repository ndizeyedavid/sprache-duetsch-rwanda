import { useCallback,useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getApplicationSummary,getWaitlist,listApplications } from '../../lib/admissions-api';
import type { ApplicationFilters,ApplicationStatus } from '../../lib/admissions-types';
import { PAGE_SIZE } from './constants';

export type QueueFilters = Omit<ApplicationFilters, 'status' | 'page' | 'pageSize'>;

export const EMPTY_QUEUE_FILTERS: QueueFilters = { search: '', source: '', levelId: '', intakeId: '', campusId: '', from: '', to: '' };

/** Tab + filters + page for the admissions queue, with per-status counts and the waitlist board. */
export function useApplicationQueue() {
  const [tab, setTabState] = useState<ApplicationStatus>('NEW');
  const [filters, setFiltersState] = useState<QueueFilters>(EMPTY_QUEUE_FILTERS);
  const [page, setPage] = useState(1);
  const filterKey = JSON.stringify(filters);
  const onWaitlist = tab === 'WAITLISTED';

  const list = useApi(
    `applications:${tab}:${page}:${filterKey}`,
    () => listApplications({ ...filters, status: tab, page, pageSize: PAGE_SIZE }),
    !onWaitlist,
  );
  const summary = useApi(`applications-summary:${filterKey}`, () => getApplicationSummary(filters));
  const waitlist = useApi(
    `applications-waitlist:${filters.levelId ?? ''}:${filters.intakeId ?? ''}`,
    () => getWaitlist({ levelId: filters.levelId, intakeId: filters.intakeId }),
    onWaitlist,
  );

  const setTab = useCallback((next: ApplicationStatus) => { setTabState(next); setPage(1); }, []);
  const setFilters = useCallback((patch: Partial<QueueFilters>) => {
    setFiltersState((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);
  const clearFilters = useCallback(() => { setFiltersState(EMPTY_QUEUE_FILTERS); setPage(1); }, []);

  const { refetch: refetchList } = list;
  const { refetch: refetchSummary } = summary;
  const { refetch: refetchWaitlist } = waitlist;
  const refresh = useCallback(() => { refetchList(); refetchSummary(); refetchWaitlist(); }, [refetchList, refetchSummary, refetchWaitlist]);

  return { tab, setTab, filters, setFilters, clearFilters, page, setPage, list, summary, waitlist, refresh };
}

export type ApplicationQueue = ReturnType<typeof useApplicationQueue>;

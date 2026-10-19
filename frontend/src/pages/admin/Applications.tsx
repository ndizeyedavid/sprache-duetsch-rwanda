import { useState } from 'react';
import { ApplicationDrawer } from '../../components/admissions/ApplicationDrawer';
import { ApplicationFiltersBar } from '../../components/admissions/ApplicationFiltersBar';
import { ApplicationsHero } from '../../components/admissions/ApplicationsHero';
import { ApplicationList } from '../../components/admissions/ApplicationList';
import { ApplicationTabs } from '../../components/admissions/ApplicationTabs';
import { WaitlistBoard } from '../../components/admissions/WaitlistBoard';
import { useAdmissionRefs } from '../../components/admissions/useAdmissionRefs';
import { useApplicationQueue } from '../../components/admissions/useApplicationQueue';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { Pagination } from '../../components/ui/Pagination';
import { Panel } from '../../components/ui/Panel';

/** Admissions queue: website + catalogue applications, decisions, waitlist and account creation. */
export function AdminApplications() {
  const queue = useApplicationQueue();
  const refs = useAdmissionRefs();
  const [openId, setOpenId] = useState<string | null>(null);
  const onWaitlist = queue.tab === 'WAITLISTED';
  const state = onWaitlist ? queue.waitlist : queue.list;
  const meta = queue.list.data?.meta;

  return (
    <div className="space-y-5">
      <ApplicationsHero counts={queue.summary.data} refreshing={state.fetching} onRefresh={queue.refresh} />
      <Panel>
        <ApplicationTabs active={queue.tab} counts={queue.summary.data} onChange={queue.setTab} />
        <div className="mt-4">
          <ApplicationFiltersBar filters={queue.filters} refs={refs} onChange={queue.setFilters} onClear={queue.clearFilters} compact={onWaitlist} />
        </div>

        <div className="mt-4">
          {state.loading || state.stale ? (
            <LoadingBlock label="Loading applications…" />
          ) : state.error ? (
            <ErrorBlock message={state.error} onRetry={queue.refresh} />
          ) : onWaitlist ? (
            queue.waitlist.data?.length ? <WaitlistBoard groups={queue.waitlist.data} onOpen={setOpenId} />
              : <EmptyBlock title="Nobody is on the waitlist" hint="Waitlisted applicants appear here, ranked first come, first served." />
          ) : queue.list.data?.data.length ? (
            <>
              <ApplicationList rows={queue.list.data.data} onOpen={setOpenId} />
              {meta && meta.totalPages > 1 ? (
                <Pagination page={meta.page} pages={meta.totalPages} total={meta.total}
                  from={(meta.page - 1) * meta.pageSize + 1} to={Math.min(meta.page * meta.pageSize, meta.total)} onChange={queue.setPage} />
              ) : null}
            </>
          ) : (
            <EmptyBlock title="No applications here" hint="Try another tab or clear the filters." />
          )}
        </div>
      </Panel>

      <ApplicationDrawer id={openId} refs={refs} onClose={() => setOpenId(null)} onChanged={queue.refresh} />
    </div>
  );
}

import { useState } from 'react';
import { FiExternalLink,FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { ApplicationDrawer } from '../../components/admissions/ApplicationDrawer';
import { ApplicationFiltersBar } from '../../components/admissions/ApplicationFiltersBar';
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
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold sm:text-lg">Admissions</h2>
            <p className="text-xs text-muted">Applications from the website and the public course catalogue.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/catalog" target="_blank" className="btn btn-sm gap-2 rounded-full border-line bg-base-200 text-xs">
              <FiExternalLink aria-hidden /> Public catalogue
            </Link>
            <button type="button" onClick={queue.refresh} disabled={state.fetching} className="btn btn-sm gap-2 rounded-full border-line bg-base-200 text-xs">
              {state.fetching ? <span className="loading loading-spinner loading-xs" /> : <FiRefreshCw aria-hidden />} Refresh
            </button>
          </div>
        </div>

        <div className="mt-4">
          <ApplicationTabs active={queue.tab} counts={queue.summary.data} onChange={queue.setTab} />
        </div>
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

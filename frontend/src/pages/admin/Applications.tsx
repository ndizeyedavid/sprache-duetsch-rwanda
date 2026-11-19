import { useState } from 'react';
import { ApplicationBulkBar } from '../../components/admissions/ApplicationBulkBar';
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
import { bulkApplicationStatus,exportApplications } from '../../lib/admissions-api';
import type { ApplicationStatus } from '../../lib/admissions-types';
import { apiErrorMessage } from '../../lib/api';

type Notice = { tone: 'ok' | 'error'; text: string };

/** Admissions queue: website + catalogue applications, one-step enrolment, duplicates, bulk decisions and export. */
export function AdminApplications() {
  const queue = useApplicationQueue();
  const refs = useAdmissionRefs();
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const onWaitlist = queue.tab === 'WAITLISTED';
  const state = onWaitlist ? queue.waitlist : queue.list;
  const meta = queue.list.data?.meta;

  function select(ids: string[], checked: boolean) {
    setSelected((current) => { const next = new Set(current); for (const id of ids) { if (checked) next.add(id); else next.delete(id); } return next; });
  }
  async function bulk(status: ApplicationStatus, reason?: string) {
    setBusy(true); setNotice(null);
    try {
      const result = await bulkApplicationStatus([...selected], status, reason);
      const skipped = result.skipped.map((row) => `${row.reference}: ${row.reason}`).join('; ');
      setNotice({ tone: result.skipped.length ? 'error' : 'ok', text: `${result.changed.length} updated.${skipped ? ` Not changed: ${skipped}` : ''}` });
      setSelected(new Set());
      queue.refresh();
    } catch (err) { setNotice({ tone: 'error', text: apiErrorMessage(err, 'The bulk change did not go through.') }); }
    finally { setBusy(false); }
  }
  async function exportCsv() {
    try { await exportApplications({ ...queue.filters, status: onWaitlist ? 'WAITLISTED' : queue.tab }); }
    catch (err) { setNotice({ tone: 'error', text: apiErrorMessage(err, 'The export did not work. Try again.') }); }
  }

  return (
    <div className="space-y-5">
      <ApplicationsHero counts={queue.summary.data} refreshing={state.fetching} onRefresh={queue.refresh} onExport={() => void exportCsv()} />
      <Panel>
        <ApplicationTabs active={queue.tab} counts={queue.summary.data} onChange={(tab) => { setSelected(new Set()); queue.setTab(tab); }} />
        <div className="mt-4">
          <ApplicationFiltersBar filters={queue.filters} refs={refs} onChange={queue.setFilters} onClear={queue.clearFilters} compact={onWaitlist} />
        </div>
        {notice ? <p role={notice.tone === 'error' ? 'alert' : 'status'} className={`mt-3 rounded-field px-3 py-2 text-xs ${notice.tone === 'error' ? 'bg-coral text-[#AE3522]' : 'bg-brand-soft text-brand-soft-ink'}`}>{notice.text}</p> : null}
        {!onWaitlist ? <div className="mt-3"><ApplicationBulkBar count={selected.size} busy={busy} onApply={(status, reason) => void bulk(status, reason)} onClear={() => setSelected(new Set())} /></div> : null}

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
              <ApplicationList rows={queue.list.data.data} onOpen={setOpenId} selected={selected} onSelect={select} />
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

      <ApplicationDrawer id={openId} refs={refs} onClose={() => setOpenId(null)} onChanged={queue.refresh} onOpen={setOpenId} />
    </div>
  );
}

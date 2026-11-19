import { FiDownload,FiExternalLink,FiInbox,FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { ApplicationStatus } from '../../lib/admissions-types';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

type Props = {
  counts: Record<ApplicationStatus, number> | null;
  refreshing: boolean;
  onRefresh: () => void;
  /** Spreadsheet of the current tab with the current filters. */
  onExport: () => void;
};

/** Red page header for the admissions queue: what is waiting, plus catalogue and refresh. */
export function ApplicationsHero({ counts, refreshing, onRefresh, onExport }: Props) {
  return (
    <PageHero
      eyebrow="Admissions"
      icon={FiInbox}
      title="Applications"
      description="Applications from the website and the public course catalogue. Spot duplicates, enrol in one step, manage the waitlist and export the list."
      art="admissions"
      scoped
      meta={
        counts ? (
          <>
            <span className={`hero-chip ${counts.NEW ? 'hero-chip-solid' : ''}`}>{counts.NEW} new</span>
            <span className="hero-chip">{counts.REVIEWING} in review</span>
            <span className="hero-chip">{counts.WAITLISTED} on the waitlist</span>
          </>
        ) : null
      }
      actions={
        <>
          <Link to="/catalog" target="_blank" className={heroAction}>
            <FiExternalLink aria-hidden /> Public catalogue
          </Link>
          <button type="button" onClick={onExport} className={heroGhost}>
            <FiDownload aria-hidden /> Export CSV
          </button>
          <button type="button" onClick={onRefresh} disabled={refreshing} className={`${heroGhost} disabled:border-primary-content disabled:bg-transparent disabled:text-primary-content`}>
            {refreshing ? <span className="loading loading-spinner loading-xs" /> : <FiRefreshCw aria-hidden />} Refresh
          </button>
        </>
      }
    />
  );
}

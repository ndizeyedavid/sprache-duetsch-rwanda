import { useState } from 'react';
import type { ApplicationDetail,ApplicationStatus } from '../../lib/admissions-types';
import { ACTION_LABEL,ACTION_STYLE } from './constants';

type Props = { app: ApplicationDetail; busy: boolean; onTransition: (status: ApplicationStatus, reason?: string) => void };

/** Next allowed steps come from the API, so the buttons always match the server's rules. */
export function ApplicationDecision({ app, busy, onTransition }: Props) {
  const [reason, setReason] = useState('');
  const [missing, setMissing] = useState<ApplicationStatus | null>(null);
  if (app.transitions.length === 0) return <p className="text-xs text-muted">This application is closed. No further decisions.</p>;

  const needsReason = app.transitions.some((option) => option.reasonRequired);

  function choose(status: ApplicationStatus, reasonRequired: boolean) {
    if (reasonRequired && !reason.trim()) {
      setMissing(status);
      return;
    }
    setMissing(null);
    onTransition(status, reason.trim() || undefined);
    setReason('');
  }

  return (
    <section className="rounded-box border border-line bg-base-100 p-4">
      <h3 className="text-sm font-semibold">Decision</h3>
      <label className="mt-3 block">
        <span className="mb-1 block text-xs text-muted">
          Note{needsReason ? ' — required to waitlist, reject or withdraw' : ' (optional)'}. Staff only; the applicant is not shown it.
        </span>
        <textarea rows={2} maxLength={500} value={reason} className="textarea textarea-sm w-full rounded-field border-line bg-base-200"
          onChange={(event) => { const next = event.currentTarget.value; setReason(next); }} />
      </label>
      {missing ? <p role="alert" className="mt-1 text-xs font-medium text-error">Add a note before choosing “{ACTION_LABEL[missing]}”.</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {app.transitions.map((option) => {
          const blocked = option.status === 'ENROLLED' && !app.studentId;
          return (
            <button key={option.status} type="button" disabled={busy || blocked} title={blocked ? 'Create the student account first' : undefined}
              className={`btn btn-sm rounded-full text-xs ${ACTION_STYLE[option.status] ?? 'border-line bg-base-200'}`}
              onClick={() => choose(option.status, option.reasonRequired)}>
              {option.status === 'ACCEPTED' && app.status === 'WAITLISTED' ? 'Offer seat' : ACTION_LABEL[option.status]}
            </button>
          );
        })}
      </div>
    </section>
  );
}

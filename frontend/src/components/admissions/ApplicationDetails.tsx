import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ApplicationDetail } from '../../lib/admissions-types';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { SHIFT_LABEL,SOURCE_LABEL } from './constants';
import { courseLabel,dateTime,fullName } from './utils';

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm">{children}</dd>
    </div>
  );
}

const text = (value: unknown): string | null => (typeof value === 'string' && value.trim() ? value : null);

/** Read-only facts: who, what they asked for, where it came from and the last decision. */
export function ApplicationDetails({ app }: { app: ApplicationDetail }) {
  const raw = app.rawPayload ?? {};
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-lg font-semibold">{fullName(app)}</p>
          <p className="text-xs text-muted">{SOURCE_LABEL[app.source]} · received {dateTime(app.createdAt)}</p>
        </div>
        <ApplicationStatusBadge status={app.status} />
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Item label="Email"><a className="text-brand hover:underline" href={`mailto:${app.email}`}>{app.email}</a></Item>
        <Item label="Phone">{app.phone ? <a className="text-brand hover:underline" href={`tel:${app.phone}`}>{app.phone}</a> : '—'}</Item>
        <Item label="Course">{courseLabel(app)}</Item>
        <Item label="Campus · shift">{app.campus?.name ?? 'No preference'} · {app.shift ? SHIFT_LABEL[app.shift] : 'any shift'}</Item>
        {text(raw.schedule) ? <Item label="Schedule (website)">{text(raw.schedule)}</Item> : null}
        {app.experience ? <Item label="German so far">{app.experience}</Item> : null}
        {app.message ? <div className="sm:col-span-2"><Item label="Message"><span className="whitespace-pre-line">{app.message}</span></Item></div> : null}
        {app.waitlistPosition ? <Item label="Waitlist position">#{app.waitlistPosition}</Item> : null}
        {app.decisionReason ? <Item label="Last decision note">{app.decisionReason}</Item> : null}
        {app.reviewedBy && app.reviewedAt ? <Item label="Last reviewed">{fullName(app.reviewedBy)} · {dateTime(app.reviewedAt)}</Item> : null}
        {app.student ? (
          <Item label="Student record">
            <Link className="text-brand hover:underline" to={`/admin/students/${app.student.id}`}>{app.student.studentCode}</Link>
            <span className="text-muted"> · {app.student.status.toLowerCase()}</span>
          </Item>
        ) : null}
      </dl>
    </section>
  );
}

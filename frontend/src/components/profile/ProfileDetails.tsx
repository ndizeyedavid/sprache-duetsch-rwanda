import { FiArrowRight,FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyProfile } from '../../lib/services';
import { Panel } from '../ui/Panel';
import { recordRows } from './utils';

type Props = { profile: MyProfile; onOpenDocuments: () => void };

export function ProfileDetails({ profile, onOpenDocuments }: Props) {
  const rows = recordRows(profile);

  return (
    <Panel>
      <h2 className="text-base font-semibold">Student record</h2>

      <dl className="mt-4 space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-base-200">
              <row.icon aria-hidden className="text-muted" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-muted">{row.label}</dt>
              <dd className="mt-0.5 text-sm font-medium">{row.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {profile.enrollments.length ? (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-xs font-semibold">My classes</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {profile.enrollments.map((enrolment, index) => (
              <li
                key={enrolment.id ?? index}
                className="rounded-full bg-base-200 px-3 py-1.5 text-xs font-medium"
              >
                {enrolment.level.code}
                {enrolment.classGroup ? ` · ${enrolment.classGroup.name}` : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 space-y-2">
        <Link to="/grades" className="flex items-center justify-between rounded-box bg-base-200 px-4 py-3 text-xs font-semibold">
          Grades &amp; feedback<FiArrowRight aria-hidden className="text-brand" />
        </Link>
        <button
          type="button"
          onClick={onOpenDocuments}
          className="flex w-full items-center justify-between rounded-box border border-line px-4 py-3 text-left text-xs font-semibold"
        >
          <span className="flex items-center gap-2">
            <FiFileText aria-hidden className="text-brand" />
            Certificates &amp; receipts
          </span>
          <FiArrowRight aria-hidden className="text-brand" />
        </button>
      </div>
    </Panel>
  );
}

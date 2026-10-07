import { FiEdit3,FiMail,FiPhone } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyProfile } from '../../lib/services';
import { humanize } from '../../lib/services';
import { initials } from './utils';

type Props = { profile: MyProfile };

/**
 * Signature block: a solid navy band carrying a lanyard-style badge (photo over
 * a solid CEFR code bar) so a student recognises their own record at a glance.
 */
export function ProfileIdentity({ profile }: Props) {
  const { user, studentCode, currentLevel } = profile;
  const name = `${user.firstName} ${user.lastName}`;

  return (
    <section className="card overflow-hidden border border-line bg-base-100">
      <div className="bg-night p-5 text-white sm:p-7">
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="shrink-0">
            <div className={`avatar ${user.avatarUrl ? '' : 'avatar-placeholder'}`}>
              <div className="size-20 rounded-t-box bg-white text-night sm:size-24">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={`${name} profile photo`} width={96} height={96} className="size-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold sm:text-3xl">{initials(user.firstName, user.lastName)}</span>
                )}
              </div>
            </div>
            <div className="mt-px rounded-b-box bg-brand px-2 py-1 text-center text-xs font-bold text-white">
              {currentLevel?.code ?? '—'}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-200">Student record</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-night">
                {humanize(user.status)}
              </span>
              {currentLevel ? (
                <span className="rounded-full border border-white px-3 py-1 text-xs font-semibold text-white">
                  {currentLevel.title}
                </span>
              ) : (
                <span className="rounded-full border border-white px-3 py-1 text-xs font-semibold text-white">
                  No level enrolled yet
                </span>
              )}
              <span className="font-mono text-xs text-base-200">{studentCode}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-4 sm:px-7">
        <dl className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <dt className="sr-only">Email</dt>
            <FiMail aria-hidden className="shrink-0 text-muted" />
            <dd className="min-w-0 break-all font-medium">{user.email}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Phone</dt>
            <FiPhone aria-hidden className="shrink-0 text-muted" />
            <dd className="font-medium">{user.phone ?? 'No phone added'}</dd>
          </div>
        </dl>
        <Link to="/settings" className="btn btn-primary btn-sm gap-2 rounded-full">
          <FiEdit3 aria-hidden />Edit profile
        </Link>
      </div>
    </section>
  );
}

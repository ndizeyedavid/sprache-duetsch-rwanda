import { useState } from 'react';
import type { FormEvent } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { SearchField } from '../../components/ui/SearchField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { useSession } from '../../lib/session';
import {
  createUser,
  humanize,
  listUsers,
  resetUserPassword,
  updateUser,
  updateUserRole,
} from '../../lib/services';

// Academic admins may create teaching/academic accounts; only a super admin
// may mint finance or super-admin accounts (least privilege).
const ACADEMIC_ROLE_OPTIONS = ['TEACHER', 'ACADEMIC_ADMIN'] as const;
const SUPER_ROLE_OPTIONS = ['TEACHER', 'ACADEMIC_ADMIN', 'FINANCE_ADMIN', 'SUPER_ADMIN'] as const;

export function AdminPeople() {
  const { user: me } = useSession();
  const isSuper = me?.role === 'SUPER_ADMIN';
  const roleOptions = isSuper ? SUPER_ROLE_OPTIONS : ACADEMIC_ROLE_OPTIONS;

  const [roleFilter, setRoleFilter] = useState<string>('TEACHER');
  const users = useApi(`admin-users-${roleFilter}`, () =>
    listUsers({ role: roleFilter || undefined }),
  );
  const [query, setQuery] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('TEACHER');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState<Record<string, string>>({});

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role,
      });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      users.refetch();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not create the account.'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(id: string, status: string) {
    setFormError(null);
    try {
      await updateUser(id, { status: status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' });
      users.refetch();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not update the account.'));
    }
  }

  async function changeRole(id: string, nextRole: string) {
    setFormError(null);
    try {
      await updateUserRole(id, nextRole);
      users.refetch();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not change the role.'));
    }
  }

  async function resetPassword(id: string) {
    const value = (newPassword[id] ?? '').trim();
    if (value.length < 8) {
      setFormError('New password must be at least 8 characters.');
      return;
    }
    setFormError(null);
    try {
      await resetUserPassword(id, value);
      setNewPassword((current) => ({ ...current, [id]: '' }));
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not reset the password.'));
    }
  }

  const rows = (users.data ?? []).filter((row) =>
    query.trim()
      ? `${row.firstName} ${row.lastName} ${row.email}`.toLowerCase().includes(query.trim().toLowerCase())
      : true,
  );

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel className="lg:col-span-1">
        <SectionHeader title="Add a staff account" />
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="input input-sm w-full rounded-field border-line bg-base-200" />
            <input required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="input input-sm w-full rounded-field border-line bg-base-200" />
          </div>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input input-sm w-full rounded-field border-line bg-base-200" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="input input-sm w-full rounded-field border-line bg-base-200" />
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={role} onChange={(e) => setRole(e.target.value)} className="select w-full rounded-field border-line bg-base-200" aria-label="Role">
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {humanize(option)}
                </option>
              ))}
            </select>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Temp password" className="input input-sm w-full rounded-field border-line bg-base-200" />
          </div>
          {formError ? (
            <p role="alert" className="text-xs font-medium text-error">
              {formError}
            </p>
          ) : null}
          <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
            {saving ? <span className="loading loading-spinner loading-sm" /> : 'Create account'}
          </button>
        </form>
      </Panel>

      <Panel className="lg:col-span-2">
        <SectionHeader title={`Accounts (${rows.length})`} />
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select select-sm rounded-field border-line bg-base-200"
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            {(['TEACHER', 'ACADEMIC_ADMIN', 'FINANCE_ADMIN', 'SUPER_ADMIN'] as const).map((option) => (
              <option key={option} value={option}>
                {humanize(option)}
              </option>
            ))}
          </select>
          <SearchField value={query} onChange={setQuery} ariaLabel="Search accounts" placeholder="Search name or email…" />
        </div>

        {users.loading ? (
          <LoadingBlock label="Loading accounts…" />
        ) : users.error ? (
          <ErrorBlock message={users.error} onRetry={users.refetch} />
        ) : rows.length === 0 ? (
          <EmptyBlock title="No accounts found" hint="Create a teacher or staff account with the form." />
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.id} className="rounded-field bg-base-200 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">
                      {row.firstName} {row.lastName}
                    </p>
                    <p className="truncate text-[11px] text-muted">{row.email}</p>
                  </div>
                  <span className="flex items-center gap-2">
                    <StatusBadge status={humanize(row.role)} />
                    <StatusBadge status={humanize(row.status)} />
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleStatus(row.id, row.status)}
                    className="btn btn-xs rounded-full border-line bg-base-100"
                  >
                    {row.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </button>
                  {isSuper ? (
                    <>
                      <select
                        value={row.role}
                        onChange={(e) => changeRole(row.id, e.target.value)}
                        className="select select-xs rounded-field border-line bg-base-100"
                        aria-label={`Role for ${row.email}`}
                      >
                        {(['STUDENT', 'TEACHER', 'ACADEMIC_ADMIN', 'FINANCE_ADMIN', 'SUPER_ADMIN'] as const).map((option) => (
                          <option key={option} value={option}>
                            {humanize(option)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="password"
                        value={newPassword[row.id] ?? ''}
                        onChange={(e) => setNewPassword((c) => ({ ...c, [row.id]: e.target.value }))}
                        placeholder="New password"
                        aria-label={`New password for ${row.email}`}
                        className="input input-xs w-32 rounded-field border-line bg-base-100"
                      />
                      <button type="button" onClick={() => resetPassword(row.id)} className="btn btn-xs rounded-full border-line bg-base-100">
                        Reset password
                      </button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { rwf } from '../../lib/format';
import {
  createCampus,
  createIntake,
  isoDate,
  listCampusesFull,
  listIntakesFull,
  money,
} from '../../lib/services';

const TABS = ['Campuses', 'Intakes'] as const;

export function AdminOrganisation() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Campuses');

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Organisation" className="tabs tabs-boxed w-fit bg-base-100 p-1">
        {TABS.map((name) => (
          <button
            key={name}
            role="tab"
            aria-selected={tab === name}
            onClick={() => setTab(name)}
            className={`tab ${tab === name ? 'tab-active' : ''}`}
          >
            {name}
          </button>
        ))}
      </div>

      {tab === 'Campuses' ? <CampusesTab /> : <IntakesTab />}
    </div>
  );
}

function CampusesTab() {
  const campuses = useApi('campuses-full', listCampusesFull);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await createCampus({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });
      setCode('');
      setName('');
      setAddress('');
      setPhone('');
      setEmail('');
      campuses.refetch();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not create the campus.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel>
        <SectionHeader title="Add a campus" />
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (REMERA)" className="input input-sm w-full rounded-field border-line bg-base-200" />
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="input input-sm w-full rounded-field border-line bg-base-200" />
          </div>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="input input-sm w-full rounded-field border-line bg-base-200" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="input input-sm w-full rounded-field border-line bg-base-200" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input input-sm w-full rounded-field border-line bg-base-200" />
          </div>
          {formError ? (
            <p role="alert" className="text-xs font-medium text-error">
              {formError}
            </p>
          ) : null}
          <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
            Create campus
          </button>
        </form>
      </Panel>

      <Panel>
        <SectionHeader title={`Campuses (${campuses.data?.length ?? 0})`} />
        {campuses.loading ? (
          <LoadingBlock label="Loading campuses…" />
        ) : campuses.error ? (
          <ErrorBlock message={campuses.error} onRetry={campuses.refetch} />
        ) : !campuses.data || campuses.data.length === 0 ? (
          <EmptyBlock title="No campuses yet" />
        ) : (
          <ul className="space-y-2">
            {campuses.data.map((campus) => (
              <li key={campus.id} className="rounded-field bg-base-200 px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{campus.name}</p>
                  <StatusBadge status={campus.isActive ? 'Active' : 'Inactive'} />
                </div>
                <p className="mt-0.5 text-muted">
                  {campus.code}
                  {campus.address ? ` · ${campus.address}` : ''}
                </p>
                {campus.phone ? <p className="text-muted">{campus.phone}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function IntakesTab() {
  const intakes = useApi('intakes-full', listIntakesFull);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationFee, setRegistrationFee] = useState('');
  const [bookFee, setBookFee] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (new Date(endDate) <= new Date(startDate)) {
      setFormError('End date must be after the start date.');
      return;
    }
    setSaving(true);
    try {
      await createIntake({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        registrationFee: registrationFee ? Number(registrationFee) : undefined,
        bookFee: bookFee ? Number(bookFee) : undefined,
      });
      setCode('');
      setName('');
      setStartDate('');
      setEndDate('');
      setRegistrationFee('');
      setBookFee('');
      intakes.refetch();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not create the intake.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel>
        <SectionHeader title="Add an intake" />
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (2026-09)" className="input input-sm w-full rounded-field border-line bg-base-200" />
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="input input-sm w-full rounded-field border-line bg-base-200" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Starts</span>
              <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input input-sm w-full rounded-field border-line bg-base-200" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Ends</span>
              <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input input-sm w-full rounded-field border-line bg-base-200" />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={registrationFee} onChange={(e) => setRegistrationFee(e.target.value)} inputMode="numeric" placeholder="Registration fee" className="input input-sm w-full rounded-field border-line bg-base-200" />
            <input value={bookFee} onChange={(e) => setBookFee(e.target.value)} inputMode="numeric" placeholder="Book fee" className="input input-sm w-full rounded-field border-line bg-base-200" />
          </div>
          {formError ? (
            <p role="alert" className="text-xs font-medium text-error">
              {formError}
            </p>
          ) : null}
          <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
            Create intake
          </button>
        </form>
      </Panel>

      <Panel>
        <SectionHeader title={`Intakes (${intakes.data?.length ?? 0})`} />
        {intakes.loading ? (
          <LoadingBlock label="Loading intakes…" />
        ) : intakes.error ? (
          <ErrorBlock message={intakes.error} onRetry={intakes.refetch} />
        ) : !intakes.data || intakes.data.length === 0 ? (
          <EmptyBlock title="No intakes yet" />
        ) : (
          <ul className="space-y-2">
            {intakes.data.map((intake) => (
              <li key={intake.id} className="rounded-field bg-base-200 px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{intake.name}</p>
                  <StatusBadge status={intake.isActive ? 'Active' : 'Inactive'} />
                </div>
                <p className="mt-0.5 text-muted">
                  {intake.code} · {isoDate(intake.startDate)} → {isoDate(intake.endDate)}
                </p>
                <p className="text-muted">
                  Registration {rwf(money(intake.registrationFee))} · Books {rwf(money(intake.bookFee))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

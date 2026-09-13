import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { apiErrorMessage, apiGet } from '../../lib/api';
import { register } from '../../lib/auth-store';
import type { RegisterPayload } from '../../lib/auth-store';

const SHIFTS = [
  { label: 'Morning', value: 'MORNING' },
  { label: 'Afternoon', value: 'AFTERNOON' },
  { label: 'Evening', value: 'EVENING' },
  { label: 'Weekend', value: 'WEEKEND' },
] as const;

type ReferenceItem = { id: string; code: string; name?: string; title?: string };

function labelOf(item: ReferenceItem): string {
  return item.name ?? item.title ?? item.code;
}

export function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [campusId, setCampusId] = useState('');
  const [shift, setShift] = useState<RegisterPayload['shift']>('EVENING');
  const [intakeId, setIntakeId] = useState('');
  const [intendedLevelId, setIntendedLevelId] = useState('');

  const [campuses, setCampuses] = useState<ReferenceItem[]>([]);
  const [intakes, setIntakes] = useState<ReferenceItem[]>([]);
  const [levels, setLevels] = useState<ReferenceItem[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadReferences() {
      try {
        const [campusList, intakeList, levelList] = await Promise.all([
          apiGet<ReferenceItem[]>('/campuses?pageSize=100'),
          apiGet<ReferenceItem[]>('/intakes?pageSize=100'),
          apiGet<ReferenceItem[]>('/levels?pageSize=100'),
        ]);
        if (cancelled) return;
        setCampuses(campusList);
        setIntakes(intakeList);
        setLevels(levelList);
        setCampusId((current) => current || campusList[0]?.id || '');
      } catch (err) {
        if (!cancelled) {
          setError(apiErrorMessage(err, 'Could not load campuses. Try again later.'));
        }
      } finally {
        if (!cancelled) setLoadingRefs(false);
      }
    }
    void loadReferences();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      setError('Please enter your full name.');
      return;
    }
    if (!campusId) {
      setError('Please choose a campus.');
      return;
    }

    setPending(true);
    try {
      await register({
        firstName: parts[0] ?? '',
        lastName: parts.length > 1 ? parts.slice(1).join(' ') : parts[0] ?? '',
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        campusId,
        shift,
        intakeId: intakeId || undefined,
        intendedLevelId: intendedLevelId || undefined,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create your account. Please try again.'));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card-shadow rounded-box bg-base-100 p-6 sm:p-8">
      <h1 className="text-xl font-semibold sm:text-2xl">Create your account</h1>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        We generate your student ID automatically. A placement test confirms your German level, and an academic admin
        can override it.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Full name</span>
            <input
              type="text"
              required
              autoComplete="name"
              placeholder="Nella Ishimwe"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="input w-full rounded-field border-line bg-base-200"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Phone</span>
            <input
              type="tel"
              required
              autoComplete="tel"
              placeholder="+250 788 000 000"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="input w-full rounded-field border-line bg-base-200"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="name@sparch.rw"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input w-full rounded-field border-line bg-base-200"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Campus</span>
          <select
            required
            value={campusId}
            disabled={loadingRefs}
            onChange={(event) => setCampusId(event.target.value)}
            className="select w-full rounded-field border-line bg-base-200"
          >
            {loadingRefs ? (
              <option>Loading campuses…</option>
            ) : (
              campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {labelOf(campus)}
                </option>
              ))
            )}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Shift</span>
            <select
              required
              value={shift}
              onChange={(event) => setShift(event.target.value as RegisterPayload['shift'])}
              className="select w-full rounded-field border-line bg-base-200"
            >
              {SHIFTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Intake</span>
            <select
              value={intakeId}
              disabled={loadingRefs}
              onChange={(event) => setIntakeId(event.target.value)}
              className="select w-full rounded-field border-line bg-base-200"
            >
              <option value="">No preference</option>
              {intakes.map((intake) => (
                <option key={intake.id} value={intake.id}>
                  {labelOf(intake)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Intended level</span>
            <select
              value={intendedLevelId}
              disabled={loadingRefs}
              onChange={(event) => setIntendedLevelId(event.target.value)}
              className="select w-full rounded-field border-line bg-base-200"
            >
              <option value="">Decide later</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {labelOf(level)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input w-full rounded-field border-line bg-base-200"
          />
        </label>

        {error ? (
          <p role="alert" className="text-xs font-medium text-error">
            {error}
          </p>
        ) : null}

        <label className="flex items-start gap-2 text-xs text-muted">
          <input type="checkbox" required className="checkbox checkbox-sm mt-0.5" />
          <span>
            I agree to the fee policy: total due, installments and receipts are tracked on my student account.
          </span>
        </label>

        <button
          type="submit"
          disabled={pending || loadingRefs}
          className="btn w-full gap-2 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
        >
          {pending ? <span className="loading loading-spinner loading-sm" /> : null}
          Create account
          <FiArrowRight aria-hidden />
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        Already enrolled?{' '}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const CAMPUSES = ['Kigali — Remera', 'Kigali — Nyamirambo', 'Musanze'];
const SHIFTS = ['Morning', 'Afternoon', 'Evening', 'Weekend'];
const INTAKES = ['Intake 01 / 2026', 'Intake 02 / 2026', 'Intake 03 / 2026'];
const LEVELS = ['A1', 'A2', 'B1', 'B2'];

export function Register() {
  return (
    <section className="card-shadow rounded-box bg-base-100 p-6 sm:p-8">
      <h1 className="text-xl font-semibold sm:text-2xl">Create your account</h1>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        We generate your student ID automatically. A placement test confirms your German level, and an academic admin
        can override it.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Full name</span>
            <input
              type="text"
              required
              autoComplete="name"
              placeholder="Nella Ishimwe"
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
            className="input w-full rounded-field border-line bg-base-200"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Campus</span>
          <select required className="select w-full rounded-field border-line bg-base-200">
            {CAMPUSES.map((campus) => (
              <option key={campus}>{campus}</option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Shift</span>
            <select required className="select w-full rounded-field border-line bg-base-200">
              {SHIFTS.map((shift) => (
                <option key={shift}>{shift}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Intake</span>
            <select required className="select w-full rounded-field border-line bg-base-200">
              {INTAKES.map((intake) => (
                <option key={intake}>{intake}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Intended level</span>
            <select required className="select w-full rounded-field border-line bg-base-200">
              {LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Password</span>
          <input
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="input w-full rounded-field border-line bg-base-200"
          />
        </label>

        <label className="flex items-start gap-2 text-xs text-muted">
          <input type="checkbox" required className="checkbox checkbox-sm mt-0.5" />
          <span>
            I agree to the fee policy: total due, installments and receipts are tracked on my student account.
          </span>
        </label>

        <button
          type="submit"
          className="btn w-full gap-2 rounded-full border-0 bg-brand text-white hover:bg-brand/90"
        >
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

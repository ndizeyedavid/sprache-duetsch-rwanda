import { currencyAmount } from '../../lib/format';
import type { ReferenceItem } from './reference-item';
import type { FormEvent } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { labelOf } from './label-of';
export function RegisterSection1(props: { handleSubmit: (event: FormEvent) => Promise<void>; fullName: string; setFullName: import("react").Dispatch<import("react").SetStateAction<string>>; phone: string; setPhone: import("react").Dispatch<import("react").SetStateAction<string>>; email: string; setEmail: import("react").Dispatch<import("react").SetStateAction<string>>; campusId: string; loadingRefs: boolean; setCampusId: import("react").Dispatch<import("react").SetStateAction<string>>; campuses: ReferenceItem[]; intakeId: string; setIntakeId: import("react").Dispatch<import("react").SetStateAction<string>>; intakes: ReferenceItem[]; intendedLevelId: string; setIntendedLevelId: import("react").Dispatch<import("react").SetStateAction<string>>; levels: ReferenceItem[]; password: string; setPassword: import("react").Dispatch<import("react").SetStateAction<string>>; error: string | null; pending: boolean; navigate: import("../../../node_modules/react-router-dom/dist/index").NavigateFunction; setError: import("react").Dispatch<import("react").SetStateAction<string | null>> }) {
const { handleSubmit, fullName, setFullName, phone, setPhone, email, setEmail, campusId, loadingRefs, setCampusId, campuses, intakeId, setIntakeId, intakes, intendedLevelId, setIntendedLevelId, levels, password, setPassword, error, pending } = props;
return (<section className=" rounded-box bg-base-100 p-6 sm:p-8">
 <h1 className="text-xl font-semibold sm:text-2xl">Create your account</h1>

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
 onChange={(event) => setFullName(event.currentTarget.value)}
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
 onChange={(event) => setPhone(event.currentTarget.value)}
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
 onChange={(event) => setEmail(event.currentTarget.value)}
 className="input w-full rounded-field border-line bg-base-200"
 />
 </label>

 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Campus</span>
 <select
 required
 value={campusId}
 disabled={loadingRefs}
 onChange={(event) => setCampusId(event.currentTarget.value)}
 className="select w-full truncate rounded-field border-line bg-base-200 pe-10"
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

 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Intake</span>
 <select
 required
 value={intakeId}
 disabled={loadingRefs}
 onChange={(event) => { setIntakeId(event.currentTarget.value); setIntendedLevelId(''); }}
 className="select w-full truncate rounded-field border-line bg-base-200 pe-10"
 >
 <option value="">Select an intake</option>
 {intakes.map((intake) => (
 <option key={intake.id} value={intake.id}>
 {labelOf(intake)}
 </option>
 ))}
 </select>
 </label>

 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Course level</span>
 <select
 required
 value={intendedLevelId}
 disabled={loadingRefs}
 onChange={(event) => setIntendedLevelId(event.currentTarget.value)}
 className="select w-full truncate rounded-field border-line bg-base-200 pe-10"
 >
 <option value="">Select a level from this intake</option>
 {levels.map((level) => (
 <option key={level.id} value={level.id}>
 {labelOf(level)} · {currencyAmount(Number(level.defaultFee ?? 0), level.currency ?? 'RWF')}
 </option>
 ))}
 </select>
 </label>

 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Password</span>
 <input
 type="password"
 required
 minLength={8}
 autoComplete="new-password"
 placeholder="At least 8 characters"
 value={password}
 onChange={(event) => setPassword(event.currentTarget.value)}
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
 I agree to the terms and conditions.
 </span>
 </label>

  <button
  type="submit"
  disabled={pending || loadingRefs}
  className="btn w-full gap-2 rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content disabled:opacity-60"
  >
  {pending ? <span className="loading loading-spinner loading-sm" /> : null}
  Continue
  <FiArrowRight aria-hidden />
  </button>
  </form>

 <p className="mt-6 text-center text-xs text-muted">
 Already enrolled?{' '}
 <Link to="/login" className="font-medium text-brand hover:underline">
 Sign in
 </Link>
 </p>
 </section>);
}

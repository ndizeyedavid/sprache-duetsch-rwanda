import type { ApplyFormState } from './useApplyForm';

const INPUT = 'input w-full rounded-field border-line bg-base-200';

/** Who is applying. Inputs read the value before calling `update` (React clears currentTarget). */
export function ApplyPersonalFields({ form }: { form: ApplyFormState }) {
  const { values, update } = form;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">First name</span>
          <input type="text" required maxLength={80} autoComplete="given-name" value={values.firstName}
            onChange={(event) => { const firstName = event.currentTarget.value; update({ firstName }); }} className={INPUT} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Last name</span>
          <input type="text" required maxLength={80} autoComplete="family-name" value={values.lastName}
            onChange={(event) => { const lastName = event.currentTarget.value; update({ lastName }); }} className={INPUT} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Email</span>
          <input type="email" required maxLength={160} autoComplete="email" placeholder="name@example.com" value={values.email}
            onChange={(event) => { const email = event.currentTarget.value; update({ email }); }} className={INPUT} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Phone <span className="text-muted">(WhatsApp preferred)</span></span>
          <input type="tel" maxLength={30} autoComplete="tel" placeholder="+250 788 000 000" value={values.phone}
            onChange={(event) => { const phone = event.currentTarget.value; update({ phone }); }} className={INPUT} />
        </label>
      </div>
    </>
  );
}

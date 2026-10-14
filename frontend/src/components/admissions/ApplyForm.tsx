import { FiArrowRight } from 'react-icons/fi';
import type { Catalog } from '../../lib/admissions-types';
import { ApplyCourseFields } from './ApplyCourseFields';
import { ApplyPersonalFields } from './ApplyPersonalFields';
import type { ApplyFormState } from './useApplyForm';

/** The public application form. The hidden "website" field is a bot trap people never see. */
export function ApplyForm({ form, catalog }: { form: ApplyFormState; catalog: Catalog }) {
  const { values, update } = form;
  return (
    <form className="mt-6 space-y-4" onSubmit={form.submit}>
      <ApplyPersonalFields form={form} />
      <ApplyCourseFields form={form} catalog={catalog} />

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium">German so far <span className="text-muted">(optional)</span></span>
        <input type="text" maxLength={500} placeholder="e.g. complete beginner, finished A1 in 2025" value={values.experience}
          onChange={(event) => { const experience = event.currentTarget.value; update({ experience }); }}
          className="input w-full rounded-field border-line bg-base-200" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium">Message <span className="text-muted">(optional)</span></span>
        <textarea rows={3} maxLength={2000} value={values.message}
          onChange={(event) => { const message = event.currentTarget.value; update({ message }); }}
          className="textarea w-full rounded-field border-line bg-base-200" />
      </label>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>Website<input type="text" tabIndex={-1} autoComplete="off" value={values.website}
          onChange={(event) => { const website = event.currentTarget.value; update({ website }); }} /></label>
      </div>

      {form.error ? <p role="alert" className="text-xs font-medium text-error">{form.error}</p> : null}

      <button type="submit" disabled={form.pending}
        className="btn w-full gap-2 rounded-full border-0 bg-brand text-white hover:bg-night disabled:opacity-60">
        {form.pending ? <span className="loading loading-spinner loading-sm" /> : null}
        Send application
        <FiArrowRight aria-hidden />
      </button>
      <p className="text-center text-xs text-muted">No payment is taken now. Fees are confirmed when you enrol.</p>
    </form>
  );
}

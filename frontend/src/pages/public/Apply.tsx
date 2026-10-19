import { Link,useSearchParams } from 'react-router-dom';
import { ApplyForm } from '../../components/admissions/ApplyForm';
import { ApplySuccess } from '../../components/admissions/ApplySuccess';
import { useApplyForm } from '../../components/admissions/useApplyForm';
import { ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { getCatalog } from '../../lib/admissions-api';

/** Public application form. `?level=` and `?intake=` (id or code) preselect the course. */
export function Apply() {
  const [params] = useSearchParams();
  const catalog = useApi('public-catalog', getCatalog);
  const form = useApplyForm(catalog.data, params.get('level'), params.get('intake'));

  if (form.receipt) return <ApplySuccess receipt={form.receipt} email={form.values.email} />;

  return (
    <section>
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.25em] text-brand">Admissions</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Apply for a course</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Tell us who you are and what you want to study. We review every application and reply by email.
      </p>

      {catalog.loading ? (
        <LoadingBlock label="Loading courses…" />
      ) : catalog.error || !catalog.data ? (
        <ErrorBlock message={catalog.error ?? 'Could not load courses.'} onRetry={catalog.refetch} />
      ) : (
        <ApplyForm form={form} catalog={catalog.data} />
      )}

      <p className="mt-8 text-center text-sm text-muted">
        Already a student? <Link to="/login" className="font-medium text-brand hover:underline">Sign in</Link>
      </p>
    </section>
  );
}

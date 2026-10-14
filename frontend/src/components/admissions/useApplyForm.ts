import type { FormEvent } from 'react';
import { useMemo,useState } from 'react';
import { submitApplication } from '../../lib/admissions-api';
import type { ApplicationReceipt,Catalog,Shift } from '../../lib/admissions-types';
import { apiErrorMessage } from '../../lib/api';

export type ApplyValues = {
  firstName: string; lastName: string; email: string; phone: string;
  levelId: string; intakeId: string; campusId: string; shift: Shift | '';
  experience: string; message: string; website: string;
};

type Draft = Omit<ApplyValues, 'levelId' | 'intakeId'> & { levelId?: string; intakeId?: string };

const EMPTY: Draft = { firstName: '', lastName: '', email: '', phone: '', campusId: '', shift: '', experience: '', message: '', website: '' };

/** `?level=` accepts an id or a code (e.g. A1); `?intake=` an id or code. Invalid pairs are ignored. */
function prefill(catalog: Catalog | null, level: string | null, intake: string | null) {
  const match = catalog?.levels.find((item) => item.id === level || item.code.toLowerCase() === level?.toLowerCase());
  const offered = catalog?.intakes.find((item) => (item.id === intake || item.code === intake) && item.levels.some((l) => l.id === match?.id));
  return { levelId: match?.id ?? '', intakeId: offered?.id ?? '' };
}

/** Form state for the public application; the query string seeds level and intake. */
export function useApplyForm(catalog: Catalog | null, levelParam: string | null, intakeParam: string | null) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ApplicationReceipt | null>(null);
  const seed = useMemo(() => prefill(catalog, levelParam, intakeParam), [catalog, levelParam, intakeParam]);

  const values: ApplyValues = { ...draft, levelId: draft.levelId ?? seed.levelId, intakeId: draft.intakeId ?? seed.intakeId };
  const intakes = useMemo(
    () => (catalog?.intakes ?? []).filter((intake) => intake.levels.some((level) => level.id === values.levelId)),
    [catalog, values.levelId],
  );

  function update(patch: Partial<ApplyValues>) {
    setDraft((current) => {
      const next: Draft = { ...current, ...patch };
      // A new level drops an intake that does not offer it.
      if (patch.levelId !== undefined && patch.intakeId === undefined) {
        const intakeId = current.intakeId ?? seed.intakeId;
        const stillOffered = catalog?.intakes.some((intake) => intake.id === intakeId && intake.levels.some((l) => l.id === patch.levelId));
        next.intakeId = stillOffered ? intakeId : '';
      }
      return next;
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!values.levelId) {
      setError('Choose the level you want to study.');
      return;
    }
    setError(null);
    setPending(true);
    try {
      const result = await submitApplication({
        ...values,
        email: values.email.trim(),
        intakeId: values.intakeId || undefined,
        campusId: values.campusId || undefined,
      });
      setReceipt(result);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not send your application. Please try again.'));
    } finally {
      setPending(false);
    }
  }

  return { values, intakes, update, submit, pending, error, receipt };
}

export type ApplyFormState = ReturnType<typeof useApplyForm>;

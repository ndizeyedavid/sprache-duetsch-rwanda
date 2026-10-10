import { apiErrorMessage,apiFieldErrors } from '../../lib/api';
export function createRun(context: { setError: import("react").Dispatch<import("react").SetStateAction<string | null>>; setFieldErrors: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>>; setBusy: import("react").Dispatch<import("react").SetStateAction<boolean>> }) {
const { setError, setFieldErrors, setBusy } = context;
async function run(action: () => Promise<unknown>, fallback: string, after?: () => void) {
  setError(null);
  setFieldErrors({});
  setBusy(true);
  try {
  await action();
  after?.();
  } catch (err) {
  setError(apiErrorMessage(err, fallback));
  setFieldErrors(apiFieldErrors(err));
  } finally {
  setBusy(false);
  }
  }
return run;
}

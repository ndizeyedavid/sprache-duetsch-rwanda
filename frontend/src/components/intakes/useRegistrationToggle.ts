import { useCallback,useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { IntakeItem } from '../../lib/services';
import { updateIntake } from '../../lib/services';

/**
 * Flips an intake's registration switch with an optimistic value, so the toggle answers
 * at once on slow networks; the server value replaces it on refetch, errors roll it back.
 */
export function useRegistrationToggle(refetch: () => void, notify: (message: string) => void) {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [busyIds, setBusyIds] = useState<string[]>([]);

  const withOverride = useCallback(
    (intake: IntakeItem): IntakeItem =>
      intake.id in overrides ? { ...intake, registrationOpen: overrides[intake.id] } : intake,
    [overrides],
  );

  async function toggle(intake: IntakeItem, open: boolean) {
    setOverrides((current) => ({ ...current, [intake.id]: open }));
    setBusyIds((current) => [...current, intake.id]);
    try {
      await updateIntake(intake.id, { registrationOpen: open });
      notify(open ? `Registration for ${intake.name} is open.` : `Registration for ${intake.name} is closed.`);
      refetch();
    } catch (err) {
      setOverrides((current) => {
        const next = { ...current };
        delete next[intake.id];
        return next;
      });
      notify(apiErrorMessage(err, 'Could not change registration. Try again.'));
    } finally {
      setBusyIds((current) => current.filter((id) => id !== intake.id));
    }
  }

  return { withOverride, toggle, isBusy: (id: string) => busyIds.includes(id) };
}

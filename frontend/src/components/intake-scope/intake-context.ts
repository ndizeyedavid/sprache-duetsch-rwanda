import { createContext,useContext } from 'react';
import type { IntakeOverview } from '../../lib/services/intake-overview';

export type IntakeScopeValue = {
  /** False for students — nothing intake-related renders. */
  enabled: boolean;
  intakes: IntakeOverview[];
  /** The selected intake, or null for "All intakes". */
  selected: IntakeOverview | null;
  loading: boolean;
  error: string | null;
  select: (intakeId: string | null) => void;
  refetch: () => void;
};

const disabled: IntakeScopeValue = {
  enabled: false, intakes: [], selected: null, loading: false, error: null, select: () => {}, refetch: () => {},
};

export const IntakeScopeContext = createContext<IntakeScopeValue>(disabled);

export function useIntakeScopeDetails(): IntakeScopeValue {
  return useContext(IntakeScopeContext);
}

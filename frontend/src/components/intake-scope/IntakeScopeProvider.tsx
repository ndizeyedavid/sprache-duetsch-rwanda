import type { ReactNode } from 'react';
import { useEffect,useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { setIntakeScope,useIntakeScope } from '../../lib/intake-scope/store';
import { getIntakeOverview } from '../../lib/services/intake-overview';
import { IntakeScopeContext,type IntakeScopeValue } from './intake-context';

/** Loads the staff intake list once and resolves the saved intake against it. */
export function IntakeScopeProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const scopeId = useIntakeScope();
  const { data, loading, error, refetch } = useApi('intake-overview', getIntakeOverview, enabled);
  const intakes = useMemo(() => data ?? [], [data]);
  const selected = intakes.find((intake) => intake.id === scopeId) ?? null;

  // A saved intake that was deleted (or is no longer visible to this user) falls back to all intakes.
  useEffect(() => {
    if (enabled && data && scopeId && !data.some((intake) => intake.id === scopeId)) setIntakeScope(null);
  }, [enabled, data, scopeId]);

  const value = useMemo<IntakeScopeValue>(() => ({
    enabled, intakes, selected, loading, error, select: setIntakeScope, refetch,
  }), [enabled, intakes, selected, loading, error, refetch]);

  return <IntakeScopeContext.Provider value={value}>{children}</IntakeScopeContext.Provider>;
}

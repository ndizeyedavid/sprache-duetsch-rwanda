import { useCallback,useState } from 'react';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { PlacementHero } from '../../components/placement/PlacementHero';
import { PlacementHistoryList } from '../../components/placement/PlacementHistoryList';
import { PlacementIntro } from '../../components/placement/PlacementIntro';
import { PlacementResultCard } from '../../components/placement/PlacementResultCard';
import { PlacementRunner } from '../../components/placement/PlacementRunner';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { getMyPlacement,startMyPlacement } from '../../lib/services/placement-api';
import type { PlacementSession,PlacementSubmitResult } from '../../lib/services/placement-types';

/** Student placement test: intro → one-question-per-screen runner → result. */
export function Placement() {
  const placement = useApi('my-placement', getMyPlacement);
  const [session, setSession] = useState<PlacementSession | null>(null);
  const [submitted, setSubmitted] = useState<PlacementSubmitResult | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refetch } = placement;

  const finish = useCallback((result: PlacementSubmitResult) => {
    setSession(null);
    setSubmitted(result);
    refetch();
  }, [refetch]);

  async function start() {
    setStarting(true);
    setError(null);
    try {
      setSubmitted(null);
      setSession(await startMyPlacement());
    } catch (cause) {
      setError(apiErrorMessage(cause, 'Could not start the placement test.'));
    } finally {
      setStarting(false);
    }
  }

  if (session) {
    return <div className="space-y-4"><PlacementHero running title={session.title} /><PlacementRunner session={session} onFinished={finish} onExit={() => { setSession(null); refetch(); }} /></div>;
  }
  if (placement.loading) return <div className="space-y-4"><PlacementHero /><LoadingBlock label="Loading placement test…" /></div>;
  if (placement.error || !placement.data) {
    return <div className="space-y-4"><PlacementHero /><ErrorBlock message={placement.error ?? 'Could not load the placement test.'} onRetry={refetch} /></div>;
  }

  const data = placement.data;
  const latest = submitted ?? data.latest;
  const earlier = data.history.filter((row) => row.id !== latest?.id);
  const showIntro = data.status === 'NOT_TAKEN' || data.status === 'IN_PROGRESS' || (data.canStart && !submitted);

  return (
    <div className="space-y-4">
      <PlacementHero data={data} latest={latest} />
      <div className="mx-auto max-w-3xl space-y-4">
      {latest && data.status !== 'IN_PROGRESS' ? (
        <PlacementResultCard result={latest} correct={submitted?.correct} total={submitted?.total} />
      ) : null}
      {data.status === 'UNAVAILABLE' ? (
        <EmptyBlock title="The placement test is not available yet" hint="The academic office will contact you about your level. You can also ask them to record a placement for you." />
      ) : null}
      {showIntro && data.test ? (
        <PlacementIntro data={data} onStart={() => void start()} starting={starting} error={error} retake={Boolean(latest) && !data.activeAttempt} />
      ) : null}
      {earlier.length > 0 ? <PlacementHistoryList history={earlier} /> : null}
      </div>
    </div>
  );
}

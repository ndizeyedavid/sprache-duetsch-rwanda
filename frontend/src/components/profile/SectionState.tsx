import type { ReactNode } from 'react';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../common/PageState';

type Props = {
  loading: boolean;
  loadingLabel: string;
  error: string | null;
  onRetry: () => void;
  isEmpty: boolean;
  emptyTitle: string;
  emptyHint?: string;
  children: ReactNode;
};

/** One loading/error/empty switch so every panel on the page fails the same way. */
export function SectionState({
  loading,
  loadingLabel,
  error,
  onRetry,
  isEmpty,
  emptyTitle,
  emptyHint,
  children,
}: Props) {
  if (loading) return <LoadingBlock label={loadingLabel} />;
  if (error) return <ErrorBlock message={error} onRetry={onRetry} />;
  if (isEmpty) return <EmptyBlock title={emptyTitle} hint={emptyHint} />;
  return <>{children}</>;
}

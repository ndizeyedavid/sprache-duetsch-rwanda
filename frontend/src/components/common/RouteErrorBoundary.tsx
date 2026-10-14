import type { ReactNode } from 'react';
import { Component } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { isStaleBuildError, reloadForNewBuild } from '../../lib/lazy-page';

type Props = { children: ReactNode; resetKey: string };
type State = { error: unknown; gaveUp: boolean };

/** Keeps the layout on screen when a page crashes, instead of a blank white page. */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null, gaveUp: false };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error };
  }

  // An old tab after a deploy: update silently instead of showing an error screen.
  componentDidCatch(error: unknown) {
    if (isStaleBuildError(error) && !reloadForNewBuild()) this.setState({ gaveUp: true });
  }

  componentDidUpdate(previous: Props) {
    if (previous.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null, gaveUp: false });
  }

  render() {
    if (!this.state.error) return this.props.children;
    const stale = isStaleBuildError(this.state.error);
    if (stale && !this.state.gaveUp) {
      return <div className="flex min-h-[50vh] items-center justify-center"><span className="loading loading-spinner loading-md text-brand" aria-label="Updating" /></div>;
    }
    return (
      <div role="alert" className="page-enter mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold">{stale ? 'Could not load the latest version' : 'This page could not open'}</h2>
        <p className="mt-2 text-sm text-muted">
          Check your connection, then try again.
        </p>
        <div className="mt-5 flex gap-2">
          <button type="button" className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content" onClick={() => window.location.reload()}>
            <FiRefreshCw aria-hidden /> Reload
          </button>
          {!stale ? <button type="button" className="btn btn-ghost btn-sm rounded-full" onClick={() => this.setState({ error: null })}>Try again</button> : null}
        </div>
      </div>
    );
  }
}

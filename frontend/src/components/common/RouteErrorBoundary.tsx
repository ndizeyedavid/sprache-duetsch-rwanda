import type { ReactNode } from 'react';
import { Component } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { isStaleBuildError } from '../../lib/lazy-page';

type Props = { children: ReactNode; resetKey: string };
type State = { error: unknown };

/** Keeps the layout on screen when a page crashes, instead of a blank white page. */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidUpdate(previous: Props) {
    if (previous.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    const stale = isStaleBuildError(this.state.error);
    return (
      <div role="alert" className="page-enter mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold">{stale ? 'A new version is ready' : 'This page could not open'}</h2>
        <p className="mt-2 text-sm text-muted">
          {stale ? 'Reload to get the latest version of the app.' : 'Check your connection, then try again.'}
        </p>
        <div className="mt-5 flex gap-2">
          <button type="button" className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90" onClick={() => window.location.reload()}>
            <FiRefreshCw aria-hidden /> Reload
          </button>
          {!stale ? <button type="button" className="btn btn-ghost btn-sm rounded-full" onClick={() => this.setState({ error: null })}>Try again</button> : null}
        </div>
      </div>
    );
  }
}

import { Link } from 'react-router-dom';
import { WORKSPACE_CONTEXT } from '../admin/workspace-context';
import { heroGhost } from '../hero/hero-actions';

/** Related admin pages (from the academic workspace map) as outline pills on the red hero band. */
export function WorkspaceHeroLinks({ segment }: { segment: string }) {
  return <>{(WORKSPACE_CONTEXT[segment]?.links ?? []).map(link => <Link key={link.to} to={link.to} className={heroGhost}>{link.label}</Link>)}</>;
}

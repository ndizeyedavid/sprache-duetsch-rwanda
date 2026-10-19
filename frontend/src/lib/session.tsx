import type { ReactNode } from 'react';
import { createContext,useCallback,useContext,useEffect,useMemo,useState } from 'react';
import { apiErrorMessage } from './api';
import type { AuthUser } from './auth-store';
import { clearTokens,fetchMe,isSignedIn,logout } from './auth-store';
import { bindIntakeScope } from './intake-scope/store';
import { onSessionEnded } from './session-events';

/** Staff work inside an intake scope; students never do. */
function bindScopeFor(user: AuthUser | null) {
  bindIntakeScope(user && user.role !== 'STUDENT' ? user.id : null);
}

type SessionValue = {
 user: AuthUser | null;
 loading: boolean;
 error: string | null;
 refresh: () => Promise<void>;
 signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

/**
 * Loads `/auth/me` once for the whole app. Guards, navigation and the topbar all
 * read the same session, so a role change never leaves stale UI behind.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
 const [user, setUser] = useState<AuthUser | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const refresh = useCallback(async () => {
 if (!isSignedIn()) {
 bindScopeFor(null);
 setUser(null);
 setError(null);
 setLoading(false);
 return;
 }
 setLoading(true);
 try {
 const profile = await fetchMe();
 // Bind before render so the first page fetches are already scoped.
 bindScopeFor(profile);
 setUser(profile);
 setError(null);
 } catch (err) {
 clearTokens();
 bindScopeFor(null);
 setUser(null);
 setError(apiErrorMessage(err, 'Your session has expired. Please sign in again.'));
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 void refresh();
 }, [refresh]);

 // The API layer reports a forced sign-out (student signed in elsewhere); drop the
 // session here so the guards send the user to /login with the reason shown.
 useEffect(() => onSessionEnded((message) => {
 clearTokens();
 bindScopeFor(null);
 setUser(null);
 setError(message);
 setLoading(false);
 }), []);

 const signOut = useCallback(async () => {
 await logout();
 bindScopeFor(null);
 setUser(null);
 setError(null);
 }, []);

 const value = useMemo<SessionValue>(
 () => ({ user, loading, error, refresh, signOut }),
 [user, loading, error, refresh, signOut],
 );

 return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

// The provider and its hook intentionally live together; the hook is not a component.
// eslint-disable-next-line react-refresh/only-export-components
export function useSession(): SessionValue {
 const context = useContext(SessionContext);
 if (!context) {
 throw new Error('useSession must be used inside a SessionProvider');
 }
 return context;
}

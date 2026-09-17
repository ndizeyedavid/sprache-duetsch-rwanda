import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { apiErrorMessage } from './api';
import { clearTokens, fetchMe, isSignedIn, logout } from './auth-store';
import type { AuthUser } from './auth-store';

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
 setUser(null);
 setError(null);
 setLoading(false);
 return;
 }
 setLoading(true);
 try {
 const profile = await fetchMe();
 setUser(profile);
 setError(null);
 } catch (err) {
 clearTokens();
 setUser(null);
 setError(apiErrorMessage(err, 'Your session has expired. Please sign in again.'));
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 void refresh();
 }, [refresh]);

 const signOut = useCallback(async () => {
 await logout();
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

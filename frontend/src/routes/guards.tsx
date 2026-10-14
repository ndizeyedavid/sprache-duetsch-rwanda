import { Navigate,Outlet } from "react-router-dom";
import { BookLoader } from "../components/common/BookLoader";
import type { AuthRole } from "../lib/auth-store";
import { homePath } from "../lib/roles";
import { useSession } from "../lib/session";

export function PageFallback() {
  return <BookLoader className="min-h-[60vh]" />;
}

/** Sends the visitor to the dashboard that matches their role (or to sign-in). */
export function RoleHome() {
  const { user, loading } = useSession();
  if (loading) return <PageFallback />;
  return <Navigate to={user ? homePath[user.role] : "/login"} replace />;
}

/**
 * Route guard: signed-in users only, restricted to the given roles. A user who
 * is not allowed here is redirected to their own dashboard instead of seeing 403s.
 */
export function RequireRole({ roles }: { roles: AuthRole[] }) {
  const { user, loading } = useSession();
  if (loading) return <PageFallback />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role))
    return <Navigate to={homePath[user.role]} replace />;
  return <Outlet />;
}

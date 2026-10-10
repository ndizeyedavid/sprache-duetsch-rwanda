import { Outlet } from 'react-router-dom';
import { AuthPhoto } from '../auth/AuthPhoto';
import { AuthSeal } from '../auth/AuthSeal';
import { LiquidEdge } from '../auth/LiquidEdge';

/** Photo-led shell for sign-in, registration and password pages. */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-base-100 lg:grid lg:h-screen lg:grid-cols-[1fr_minmax(480px,40%)] lg:overflow-hidden">
      <AuthPhoto />
      <div className="relative z-10 bg-base-100">
        <LiquidEdge />
        <AuthSeal />
        <main className="relative flex items-center justify-center px-6 pb-12 pt-14 sm:px-10 lg:h-full lg:overflow-y-auto lg:py-16 lg:pl-24 lg:pr-14">
          <div className="w-full max-w-md">
            <Outlet />
            <p className="mt-12 text-center text-xs text-muted">© 2026 Deutsch Sprache RW · Kigali, Rwanda</p>
          </div>
        </main>
      </div>
    </div>
  );
}

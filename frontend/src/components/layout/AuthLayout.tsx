import { Outlet } from 'react-router-dom';
import { AuthFooter } from '../auth/AuthFooter';
import { AuthPhoto } from '../auth/AuthPhoto';
import { AuthSeal } from '../auth/AuthSeal';
import { BackToSite } from '../auth/BackToSite';
import { LiquidEdge } from '../auth/LiquidEdge';

/** Photo-led shell for sign-in, registration and password pages. */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-base-100 lg:grid lg:h-screen lg:grid-rows-1 lg:grid-cols-[1fr_minmax(30rem,40%)] lg:overflow-hidden">
      <AuthPhoto />
      <div className="relative z-10 bg-base-100">
        <LiquidEdge />
        <AuthSeal />
        <main className="relative flex justify-center px-6 pb-12 pt-14 sm:px-10 lg:h-full lg:overflow-y-auto lg:py-16 lg:pl-24 lg:pr-14">
          {/* my-auto (not items-center) keeps tall pages like /demo scrollable from the top. */}
          <div className="my-auto w-full max-w-md">
            <BackToSite />
            <Outlet />
            <AuthFooter />
          </div>
        </main>
      </div>
    </div>
  );
}

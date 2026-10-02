import { GoogleSignIn } from "./GoogleSignIn";
import type { GoogleButtonProps } from "./GoogleSignIn";

// Gate only: the Google hooks live in GoogleSignIn, which needs the provider
// that main.tsx mounts only when a client ID is configured.
export function GoogleButton(props: GoogleButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  if (!clientId) {
    return (
      <p className="rounded-box border border-dashed border-line bg-base-200/30 px-3 py-2 text-center text-xs text-muted">
        Google sign-in not configured — add VITE_GOOGLE_CLIENT_ID and restart
        the dev server
      </p>
    );
  }

  return <GoogleSignIn {...props} />;
}

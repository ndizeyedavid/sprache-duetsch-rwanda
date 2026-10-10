import type { GoogleButtonProps } from "./GoogleSignIn";
import { GoogleSignIn } from "./GoogleSignIn";

// Gate only: the Google hooks live in GoogleSignIn, which needs the provider
// that main.tsx mounts only when a client ID is configured.
export function GoogleButton(props: GoogleButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  if (!clientId) return null;

  return <GoogleSignIn {...props} />;
}

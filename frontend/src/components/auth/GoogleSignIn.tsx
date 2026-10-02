import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";
import { apiErrorMessage, apiPost } from "../../lib/api";
import { setTokens } from "../../lib/auth-store";
import type { AuthUser } from "../../lib/auth-store";

export type GoogleButtonProps = {
  portal?: "student" | "teacher" | "staff";
  onSuccess: (user: AuthUser) => void;
  onError: (msg: string) => void;
};

// Uses @react-oauth/google hooks, so it must render inside GoogleOAuthProvider
// (main.tsx only mounts the provider when VITE_GOOGLE_CLIENT_ID is set).
export function GoogleSignIn({ portal, onSuccess, onError }: GoogleButtonProps) {
  const implicitLogin = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        const result = await apiPost<{
          user: AuthUser;
          tokens: { accessToken: string; refreshToken: string };
        }>("/auth/google", {
          idToken: tokenResponse.access_token,
          portal,
        });
        setTokens(result.tokens.accessToken, result.tokens.refreshToken);
        onSuccess(result.user);
      } catch (err) {
        onError(apiErrorMessage(err, "Google sign-in failed."));
      }
    },
    onError: () => onError("Google sign-in was cancelled."),
  });

  return (
    <div className="space-y-2">
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={async (res) => {
            const credential = res.credential;
            if (!credential) {
              onError("Google did not return a credential.");
              return;
            }
            try {
              const result = await apiPost<{
                user: AuthUser;
                tokens: { accessToken: string; refreshToken: string };
              }>("/auth/google", {
                idToken: credential,
                portal,
              });
              setTokens(result.tokens.accessToken, result.tokens.refreshToken);
              onSuccess(result.user);
            } catch (err) {
              onError(apiErrorMessage(err, "Google sign-in failed."));
            }
          }}
          onError={() => onError("Google sign-in was cancelled.")}
          useOneTap={false}
          shape="pill"
          size="large"
          width="320"
          text="continue_with"
        />
      </div>
      <button
        type="button"
        onClick={() => implicitLogin()}
        className="btn btn-sm w-full rounded-full border-line bg-base-100 text-xs hidden"
      >
        Use another Google account
      </button>
    </div>
  );
}

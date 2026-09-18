import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";
import { apiErrorMessage, apiPost } from "../../lib/api";
import { setTokens } from "../../lib/auth-store";
import type { AuthUser } from "../../lib/auth-store";

type Props = {
  portal?: "student" | "teacher" | "staff";
  onSuccess: (user: AuthUser) => void;
  onError: (msg: string) => void;
};

export function GoogleButton({ portal, onSuccess, onError }: Props) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  const disabled = !clientId;

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

  if (disabled) {
    return (
      <p className="rounded-box border border-dashed border-line bg-base-200/30 px-3 py-2 text-center text-xs text-muted">
        Google sign-in not configured — add VITE_GOOGLE_CLIENT_ID and restart
        the dev server
      </p>
    );
  }

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

import { AxiosError } from 'axios';

/** Error code the API returns when a student's account was signed in on another device. */
export const SESSION_REPLACED_CODE = 'SESSION_REPLACED';

const SESSION_ENDED_EVENT = 'sparch:session-ended';

type SessionEndedDetail = { message: string };

/** If the failure is the server ending this device's session, returns the message to show. */
export function sessionEndedMessage(error: unknown): string | null {
  if (!(error instanceof AxiosError) || error.response?.status !== 401) return null;
  const body = error.response.data as { error?: { code?: string; message?: string } } | undefined;
  if (body?.error?.code !== SESSION_REPLACED_CODE) return null;
  return body.error.message ?? 'This account was signed in on another device, so this device has been signed out.';
}

/** Tells the session provider (outside the axios layer) that this device was signed out. */
export function emitSessionEnded(message: string): void {
  window.dispatchEvent(new CustomEvent<SessionEndedDetail>(SESSION_ENDED_EVENT, { detail: { message } }));
}

/** Subscribe to forced sign-outs; returns the unsubscribe function. */
export function onSessionEnded(handler: (message: string) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<SessionEndedDetail>).detail.message);
  window.addEventListener(SESSION_ENDED_EVENT, listener);
  return () => window.removeEventListener(SESSION_ENDED_EVENT, listener);
}

import type { FormEvent } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { RegisterOtpResult, RegisterPayload } from '../../lib/auth-store';
import { requestRegisterOtp } from '../../lib/auth-store';

export type PendingRegistration = Omit<RegisterPayload, 'otp'>;

/** Validates the sign-up form, then emails a verification code; the account is created on the next step. */
export function createHandleSubmit(context: { password: string; setError: import("react").Dispatch<import("react").SetStateAction<string | null>>; fullName: string; campusId: string; setPending: import("react").Dispatch<import("react").SetStateAction<boolean>>; email: string; phone: string; intakeId: string; intendedLevelId: string; onCodeSent: (payload: PendingRegistration, sent: RegisterOtpResult) => void }) {
const { password, setError, fullName, campusId, setPending, email, phone, intakeId, intendedLevelId, onCodeSent } = context;
async function handleSubmit(event: FormEvent) {
 event.preventDefault();
 setError(null);

 const parts = fullName.trim().split(/\s+/).filter(Boolean);
 if (parts.length === 0) {
 setError('Please enter your full name.');
 return;
 }
 if (!intakeId || !intendedLevelId) { setError('Choose an intake and a course level.'); return; }
 if (!campusId) {
 setError('Please choose a campus.');
 return;
 }

 const payload: PendingRegistration = {
 firstName: parts[0] ?? '',
 lastName: parts.length > 1 ? parts.slice(1).join(' ') : parts[0] ?? '',
 email: email.trim(),
 phone: phone.trim() || undefined,
 password,
 campusId,
 intakeId: intakeId || undefined,
 intendedLevelId: intendedLevelId || undefined,
 };
 setPending(true);
 try {
 onCodeSent(payload, await requestRegisterOtp(payload.email, payload.firstName));
 } catch (err) {
 setError(apiErrorMessage(err, 'Could not send your verification code. Please try again.'));
 } finally {
 setPending(false);
 }
 }
return handleSubmit;
}

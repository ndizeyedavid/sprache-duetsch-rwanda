import type { FormEvent } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { register } from '../../lib/auth-store';
export function createHandleSubmit(context: { password: string; shift: import("../../lib/auth-store").RegisterPayload["shift"]; setError: import("react").Dispatch<import("react").SetStateAction<string | null>>; fullName: string; campusId: string; setPending: import("react").Dispatch<import("react").SetStateAction<boolean>>; email: string; phone: string; intakeId: string; intendedLevelId: string; navigate: import("../../../node_modules/react-router-dom/dist/index").NavigateFunction }) {
const { password, shift, setError, fullName, campusId, setPending, email, phone, intakeId, intendedLevelId, navigate } = context;
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

 setPending(true);
 try {
 await register({
 firstName: parts[0] ?? '',
 lastName: parts.length > 1 ? parts.slice(1).join(' ') : parts[0] ?? '',
 email: email.trim(),
 phone: phone.trim() || undefined,
 password,
 campusId,
 shift,
 intakeId: intakeId || undefined,
 intendedLevelId: intendedLevelId || undefined,
 });
 navigate('/dashboard', { replace: true });
 } catch (err) {
 setError(apiErrorMessage(err, 'Could not create your account. Please try again.'));
 } finally {
 setPending(false);
 }
 }
return handleSubmit;
}

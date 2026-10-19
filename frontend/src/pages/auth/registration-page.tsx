import { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage,apiGet } from '../../lib/api';
import type { RegisterOtpResult, RegisterPayload } from '../../lib/auth-store';
import { register, requestRegisterOtp } from '../../lib/auth-store';
import type { ReferenceItem } from './reference-item';
import type { PendingRegistration } from './register-handle-submit';
import { createHandleSubmit } from './register-handle-submit';
import { RegisterOtpStep } from './register-otp-step';
import { RegisterSection1 } from './register-section1';
export function Register() {
 const navigate = useNavigate();
 const [fullName, setFullName] = useState('');
 const [phone, setPhone] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [campusId, setCampusId] = useState('');
 const [shift, setShift] = useState<RegisterPayload['shift']>('EVENING');
 const [intakeId, setIntakeId] = useState('');
 const [intendedLevelId, setIntendedLevelId] = useState('');

 const [campuses, setCampuses] = useState<ReferenceItem[]>([]);
 const [intakes, setIntakes] = useState<ReferenceItem[]>([]);
 const [levels, setLevels] = useState<ReferenceItem[]>([]);
 const [loadingRefs, setLoadingRefs] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [pending, setPending] = useState(false);
 const [verification, setVerification] = useState<{ payload: PendingRegistration; resendAt: number; devCode?: string } | null>(null);
 const [resending, setResending] = useState(false);

 useEffect(() => {
 let cancelled = false;
 async function loadReferences() {
 try {
 const [campusList, intakeList, levelList] = await Promise.all([
 apiGet<ReferenceItem[]>('/campuses?pageSize=100'),
 apiGet<ReferenceItem[]>('/intakes?pageSize=100&open=true'),
 apiGet<ReferenceItem[]>('/levels?pageSize=100'),
 ]);
 if (cancelled) return;
 setCampuses(campusList);
 setIntakes(intakeList.filter(item => item.levels?.some(level => level.isActive)));
 setLevels(levelList);
 setCampusId((current) => current || campusList[0]?.id || '');
 } catch (err) {
 if (!cancelled) {
 setError(apiErrorMessage(err, 'Could not load campuses. Try again later.'));
 }
 } finally {
 if (!cancelled) setLoadingRefs(false);
 }
 }
 void loadReferences();
 return () => {
 cancelled = true;
 };
 }, []);

 const codeSent = (payload: PendingRegistration, sent: RegisterOtpResult) =>
 setVerification({ payload, resendAt: Date.now() + sent.resendAfterSeconds * 1000, devCode: sent.devCode });
 const handleSubmit = (...args: Parameters<ReturnType<typeof createHandleSubmit>>) => createHandleSubmit({ password, shift, setError, fullName, campusId, setPending, email, phone, intakeId, intendedLevelId, onCodeSent: codeSent })(...args);

 async function verify(otp: string) {
 if (!verification) return;
 setPending(true); setError(null);
 try {
 await register({ ...verification.payload, otp });
 navigate('/dashboard', { replace: true });
 } catch (err) {
 setError(apiErrorMessage(err, 'Could not create your account. Please try again.'));
 } finally { setPending(false); }
 }
 async function resend() {
 if (!verification) return;
 setResending(true); setError(null);
 try { codeSent(verification.payload, await requestRegisterOtp(verification.payload.email, verification.payload.firstName)); }
 catch (err) { setError(apiErrorMessage(err, 'Could not send a new code. Please try again.')); }
 finally { setResending(false); }
 }

 if (verification) {
 return <RegisterOtpStep email={verification.payload.email} resendAt={verification.resendAt} devCode={verification.devCode} pending={pending} resending={resending}
 error={error} onVerify={code => void verify(code)} onResend={() => void resend()} onBack={() => { setVerification(null); setError(null); }} />;
 }

 return (
 <RegisterSection1 handleSubmit={handleSubmit} fullName={fullName} setFullName={setFullName} phone={phone} setPhone={setPhone} email={email} setEmail={setEmail} campusId={campusId} loadingRefs={loadingRefs} setCampusId={setCampusId} campuses={campuses} shift={shift} setShift={setShift} intakeId={intakeId} setIntakeId={setIntakeId} intakes={intakes} intendedLevelId={intendedLevelId} setIntendedLevelId={setIntendedLevelId} levels={levels.filter(level => intakes.find(intake => intake.id === intakeId)?.levels?.some(offered => offered.id === level.id && offered.isActive))} password={password} setPassword={setPassword} error={error} pending={pending} navigate={navigate} setError={setError} />
 );
}

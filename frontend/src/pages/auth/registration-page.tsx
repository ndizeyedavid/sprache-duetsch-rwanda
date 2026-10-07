import { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage,apiGet } from '../../lib/api';
import type { RegisterPayload } from '../../lib/auth-store';
import type { ReferenceItem } from './reference-item';
import { createHandleSubmit } from './register-handle-submit';
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

 useEffect(() => {
 let cancelled = false;
 async function loadReferences() {
 try {
 const [campusList, intakeList, levelList] = await Promise.all([
 apiGet<ReferenceItem[]>('/campuses?pageSize=100'),
 apiGet<ReferenceItem[]>('/intakes?pageSize=100'),
 apiGet<ReferenceItem[]>('/levels?pageSize=100'),
 ]);
 if (cancelled) return;
 setCampuses(campusList);
 setIntakes(intakeList);
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

 const handleSubmit = (...args: Parameters<ReturnType<typeof createHandleSubmit>>) => createHandleSubmit({ password, shift, setError, fullName, campusId, setPending, email, phone, intakeId, intendedLevelId, navigate })(...args);

 return (
 <RegisterSection1 handleSubmit={handleSubmit} fullName={fullName} setFullName={setFullName} phone={phone} setPhone={setPhone} email={email} setEmail={setEmail} campusId={campusId} loadingRefs={loadingRefs} setCampusId={setCampusId} campuses={campuses} shift={shift} setShift={setShift} intakeId={intakeId} setIntakeId={setIntakeId} intakes={intakes} intendedLevelId={intendedLevelId} setIntendedLevelId={setIntendedLevelId} levels={levels} password={password} setPassword={setPassword} error={error} pending={pending} navigate={navigate} setError={setError} />
 );
}

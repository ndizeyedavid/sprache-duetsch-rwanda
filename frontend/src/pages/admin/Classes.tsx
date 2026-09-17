import { useState } from 'react';
import type { FormEvent } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import {
 createClass,
 humanize,
 listCampusesFull,
 listClasses,
 listIntakesFull,
 listLevels,
 listTeachers,
} from '../../lib/services';

const SHIFTS = ['MORNING', 'AFTERNOON', 'EVENING', 'WEEKEND'] as const;

export function AdminClasses() {
 const classes = useApi('admin-classes', listClasses);
 const levels = useApi('levels-catalog', listLevels);
 const intakes = useApi('intakes-full', listIntakesFull);
 const campuses = useApi('campuses-full', listCampusesFull);
 const teachers = useApi('teachers', listTeachers);

 const [code, setCode] = useState('');
 const [name, setName] = useState('');
 const [levelId, setLevelId] = useState('');
 const [intakeId, setIntakeId] = useState('');
 const [campusId, setCampusId] = useState('');
 const [teacherId, setTeacherId] = useState('');
 const [shift, setShift] = useState<string>('EVENING');
 const [capacity, setCapacity] = useState('30');
 const [room, setRoom] = useState('');
 const [formError, setFormError] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);

 const levelName = (id: string): string => levels.data?.find((l) => l.id === id)?.code ?? '—';

 async function handleCreate(event: FormEvent) {
 event.preventDefault();
 setFormError(null);
 setSaving(true);
 try {
 await createClass({
 code: code.trim().toUpperCase(),
 name: name.trim(),
 levelId,
 intakeId,
 campusId,
 teacherId: teacherId || undefined,
 shift,
 capacity: Number(capacity) || undefined,
 room: room.trim() || undefined,
 });
 setCode('');
 setName('');
 setRoom('');
 classes.refetch();
 } catch (err) {
 setFormError(apiErrorMessage(err, 'Could not create the class.'));
 } finally {
 setSaving(false);
 }
 }

 return (
 <div className="grid gap-5 lg:grid-cols-3">
 <Panel className="lg:col-span-1">
 <SectionHeader title="Create a class" />
 <form onSubmit={handleCreate} className="space-y-3">
 <div className="grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Code</span>
 <input required value={code} onChange={(e) => setCode(e.currentTarget.value)} placeholder="e.g. CLS-A1-01" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Class name</span>
 <input required value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="e.g. A1 Evening Group A" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 </div>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Level</span>
 <select required value={levelId} onChange={(e) => setLevelId(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Select level</option>
 {(levels.data ?? []).map((level) => (
 <option key={level.id} value={level.id}>
 {level.code} · {level.title}
 </option>
 ))}
 </select>
 </label>
 <div className="grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Intake</span>
 <select required value={intakeId} onChange={(e) => setIntakeId(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Select intake</option>
 {(intakes.data ?? []).map((intake) => (
 <option key={intake.id} value={intake.id}>
 {intake.name}
 </option>
 ))}
 </select>
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Campus</span>
 <select required value={campusId} onChange={(e) => setCampusId(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Select campus</option>
 {(campuses.data ?? []).map((campus) => (
 <option key={campus.id} value={campus.id}>
 {campus.name}
 </option>
 ))}
 </select>
 </label>
 </div>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Teacher</span>
 <select value={teacherId} onChange={(e) => setTeacherId(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Assign teacher later</option>
 {(teachers.data ?? []).map((teacher) => (
 <option key={teacher.id} value={teacher.id}>
 {teacher.firstName} {teacher.lastName}
 </option>
 ))}
 </select>
 </label>
 <div className="grid gap-3 sm:grid-cols-3">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Shift</span>
 <select value={shift} onChange={(e) => setShift(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 {SHIFTS.map((option) => (
 <option key={option} value={option}>
 {humanize(option)}
 </option>
 ))}
 </select>
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Capacity</span>
 <input value={capacity} onChange={(e) => setCapacity(e.currentTarget.value)} inputMode="numeric" placeholder="e.g. 30" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Room</span>
 <input value={room} onChange={(e) => setRoom(e.currentTarget.value)} placeholder="e.g. Room 2" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 </div>
 {formError ? (
 <p role="alert" className="text-xs font-medium text-error">
 {formError}
 </p>
 ) : null}
 <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
 {saving ? <span className="loading loading-spinner loading-sm" /> : 'Create class'}
 </button>
 </form>
 </Panel>

 <Panel className="lg:col-span-2">
 <SectionHeader title={`Classes (${classes.data?.length ?? 0})`} />
 {classes.loading ? (
 <LoadingBlock label="Loading classes…" />
 ) : classes.error || !classes.data ? (
 <ErrorBlock message={classes.error ?? 'Could not load classes.'} onRetry={classes.refetch} />
 ) : classes.data.length === 0 ? (
 <EmptyBlock title="No classes yet" hint="Create the first class group with the form." />
 ) : (
 <div className="overflow-x-auto">
 <table className="table w-full text-xs">
 <thead>
 <tr className="text-muted">
 <th className="text-left">Class</th>
 <th className="text-left">Level</th>
 <th className="text-left">Shift</th>
 <th className="text-left">Status</th>
 </tr>
 </thead>
 <tbody>
 {classes.data.map((group) => (
 <tr key={group.id} className="border-t border-line">
 <td className="py-3 pr-4">
 <p className="font-semibold">{group.name}</p>
 <p className="text-muted">{group.code}</p>
 </td>
 <td className="py-3 pr-4">{levelName(group.levelId)}</td>
 <td className="py-3 pr-4">{humanize(group.shift)}</td>
 <td className="py-3">
 <StatusBadge status="Active" />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </Panel>
 </div>
 );
}

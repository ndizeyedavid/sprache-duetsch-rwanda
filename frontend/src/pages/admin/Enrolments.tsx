import { useState } from 'react';
import type { FormEvent } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { rwf } from '../../lib/format';
import {
 createEnrollment,
 humanize,
 isoDate,
 listClasses,
 listEnrollments,
 listIntakesFull,
 listLevels,
 listStudents,
 money,
} from '../../lib/services';

export function AdminEnrolments() {
 const enrolments = useApi('admin-enrolments', listEnrollments);
 const students = useApi('admin-students', listStudents);
 const levels = useApi('levels-catalog', listLevels);
 const intakes = useApi('intakes-full', listIntakesFull);
 const classes = useApi('admin-classes', listClasses);

 const [studentId, setStudentId] = useState('');
 const [levelId, setLevelId] = useState('');
 const [intakeId, setIntakeId] = useState('');
 const [classGroupId, setClassGroupId] = useState('');
 const [totalFee, setTotalFee] = useState('');
 const [formError, setFormError] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);

 // Only offer class groups that belong to the chosen level.
 const classOptions = (classes.data ?? []).filter(
 (group) => !levelId || group.levelId === levelId,
 );

 async function handleCreate(event: FormEvent) {
 event.preventDefault();
 setFormError(null);
 setSaving(true);
 try {
 await createEnrollment({
 studentId,
 levelId,
 intakeId,
 classGroupId: classGroupId || undefined,
 totalFee: totalFee ? Number(totalFee) : undefined,
 });
 setClassGroupId('');
 setTotalFee('');
 enrolments.refetch();
 } catch (err) {
 setFormError(apiErrorMessage(err, 'Could not create the enrolment.'));
 } finally {
 setSaving(false);
 }
 }

 const rows = enrolments.data ?? [];

 return (
 <div className="grid gap-5 lg:grid-cols-3">
 <Panel className="lg:col-span-1">
 <SectionHeader title="Enrol a student" />
 <form onSubmit={handleCreate} className="space-y-3">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Student</span>
 <select required value={studentId} onChange={(e) => setStudentId(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Select student</option>
 {(students.data ?? []).map((student) => (
 <option key={student.id} value={student.id}>
 {student.user.firstName} {student.user.lastName} ({student.studentCode})
 </option>
 ))}
 </select>
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Level</span>
 <select
 required
 value={levelId}
 onChange={(e) => {
 setLevelId(e.currentTarget.value);
 setClassGroupId('');
 }}
 className="select w-full rounded-field border-line bg-base-200"
 >
 <option value="">Select level</option>
 {(levels.data ?? []).map((level) => (
 <option key={level.id} value={level.id}>
 {level.code} · {level.title}
 </option>
 ))}
 </select>
 </label>
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
 <span className="mb-1.5 block text-xs font-medium">Class</span>
 <select value={classGroupId} onChange={(e) => setClassGroupId(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Assign class later</option>
 {classOptions.map((group) => (
 <option key={group.id} value={group.id}>
 {group.name}
 </option>
 ))}
 </select>
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Tuition override</span>
 <input value={totalFee} onChange={(e) => setTotalFee(e.currentTarget.value)} inputMode="numeric" placeholder="e.g. 45000 (leave empty for default)" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 {formError ? (
 <p role="alert" className="text-xs font-medium text-error">
 {formError}
 </p>
 ) : null}
 <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
 {saving ? <span className="loading loading-spinner loading-sm" /> : 'Enrol student'}
 </button>
 </form>
 </Panel>

 <Panel className="lg:col-span-2">
 <SectionHeader title={`Enrolments (${rows.length})`} />
 {enrolments.loading ? (
 <LoadingBlock label="Loading enrolments…" />
 ) : enrolments.error || !enrolments.data ? (
 <ErrorBlock message={enrolments.error ?? 'Could not load enrolments.'} onRetry={enrolments.refetch} />
 ) : rows.length === 0 ? (
 <EmptyBlock title="No enrolments yet" hint="Enrol a registered student into a level and intake." />
 ) : (
 <div className="overflow-x-auto">
 <table className="table w-full text-xs">
 <thead>
 <tr className="text-muted">
 <th className="text-left">Student</th>
 <th className="text-left">Level</th>
 <th className="text-left">Intake</th>
 <th className="text-left">Class</th>
 <th className="text-left">Fee</th>
 <th className="text-left">Status</th>
 </tr>
 </thead>
 <tbody>
 {rows.map((row) => (
 <tr key={row.id} className="border-t border-line">
 <td className="py-3 pr-4">
 <p className="font-semibold">
 {row.student.user.firstName} {row.student.user.lastName}
 </p>
 <p className="text-muted">{row.student.studentCode}</p>
 </td>
 <td className="py-3 pr-4">{row.level.code}</td>
 <td className="py-3 pr-4">{row.intake.name}</td>
 <td className="py-3 pr-4">{row.classGroup?.name ?? '—'}</td>
 <td className="py-3 pr-4">
 {rwf(money(row.totalFee))}
 <span className="block text-muted">Enrolled {isoDate(row.enrolledAt)}</span>
 </td>
 <td className="py-3">
 <StatusBadge status={humanize(row.status)} />
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

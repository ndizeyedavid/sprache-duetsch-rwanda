import type { FormEvent } from 'react';
import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { LevelItem,StudentRow } from '../../lib/services';
import { runPlacement } from '../../lib/services';

export function StudentPlacement({ students, levels, onSaved }: { students: StudentRow[]; levels: LevelItem[]; onSaved: () => void }) {
 const [placeStudent, setPlaceStudent] = useState('');
 const [placeScore, setPlaceScore] = useState('');
 const [placeLevel, setPlaceLevel] = useState('');
 const [placeNote, setPlaceNote] = useState('');
 const [placeResult, setPlaceResult] = useState<string | null>(null);
 const [placeError, setPlaceError] = useState<string | null>(null);
 const [placing, setPlacing] = useState(false);

 async function handlePlacement(event: FormEvent) {
 event.preventDefault();
 setPlaceError(null);
 setPlaceResult(null);
 setPlacing(true);
 try {
 const result = await runPlacement(placeStudent, {
 score: Number(placeScore),
 recommendedLevelId: placeLevel || undefined,
 note: placeNote.trim() || undefined,
 });
 setPlaceResult(`Score ${result.score} → recommended ${result.recommendedLevel.code} (${result.recommendedLevel.title}).`);
 onSaved();
 } catch (err) {
 setPlaceError(apiErrorMessage(err, 'Could not save the placement.'));
 } finally {
 setPlacing(false);
 }
 }

 return (
<div className="space-y-4">
 <form onSubmit={handlePlacement} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Student</span>
 <select required value={placeStudent} onChange={(event) => setPlaceStudent(event.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Select student</option>
 {students.map((row) => (
 <option key={row.id} value={row.id}>
 {row.user.firstName} {row.user.lastName}
 </option>
 ))}
 </select>
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Score (0–100)</span>
 <input required value={placeScore} onChange={(event) => setPlaceScore(event.currentTarget.value)} type="number" inputMode="numeric" min={0} max={100} placeholder="e.g. 72" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Override level</span>
 <select value={placeLevel} onChange={(event) => setPlaceLevel(event.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Auto level</option>
 {levels.map((level) => (
 <option key={level.id} value={level.id}>
 Override: {level.code}
 </option>
 ))}
 </select>
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Note</span>
 <input value={placeNote} onChange={(event) => setPlaceNote(event.currentTarget.value)} placeholder="Optional note" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 <div className="flex items-end">
 <button type="submit" disabled={placing} className="btn btn-sm w-full rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
 {placing ? 'Saving…' : 'Save placement'}
 </button>
 </div>
 </form>
 {placeError ? (
 <p role="alert" className="mt-2 text-xs font-medium text-error">
 {placeError}
 </p>
 ) : null}
 {placeResult ? <p role="status" className="alert alert-success alert-soft mt-3 text-xs">{placeResult}</p> : null}
 </div>
 );
}

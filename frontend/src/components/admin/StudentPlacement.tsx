import { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import type { LevelItem,StudentRow } from '../../lib/services';
import { getPlacementQueue } from '../../lib/services/placement-api';
import { PlacementQueue } from '../placement/admin/PlacementQueue';
import { StudentPlacementPanel } from '../placement/admin/StudentPlacementPanel';

type Props = { students: StudentRow[]; levels: LevelItem[]; onSaved: () => void };

/**
 * Academic placement desk: results awaiting a decision, then per student the history
 * (recommended vs student's choice vs assigned), confirm/override and manual entry.
 */
export function StudentPlacement({ students, levels, onSaved }: Props) {
  const [studentId, setStudentId] = useState('');
  const queue = useApi('placement-queue', getPlacementQueue);
  const changed = () => { queue.refetch(); onSaved(); };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-[0.6875rem] font-medium">Student</span>
        <select value={studentId} onChange={(event) => setStudentId(event.currentTarget.value)} className="select select-sm w-full rounded-field bg-base-200">
          <option value="">Awaiting decision ({queue.data?.length ?? '…'})</option>
          {students.map((row) => (
            <option key={row.id} value={row.id}>
              {row.user.firstName} {row.user.lastName} · {row.studentCode}
            </option>
          ))}
        </select>
      </label>
      {studentId ? (
        <>
          <button type="button" className="btn btn-xs btn-ghost gap-1 rounded-full" onClick={() => setStudentId('')}>
            <FiArrowLeft aria-hidden />
            Back to results awaiting a decision
          </button>
          <StudentPlacementPanel key={studentId} studentId={studentId} levels={levels} onChanged={changed} />
        </>
      ) : (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Awaiting decision</h3>
          <p className="text-xs text-muted">Open a result to confirm the recommended level or override it with a reason. Enrolment staff use the assigned level.</p>
          <PlacementQueue queue={queue} onSelect={setStudentId} />
        </section>
      )}
    </div>
  );
}

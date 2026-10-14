import { useState } from 'react';
import { createStudentFromApplication,transitionApplication,updateApplication } from '../../lib/admissions-api';
import type { ApplicationStatus,StudentFromApplication } from '../../lib/admissions-types';
import { apiErrorMessage } from '../../lib/api';
import { STATUS_LABEL } from './constants';

export type Notice = { tone: 'ok' | 'error'; text: string };
export type CoursePatch = Parameters<typeof updateApplication>[1];
export type StudentRequest = Parameters<typeof createStudentFromApplication>[1];

/** Writes from the review drawer: one busy flag, one feedback line, refresh after each success. */
export function useDrawerActions(applicationId: string | null, onChanged: () => void) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [created, setCreated] = useState<StudentFromApplication | null>(null);

  async function run(work: (id: string) => Promise<string>) {
    if (!applicationId) return;
    setBusy(true);
    setNotice(null);
    try {
      const text = await work(applicationId);
      setNotice({ tone: 'ok', text });
      onChanged();
    } catch (err) {
      setNotice({ tone: 'error', text: apiErrorMessage(err, 'That action did not go through. Please try again.') });
    } finally {
      setBusy(false);
    }
  }

  return {
    busy,
    notice,
    created,
    reset: () => { setNotice(null); setCreated(null); },
    saveCourse: (patch: CoursePatch) => run(async (id) => { await updateApplication(id, patch); return 'Course details saved.'; }),
    transition: (status: ApplicationStatus, reason?: string) =>
      run(async (id) => { await transitionApplication(id, status, reason); return `Application marked ${STATUS_LABEL[status].toLowerCase()}.`; }),
    createStudent: (body: StudentRequest) =>
      run(async (id) => {
        const result = await createStudentFromApplication(id, body);
        setCreated(result);
        const what = result.accountCreated ? `Student account ${result.studentCode} created` : `Linked to existing student ${result.studentCode}`;
        return result.enrollmentId ? `${what} and enrolled.` : `${what}.`;
      }),
  };
}

export type DrawerActions = ReturnType<typeof useDrawerActions>;

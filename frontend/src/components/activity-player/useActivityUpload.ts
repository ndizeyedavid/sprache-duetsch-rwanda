import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { uploadActivityFile } from '../../lib/activity-files';
import type { FileResponse } from './types';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Upload a student's recording or document for an activity and return the response to submit. */
export function useActivityUpload(activityId: string) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function upload(file: File): Promise<FileResponse | null> {
    setError('');
    if (file.size > MAX_UPLOAD_BYTES) { setError('Files must be 10 MB or smaller.'); return null; }
    setBusy(true);
    try { const result = await uploadActivityFile(activityId, file); return { fileUrl: result.fileUrl, mimeType: result.mimeType }; }
    catch (e) { setError(apiErrorMessage(e, 'Upload failed. Check your connection and try again.')); return null; }
    finally { setBusy(false); }
  }
  return { upload, busy, error };
}

import { useCallback,useState } from 'react';
import { apiErrorMessage,downloadFile } from '../../lib/api';

/** Shared PDF download state for the documents view (certificates + receipts). */
export function useDocumentDownload() {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async (id: string, number: string, path: string) => {
    setError(null);
    setPendingId(id);
    try {
      await downloadFile(path, `${number}.pdf`);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not download the PDF. Check your connection and try again.'));
    } finally {
      setPendingId(null);
    }
  }, []);

  return { pendingId, error, download };
}

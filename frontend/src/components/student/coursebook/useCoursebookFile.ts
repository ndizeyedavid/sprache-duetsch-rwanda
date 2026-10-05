import { useCallback, useEffect, useRef, useState } from 'react';
import { getCoursebookPdf } from '../../../lib/coursebook';
import { apiErrorMessage } from '../../../lib/api';

export function useCoursebookFile(levelId: string) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const resource = useRef<{ url: string; pending?: Promise<string>; controller?: AbortController }>({ url: '' });
  useEffect(() => () => {
    resource.current.controller?.abort();
    if (resource.current.url) URL.revokeObjectURL(resource.current.url);
  }, []);
  const load = useCallback((): Promise<string> => {
    if (resource.current.url) return Promise.resolve(resource.current.url);
    if (resource.current.pending) return resource.current.pending;
    const controller = new AbortController();
    resource.current.controller = controller;
    setLoading(true);
    setError('');
    const pending = getCoursebookPdf(levelId, controller.signal).then(blob => {
      if (controller.signal.aborted) throw new Error('Download cancelled');
      const next = URL.createObjectURL(blob);
      resource.current.url = next;
      setUrl(next);
      return next;
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(apiErrorMessage(cause, 'Could not load the PDF. Please try again.'));
      throw cause;
    }).finally(() => {
      resource.current.pending = undefined;
      if (!controller.signal.aborted) setLoading(false);
    });
    resource.current.pending = pending;
    return pending;
  }, [levelId]);
  return { url, loading, error, load };
}

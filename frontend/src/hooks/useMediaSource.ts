import { useEffect,useState } from 'react';
import { protectedMaterialPath } from '../components/student/materialFiles';
import { api } from '../lib/api';

export function useMediaSource(url: string | null | undefined) {
  const [result, setResult] = useState<{ url?: string; source: string | null; error: boolean }>({ source: null, error: false });
  useEffect(() => {
    if (!url) return;
    const path = protectedMaterialPath(url);
    if (!path) return;
    const controller = new AbortController();
    let objectUrl: string | null = null;
    void api.get(path, { responseType: 'blob', signal: controller.signal }).then(response => {
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(response.data as Blob);
      setResult({ url, source: objectUrl, error: false });
    }).catch(() => { if (!controller.signal.aborted) setResult({ url, source: null, error: true }); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url]);
  if (!url) return { source: null, error: false };
  if (!protectedMaterialPath(url)) return { source: url, error: false };
  return result.url === url ? result : { source: null, error: false };
}

import { api,API_BASE_URL,downloadFile } from '../../lib/api';

export function protectedMaterialPath(value: string): string | null {
  const base = new URL(API_BASE_URL.replace(/\/$/, ""), window.location.origin);
  try {
    const url = new URL(value, base.origin);
    if (url.origin !== base.origin || !url.pathname.startsWith(`${base.pathname}/`)) return null;
    return `${url.pathname.slice(base.pathname.length)}${url.search}`;
  } catch { return null; }
}

export async function openMaterial(value: string, title: string): Promise<void> {
  const path = protectedMaterialPath(value);
  if (!path) { window.open(value, '_blank', 'noopener,noreferrer'); return; }
  const tab = window.open('', '_blank');
  try {
    const response = await api.get(path, { responseType: 'blob' });
    const objectUrl = URL.createObjectURL(response.data as Blob);
    if (tab) { tab.document.title = title; tab.location.href = objectUrl; }
    else { const link = document.createElement('a'); link.href = objectUrl; link.download = title; link.click(); }
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch {
    tab?.close();
    throw new Error('Could not open this resource. Check your connection and try again.');
  }
}

export async function downloadMaterial(value: string, title: string): Promise<void> {
  const path = protectedMaterialPath(value);
  if (path) return downloadFile(path, title);
  const link = document.createElement('a');
  link.href = value; link.download = title; link.target = '_blank'; link.rel = 'noreferrer';
  document.body.appendChild(link); link.click(); link.remove();
}

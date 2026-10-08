import { API_BASE_URL, api } from './api';

export function profilePhotoUrl(url: string): string {
  return url.startsWith('/api/uploads/') ? `${API_BASE_URL.replace(/\/api\/?$/, '')}${url}` : url;
}

export async function uploadProfilePhoto(file: File): Promise<void> {
  const form = new FormData(); form.append('file', file);
  await api.post('/uploads/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
}

/** Keep profile photos small enough for slow mobile connections. */
export async function prepareProfilePhoto(file: File): Promise<File> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG or WebP photo.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Choose a photo smaller than 5 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not prepare the photo. Please try another image.');
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not prepare the photo.')), 'image/jpeg', 0.85));
    return new File([blob], 'profile.jpg', { type: 'image/jpeg' });
  } finally { bitmap.close(); }
}

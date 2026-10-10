import { badRequest } from '../../lib/http-error.js';

/** Inspect file bytes; a filename or browser-supplied MIME type is not evidence. */
export function avatarImageType(bytes: Buffer): { mime: string; extension: string } {
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && bytes.toString('ascii', 12, 16) === 'IHDR') {
    return { mime: 'image/png', extension: '.png' };
  }
  if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return { mime: 'image/jpeg', extension: '.jpg' };
  if (bytes.length >= 16 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return { mime: 'image/webp', extension: '.webp' };
  throw badRequest('Choose a JPG, PNG or WebP profile photo');
}

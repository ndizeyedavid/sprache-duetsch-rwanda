import { describe, expect, it } from 'vitest';
import { avatarImageType } from './avatar-image.js';
describe('profile photo file validation', () => {
  it('accepts PNG bytes regardless of the filename', () => {
    const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jp1sAAAAASUVORK5CYII=', 'base64');
    expect(avatarImageType(bytes).mime).toBe('image/png');
  });
  it('rejects SVG, HTML and files with only a claimed image MIME type', () => {
    for (const body of ['<svg></svg>', '<html></html>', '%PDF-1.7', '']) expect(() => avatarImageType(Buffer.from(body))).toThrow();
  });
});

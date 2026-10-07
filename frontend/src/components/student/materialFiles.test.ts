import { expect,it,vi } from 'vitest';
import { protectedMaterialPath } from './materialFiles';
vi.mock('../../lib/api', () => ({ API_BASE_URL: 'http://localhost:4000/api', api: {}, downloadFile: vi.fn() }));
it('resolves relative and absolute API resources without authorizing unrelated origins', () => {
  vi.stubGlobal('window', { location: { origin: 'http://localhost:5173' } });
  expect(protectedMaterialPath('/api/uploads/audio.mp3')).toBe('/uploads/audio.mp3');
  expect(protectedMaterialPath('http://localhost:4000/api/uploads/a.pdf')).toBe('/uploads/a.pdf');
  expect(protectedMaterialPath('https://external.example/api/uploads/a.pdf')).toBeNull();
  expect(protectedMaterialPath('http://localhost:4000/api-other/file')).toBeNull();
  vi.unstubAllGlobals();
});

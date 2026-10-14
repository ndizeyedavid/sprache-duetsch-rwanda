import { describe,expect,it } from 'vitest';
import type { StudentNote } from '../../lib/student-notes';
import { filterNotes,formatBytes,groupNotes,noteTypeLabel } from './notes-utils';

function note(id: string, title: string, type: string, lesson: [string, string], module: [string, string]): StudentNote {
  return {
    id, title, type, url: `/api/uploads/${id}`, mimeType: null, sizeBytes: null, isDownloadable: true, createdAt: '2026-10-01T00:00:00Z',
    lessonId: lesson[0], lesson: { id: lesson[0], title: lesson[1], module: { id: module[0], title: module[1], levelId: 'a1' } },
  };
}

const notes = [
  note('n1', 'Verben im Präsens', 'PDF', ['l2', 'Lektion 2'], ['m10', 'Modul 10']),
  note('n2', 'Wortschatz Familie', 'NOTE', ['l1', 'Lektion 1'], ['m2', 'Modul 2']),
  note('n3', 'Arbeitsblatt Zahlen', 'WORKSHEET', ['l1', 'Lektion 1'], ['m2', 'Modul 2']),
];

describe('filterNotes', () => {
  it('matches note, lesson and module titles without case', () => {
    expect(filterNotes(notes, 'familie', null).map(n => n.id)).toEqual(['n2']);
    expect(filterNotes(notes, 'MODUL 2', null).map(n => n.id)).toEqual(['n2', 'n3']);
    expect(filterNotes(notes, '  ', null)).toHaveLength(3);
  });

  it('limits to one type', () => {
    expect(filterNotes(notes, '', 'PDF').map(n => n.id)).toEqual(['n1']);
    expect(filterNotes(notes, 'familie', 'PDF')).toEqual([]);
  });
});

describe('groupNotes', () => {
  it('groups module → lesson in natural order', () => {
    const groups = groupNotes(notes);
    expect(groups.map(g => g.moduleTitle)).toEqual(['Modul 2', 'Modul 10']);
    expect(groups[0].lessons).toHaveLength(1);
    expect(groups[0].lessons[0].notes.map(n => n.title)).toEqual(['Arbeitsblatt Zahlen', 'Wortschatz Familie']);
  });
});

describe('labels', () => {
  it('formats sizes and type names', () => {
    expect(formatBytes(null)).toBeNull();
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB');
    expect(noteTypeLabel('WORKSHEET')).toBe('Worksheet');
    expect(noteTypeLabel('AUDIO')).toBe('Audio');
  });
});

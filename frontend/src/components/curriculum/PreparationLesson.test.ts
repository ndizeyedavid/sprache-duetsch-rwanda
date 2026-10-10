import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { AuthoredLesson } from '../../lib/services';
import { PreparationLesson } from './PreparationLesson';

const state = vi.hoisted(() => ({ published: true }));
vi.mock('../../hooks/useApi', () => ({
  useApi: () => ({ loading: false, error: null, refetch: vi.fn(), data: {
    id: 'lesson', moduleId: 'module', title: 'Lesson', description: null,
    body: null, videoUrl: null, audioUrl: null, estimatedMinutes: null,
    contentType: 'TEXT', order: 0, isPublished: state.published, materials: [], activities: [],
  } satisfies AuthoredLesson }),
}));
vi.mock('./studio/LessonContentFields', () => ({ LessonContentFields: () => null }));

function render(modulePublished: boolean) {
  return renderToStaticMarkup(createElement(PreparationLesson, {
    id: 'lesson', moduleTitle: 'Module', modulePublished,
    onSaved: vi.fn(), onDirty: vi.fn(), onDeleted: vi.fn(),
  }));
}

describe('lesson publication controls', () => {
  it('offers publishing the module when a published lesson is hidden by a draft module', () => {
    state.published = true;
    const html = render(false);
    expect(html).toContain('Module draft');
    expect(html).toContain('Publish module');
    expect(html).not.toMatch(/>Published<\/span>/);
  });

  it('shows published only after both the lesson and module are published', () => {
    state.published = true;
    const html = render(true);
    expect(html).toMatch(/>Published<\/span>/);
    expect(html).not.toContain('Publish module');
  });

  it.each([false, true])('offers lesson publishing for a draft lesson (module published: %s)', modulePublished => {
    state.published = false;
    const html = render(modulePublished);
    expect(html).toMatch(/>Draft<\/span>/);
    expect(html).toContain('Publish lesson');
    expect(html).not.toMatch(/>Published<\/span>/);
  });
});

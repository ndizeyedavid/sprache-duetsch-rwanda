import { describe,expect,it } from 'vitest';
import { activityIdFromFileName,acceptedActivityFileTypes,fileNameFromUrl } from './activity-file-policy.js';
import { buildActivityReview,presentSubmission } from './activity-review.js';
import { stableShuffle } from './activity-shuffle.js';

describe('post-submission review', () => {
  it('reveals blank answers with per-blank results', () => {
    const config = { sentences: [{ text: 'Ich ___ aus Ruanda.', answer: 'komme' }, { text: 'Ich ___ 20.', answer: ['bin'] }] };
    expect(buildActivityReview('FILL_BLANK', config, ['komme', 'habe'])).toEqual({ blanks: [['komme'], ['bin']], results: [true, false] });
  });
  it('reveals the transcript and correct indices for listening', () => {
    const config = { audioUrl: '/a.mp3', transcript: 'Hallo, ich bin Nella.', questions: [{ prompt: 'Wer?', options: ['Nella', 'Tom'], correctIndex: 0 }] };
    expect(buildActivityReview('LISTENING', config, [1])).toEqual({ transcript: 'Hallo, ich bin Nella.', correctIndices: [0], results: [false] });
  });
  it('reveals matching pairs, ordering and model answers', () => {
    expect(buildActivityReview('MATCHING', { pairs: [{ left: 'Hallo', right: 'Muraho' }] }, ['Muraho'])).toEqual({ pairs: [{ left: 'Hallo', right: 'Muraho' }], results: [true] });
    expect(buildActivityReview('ORDERING', { items: ['a', 'b'] }, ['b', 'a'])).toEqual({ order: ['a', 'b'], results: [false, false] });
    expect(buildActivityReview('WRITING', { prompt: 'p', modelAnswer: 'Ich heiße Nella.' }, 'Hallo')).toEqual({ modelAnswer: 'Ich heiße Nella.', results: null });
    expect(buildActivityReview('TRUE_FALSE', { correct: false }, true)).toEqual({ correct: false, results: [false] });
  });
  it('leaves structured self-study on practiceFeedback', () => {
    const activity = { type: 'MCQ', config: { practiceMode: true, options: ['a'], correctIndex: 0 } };
    const shown = presentSubmission({ id: 's', response: 0 }, activity);
    expect(shown).toEqual({ id: 's', response: 0, practiceFeedback: activity.config });
    expect(presentSubmission({ id: 's', response: 0 }, { type: 'MCQ', config: { options: ['a'], correctIndex: 0 } }))
      .toEqual({ id: 's', response: 0, review: { correctIndex: 0, results: [true] } });
  });
});

describe('activity uploads', () => {
  it('accepts audio for speaking tasks and documents for file submissions only', () => {
    expect(acceptedActivityFileTypes('SPEAKING', {})).toContain('audio/webm');
    expect(acceptedActivityFileTypes('PRONUNCIATION', null)).toContain('audio/mp4');
    expect(acceptedActivityFileTypes('WRITING', { isDocumentSubmission: true })).toEqual(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);
    expect(acceptedActivityFileTypes('WRITING', {})).toEqual([]);
    expect(acceptedActivityFileTypes('MCQ', {})).toEqual([]);
  });
  it('reads the activity id only from server-chosen names', () => {
    const name = 'activity-3f1c2b9a-1111-4222-8333-944455556666-0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d.webm';
    expect(activityIdFromFileName(name)).toBe('3f1c2b9a-1111-4222-8333-944455556666');
    expect(activityIdFromFileName('1700000000-0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d.pdf')).toBeNull();
    expect(activityIdFromFileName('avatar-0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d.png')).toBeNull();
  });
  it('extracts storage names from upload URLs and rejects traversal', () => {
    expect(fileNameFromUrl('/api/uploads/activity-x.webm')).toBe('activity-x.webm');
    expect(fileNameFromUrl('http://localhost:4000/api/uploads/a.webm')).toBe('a.webm');
    expect(fileNameFromUrl('/api/uploads/../secret')).toBeNull();
    expect(fileNameFromUrl(42)).toBeNull();
  });
});

describe('stable shuffle', () => {
  it('is deterministic per seed and never returns the authored order', () => {
    const values = ['a', 'b', 'c', 'd'];
    for (const seed of ['1', '2', '3', 'activity-x', 'activity-y']) {
      const shuffled = stableShuffle(values, seed);
      expect(shuffled).not.toEqual(values);
      expect([...shuffled].sort()).toEqual(values);
      expect(stableShuffle(values, seed)).toEqual(shuffled);
    }
    expect(stableShuffle(['same', 'same'], 's')).toEqual(['same', 'same']);
  });
});

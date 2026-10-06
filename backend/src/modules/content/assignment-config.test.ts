import { expect,it } from 'vitest';
import { sanitizeActivityConfig } from './assignment-config.js';
it('removes answer keys at every nesting depth while preserving prompts and options', () => {
  expect(sanitizeActivityConfig({ answer: 'secret', items: [{ id: 'one', prompt: 'Hello', answer: 'Hallo', choices: ['Hallo', 'Danke'] }] }))
    .toEqual({ autoGraded: true, items: [{ id: 'one', prompt: 'Hello', choices: ['Hallo', 'Danke'] }] });
});

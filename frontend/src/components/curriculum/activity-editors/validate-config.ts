import type { Config } from './editor-config';
import { questionRows,rows,splitAlternatives,str,strings } from './editor-config';

const blank = (value: unknown) => str(value).trim() === '';

function checkOptions(options: string[], what: string): string | null {
  if (options.length < 2) return `${what} needs at least two answers.`;
  if (options.some(option => !option.trim())) return `Fill in every answer for ${what.toLowerCase()}, or remove the empty one.`;
  return null;
}

/** A teacher-facing message for the first problem in an edited config, or null when it can be saved. */
export function validateConfig(type: string, c: Config): string | null {
  switch (type) {
    case 'MCQ':
    case 'MULTIPLE_SELECT': {
      if (blank(c.question)) return 'Write the question.';
      const options = strings(c.options, []);
      const problem = checkOptions(options, 'The question');
      if (problem) return problem;
      if (type === 'MCQ') return Number(c.correctIndex) < options.length ? null : 'Mark the correct answer.';
      return Array.isArray(c.correctIndices) && c.correctIndices.length ? null : 'Mark at least one correct answer.';
    }
    case 'TRUE_FALSE': return blank(c.statement) ? 'Write the statement.' : null;
    case 'FILL_BLANK': {
      const sentences = rows(c.sentences);
      if (!sentences.length) return 'Add at least one sentence.';
      const at = sentences.findIndex(row => !/_{2,}/.test(str(row.text)) || !splitAlternatives(row.answer).length);
      return at < 0 ? null : `Sentence ${at + 1} needs a ___ blank and at least one accepted answer.`;
    }
    case 'MATCHING': {
      const pairs = rows(c.pairs);
      if (pairs.length < 2) return 'Add at least two pairs.';
      return pairs.some(pair => blank(pair.left) || blank(pair.right)) ? 'Fill in both sides of every pair.' : null;
    }
    case 'ORDERING': {
      const items = strings(c.items, []);
      if (items.length < 2) return 'Add at least two items.';
      return items.some(item => !item.trim()) ? 'Fill in every item, or remove the empty one.' : null;
    }
    case 'LISTENING':
    case 'READING': {
      if (type === 'LISTENING' && blank(c.audioUrl)) return 'Upload or link the listening audio.';
      if (type === 'READING' && blank(c.passage)) return 'Add the reading passage.';
      const questions = questionRows(c.questions);
      if (!questions.length) return 'Add at least one question.';
      for (const [i, q] of questions.entries()) {
        if (!q.prompt.trim()) return `Write question ${i + 1}.`;
        const problem = checkOptions(q.options, `Question ${i + 1}`);
        if (problem) return problem;
        if (q.correctIndex >= q.options.length) return `Mark the correct answer for question ${i + 1}.`;
      }
      return null;
    }
    case 'VOCABULARY':
    case 'FLASHCARD': {
      const cards = rows(c.cards);
      if (!cards.length) return 'Add at least one card.';
      return cards.some(card => blank(card.front) || blank(card.back)) ? 'Every card needs a front and a back.' : null;
    }
    case 'SPEAKING': {
      if (blank(c.prompt)) return 'Describe what students should say.';
      const seconds = Number(c.maxSeconds);
      return !blank(c.maxSeconds) && (!Number.isFinite(seconds) || seconds < 5 || seconds > 600) ? 'Recording time must be between 5 and 600 seconds.' : null;
    }
    case 'PRONUNCIATION': return blank(c.text) ? 'Write the word or phrase to pronounce.' : null;
    default: {
      if (blank(c.prompt)) return 'Write the task for students.';
      const words = Number(c.minWords);
      return !blank(c.minWords) && (!Number.isInteger(words) || words < 0) ? 'Minimum words must be a whole number.' : null;
    }
  }
}

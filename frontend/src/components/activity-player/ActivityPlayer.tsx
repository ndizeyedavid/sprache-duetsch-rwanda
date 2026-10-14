import { ChoicePlayer } from './ChoicePlayer';
import { isDocumentSubmission } from './config-readers';
import { FileSubmissionPlayer } from './FileSubmissionPlayer';
import { FillBlankPlayer } from './FillBlankPlayer';
import { FlashcardPlayer } from './FlashcardPlayer';
import { MatchingPlayer } from './MatchingPlayer';
import { OrderingPlayer } from './OrderingPlayer';
import { QuestionSetPlayer } from './QuestionSetPlayer';
import { RecordingPlayer } from './RecordingPlayer';
import { TrueFalsePlayer } from './TrueFalsePlayer';
import type { PlayerProps } from './types';
import { WritingPlayer } from './WritingPlayer';

/** Renders the answering UI for any lesson activity type. */
export function ActivityPlayer(props: PlayerProps) {
  switch (props.type) {
    case 'MCQ':
    case 'MULTIPLE_SELECT': return <ChoicePlayer {...props} />;
    case 'TRUE_FALSE': return <TrueFalsePlayer {...props} />;
    case 'FILL_BLANK': return <FillBlankPlayer {...props} />;
    case 'MATCHING': return <MatchingPlayer {...props} />;
    case 'ORDERING': return <OrderingPlayer {...props} />;
    case 'LISTENING':
    case 'READING': return <QuestionSetPlayer {...props} />;
    case 'VOCABULARY':
    case 'FLASHCARD': return <FlashcardPlayer {...props} />;
    case 'SPEAKING':
    case 'PRONUNCIATION': return <RecordingPlayer {...props} />;
    default: return isDocumentSubmission(props.type, props.config) ? <FileSubmissionPlayer {...props} /> : <WritingPlayer {...props} />;
  }
}

import { CardsEditor } from './CardsEditor';
import { ChoiceEditor } from './ChoiceEditor';
import type { EditorProps } from './editor-config';
import { FillBlankEditor } from './FillBlankEditor';
import { MatchingEditor } from './MatchingEditor';
import { OrderingEditor } from './OrderingEditor';
import { QuestionSetEditor } from './QuestionSetEditor';
import { SpeakingEditor } from './SpeakingEditor';
import { TrueFalseEditor } from './TrueFalseEditor';
import { WritingEditor } from './WritingEditor';

/** The question editor for one activity type (`type` is the editor kind, so DOCUMENT is separate from WRITING). */
export function ActivityConfigFields(props: EditorProps) {
  switch (props.type) {
    case 'MCQ':
    case 'MULTIPLE_SELECT': return <ChoiceEditor {...props} />;
    case 'TRUE_FALSE': return <TrueFalseEditor {...props} />;
    case 'FILL_BLANK': return <FillBlankEditor {...props} />;
    case 'MATCHING': return <MatchingEditor {...props} />;
    case 'ORDERING': return <OrderingEditor {...props} />;
    case 'LISTENING':
    case 'READING': return <QuestionSetEditor {...props} />;
    case 'VOCABULARY':
    case 'FLASHCARD': return <CardsEditor {...props} />;
    case 'SPEAKING':
    case 'PRONUNCIATION': return <SpeakingEditor {...props} />;
    default: return <WritingEditor {...props} />;
  }
}

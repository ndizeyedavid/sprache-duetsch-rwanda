import type { SessionItem } from '../../types';
import { ChooseView } from './ChooseView';
import { FillView } from './FillView';
import { ListenView } from './ListenView';
import { MatchView } from './MatchView';
import { SpeakView } from './SpeakView';
import { TilesView } from './TilesView';
import { TrueFalseView } from './TrueFalseView';
import type { ItemViewProps } from './types';

/** The right question screen for each kind of practice item. */
export function ItemView({ item, ...props }: ItemViewProps<SessionItem>) {
  switch (item.kind) {
    case 'choose': return <ChooseView item={item} {...props} />;
    case 'match': return <MatchView item={item} {...props} />;
    case 'translate':
    case 'order': return <TilesView item={item} {...props} />;
    case 'fill': return <FillView item={item} {...props} />;
    case 'listen': return <ListenView item={item} {...props} />;
    case 'speak': return <SpeakView item={item} {...props} />;
    case 'truefalse': return <TrueFalseView item={item} {...props} />;
  }
}

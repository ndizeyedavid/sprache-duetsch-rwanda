type ChatBubbleProps = {
 body: string;
 time: string;
 from: 'me' | 'them';
};

export function ChatBubble({ body, time, from }: ChatBubbleProps) {
 const mine = from === 'me';

 return (
 <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
 <p
 className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
 mine ? 'rounded-br-sm bg-brand text-white' : 'rounded-bl-sm bg-base-200 text-ink'
 }`}
 >
 {body}
 </p>
 <span className="mt-1 px-1 text-[10px] text-muted">{time}</span>
 </div>
 );
}

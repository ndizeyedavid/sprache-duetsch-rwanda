import { Fragment,useState } from 'react';
import type { Entry } from '../types';
import { useGlossary } from './glossary-context';
import { groupWords,tokenize } from './tokens';
import { WordPopover } from './WordPopover';

type Open = { key: string; entry: Entry | undefined; anchor: DOMRect };

/** German text whose words (and multi-word phrases) can be tapped for their English meaning. */
export function GermanText({ text, className = '' }: { text: string; className?: string }) {
  const glossary = useGlossary();
  const [open, setOpen] = useState<Open | null>(null);
  const tokens = tokenize(text);
  const groups = groupWords(tokens, glossary);
  const starts = new Map(groups.map((group) => [group.start, group]));
  const parts = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const group = starts.get(index);
    if (!group) { parts.push(<Fragment key={index}>{tokens[index].text}</Fragment>); continue; }
    const label = tokens.slice(group.start, group.end + 1).map((token) => token.text).join('');
    parts.push(<button key={index} type="button" lang="de"
      onClick={(event) => { const anchor = event.currentTarget.getBoundingClientRect(); setOpen({ key: group.key, entry: group.entry, anchor }); }}
      className={`cursor-pointer rounded-sm decoration-dotted underline-offset-4 hover:bg-brand-soft focus-visible:bg-brand-soft ${group.entry ? 'underline decoration-base-300' : ''} ${open?.key === group.key ? 'bg-brand-soft' : ''}`}>{label}</button>);
    index = group.end;
  }
  return <span lang="de" className={className}>
    {parts}
    {open ? <WordPopover word={open.key} entry={open.entry} anchor={open.anchor} onClose={() => setOpen(null)} /> : null}
  </span>;
}

import { Node } from '@tiptap/react';

// Keep imported course tables intact while editing the surrounding lesson.
const cellAttributes = {
  colspan: { default: 1, parseHTML: (element: HTMLElement) => Number(element.getAttribute('colspan') || 1) },
  rowspan: { default: 1, parseHTML: (element: HTMLElement) => Number(element.getAttribute('rowspan') || 1) },
};
export const noteTableNodes = [
  Node.create({ name: 'table', group: 'block', content: '(tableHead | tableBody | tableFoot | tableRow)+', isolating: true, parseHTML: () => [{ tag: 'table' }], renderHTML: ({ HTMLAttributes }) => ['table', HTMLAttributes, 0] }),
  Node.create({ name: 'tableHead', content: 'tableRow+', parseHTML: () => [{ tag: 'thead' }], renderHTML: () => ['thead', 0] }),
  Node.create({ name: 'tableBody', content: 'tableRow+', parseHTML: () => [{ tag: 'tbody' }], renderHTML: () => ['tbody', 0] }),
  Node.create({ name: 'tableFoot', content: 'tableRow+', parseHTML: () => [{ tag: 'tfoot' }], renderHTML: () => ['tfoot', 0] }),
  Node.create({ name: 'tableRow', content: '(tableCell | tableHeader)+', parseHTML: () => [{ tag: 'tr' }], renderHTML: () => ['tr', 0] }),
  Node.create({ name: 'tableCell', content: 'block+', isolating: true, addAttributes: () => cellAttributes, parseHTML: () => [{ tag: 'td' }], renderHTML: ({ HTMLAttributes }) => ['td', HTMLAttributes, 0] }),
  Node.create({ name: 'tableHeader', content: 'block+', isolating: true, addAttributes: () => cellAttributes, parseHTML: () => [{ tag: 'th' }], renderHTML: ({ HTMLAttributes }) => ['th', HTMLAttributes, 0] }),
];

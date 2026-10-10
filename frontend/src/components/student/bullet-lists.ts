/** PDF symbol-font bullets are private-use characters, not portable text glyphs. */
export function normalizeBulletLists(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  for (const table of document.querySelectorAll('table')) {
    const rows = Array.from(table.rows);
    if (!rows.length || !rows.every(row => row.cells.length === 2
      && /^[\uF0B7\u2022]$/.test(row.cells[0].textContent?.trim() ?? ''))) continue;
    const list = document.createElement('ul');
    for (const row of rows) {
      const item = document.createElement('li');
      item.append(...Array.from(row.cells[1].childNodes).map(node => node.cloneNode(true)));
      list.append(item);
    }
    const wrapper = table.parentElement;
    if (wrapper?.classList.contains('course-table-wrap') && wrapper.children.length === 1) wrapper.replaceWith(list);
    else table.replaceWith(list);
  }
  // Also repair the same imported glyph when it appears in ordinary text.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    node.textContent = node.textContent?.replaceAll('\uF0B7', '•') ?? '';
  }
  return document.body.innerHTML;
}

/** Turn repeated coursebook columns into one continuous reading list. */
export function normalizeRepeatedTables(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  for (const table of document.querySelectorAll('table')) {
    const rows = Array.from(table.rows);
    const headings = Array.from(rows[0]?.cells ?? []).map(cell => cell.textContent?.trim());
    if (headings.length < 4 || headings.length % 2 || !headings[0] || !headings[1] || headings[0] === headings[1]
      || !headings.every((text, i) => text === headings[i % 2])) continue;
    const notes = rows.slice(1).filter(row => row.cells.length === 2
      && /^[\uF0B7\u2022]$/.test(row.cells[0].textContent?.trim() ?? ''));
    if (rows.slice(1).some(row => row.cells.length !== headings.length && !notes.includes(row))) continue;
    const entries = rows.slice(1).filter(row => !notes.includes(row));

    const head = document.createElement('thead');
    const header = head.insertRow();
    for (const label of [headings[0] === '#' ? 'Number' : headings[0], headings[1]]) {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.textContent = label;
      header.append(cell);
    }
    const body = document.createElement('tbody');
    for (let column = 0; column < headings.length; column += 2) {
      for (const row of entries) {
        if (!row.cells[column].textContent?.trim()) continue;
        const next = body.insertRow();
        next.append(row.cells[column].cloneNode(true), row.cells[column + 1].cloneNode(true));
      }
    }
    table.replaceChildren(head, body);
    table.classList.add('table', 'course-reading-table');
    if (notes.length) {
      const list = document.createElement('ul');
      for (const row of notes) {
        const item = document.createElement('li');
        item.append(...Array.from(row.cells[1].childNodes).map(node => node.cloneNode(true)));
        list.append(item);
      }
      (table.closest('.course-table-wrap') ?? table).after(list);
    }
  }
  return document.body.innerHTML;
}

/** Restore the Windows/Mac column boundary lost during coursebook extraction. */
export function normalizeTypingTable(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  for (const table of document.querySelectorAll('table')) {
    const rows = Array.from(table.rows);
    const headings = Array.from(rows[0]?.cells ?? []).map(cell => cell.textContent?.trim());
    if (headings.join('|') !== 'Character|Windows (Alt code) Mac|Fallback') continue;
    const entries = rows.slice(1).map(row => ({
      row,
      shortcut: row.cells[1]?.textContent?.match(/^(Alt\s*\+\s*\d{4})\s*(Option.*)$/),
    }));
    if (!entries.length || entries.some(({ row, shortcut }) => row.cells.length !== 3 || !shortcut)) continue;

    const head = document.createElement('thead');
    const header = head.insertRow();
    for (const label of ['Character', 'Windows (Alt code)', 'Mac shortcut', 'Fallback']) {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.textContent = label;
      header.append(cell);
    }
    const body = document.createElement('tbody');
    for (const { row, shortcut } of entries) {
      const next = body.insertRow();
      for (const value of [row.cells[0].textContent, shortcut![1], shortcut![2].replace(/\s*\+\s*/g, ' + '), row.cells[2].textContent]) {
        next.insertCell().textContent = value;
      }
    }
    table.replaceChildren(head, body);
    table.classList.add('table', 'course-typing-table');
    const note = document.createElement('p');
    note.textContent = 'Windows: hold Alt and type the four-digit code on the numeric keypad, then release Alt. The code produces the character in the first column.';
    (table.closest('.course-table-wrap') ?? table).after(note);
  }
  return document.body.innerHTML;
}

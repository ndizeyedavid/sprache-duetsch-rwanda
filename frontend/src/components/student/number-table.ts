/** Recover the two number rows merged by the PDF's tens-table extraction. */
export function repairNumberTable(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  for (const table of document.querySelectorAll('table')) {
    const rows = Array.from(table.rows);
    const headings = Array.from(rows[0]?.cells ?? []).map(cell => cell.textContent?.trim());
    if (headings.join('|') !== '#|German|#|German') continue;
    const merged = rows.find(row => row.cells.length === 4
      && row.cells[0].textContent?.trim() === '50'
      && row.cells[1].textContent?.trim() === 'fünfzig sechzig'
      && row.cells[2].textContent?.trim() === '100'
      && row.cells[3].textContent?.trim() === '(ein)hundert (ein)tausend');
    if (!merged) continue;
    merged.cells[1].textContent = 'fünfzig';
    merged.cells[3].textContent = '(ein)hundert';
    const restored = document.createElement('tr');
    for (const text of ['60', 'sechzig', '1 000', '(ein)tausend']) {
      restored.insertCell().textContent = text;
    }
    merged.after(restored);
  }
  return document.body.innerHTML;
}

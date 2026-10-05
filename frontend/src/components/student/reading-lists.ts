/** Repair numbered prose from the PDF without changing authored lists or inline markup. */
export function normalizeReadingLists(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  for (const paragraph of document.querySelectorAll('p')) {
    if (paragraph.children.length || paragraph.closest('li, table') || paragraph.classList.contains('course-exercise')) continue;
    const text = paragraph.textContent ?? '';
    const parts = text.split(/(?=Always capitalised:|Never capitalised:|Video zum Thema:)/);
    const replacement = document.createDocumentFragment();
    let changed = false;
    for (let part of parts) {
      const label = part.match(/^(Always capitalised:|Never capitalised:)\s*/);
      if (label) {
        const heading = document.createElement('h3');
        heading.textContent = label[1];
        replacement.append(heading);
        part = part.slice(label[0].length);
        changed = true;
      }
      const markers = Array.from(part.matchAll(/(?:^|\s)(\d{1,2})\.\s+/g));
      const first = markers[0];
      const prefix = first ? part.slice(0, first.index).trim() : part.trim();
      // A list begins at the paragraph start or after an introductory colon.
      const candidates = first && (!prefix || prefix.endsWith(':')) ? [first] : [];
      for (const marker of markers.slice(1)) {
        if (candidates.length && Number(marker[1]) === Number(candidates.at(-1)![1]) + 1) candidates.push(marker);
      }
      const appendParagraph = (value: string) => {
        if (!value.trim()) return;
        const element = document.createElement('p');
        element.textContent = value.trim();
        replacement.append(element);
      };
      if (candidates.length < 2) {
        appendParagraph(part);
        continue;
      }
      appendParagraph(prefix);
      const list = document.createElement('ol');
      list.start = Number(candidates[0][1]);
      candidates.forEach((marker, index) => {
        const item = document.createElement('li');
        item.textContent = part.slice(marker.index! + marker[0].length, candidates[index + 1]?.index ?? part.length).trim();
        list.append(item);
      });
      replacement.append(list);
      changed = true;
    }
    if (changed) paragraph.replaceWith(replacement);
  }
  return document.body.innerHTML;
}

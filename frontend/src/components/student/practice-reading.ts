/** Restore question boundaries and answer choices in imported exam reading sections. */
export function normalizePracticeReading(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  for (const heading of document.querySelectorAll('h2')) {
    if (!/^(HÖREN|LESEN)\s*—\s*Teil\s+\d/i.test(heading.textContent ?? '')) continue;
    const paragraphs: Element[] = [];
    let next = heading.nextElementSibling;
    while (next && next.tagName !== 'H2') {
      if (next.tagName === 'P' && !next.children.length) paragraphs.push(next);
      next = next.nextElementSibling;
    }
    if (!paragraphs.length) continue;
    const text = paragraphs.map(element => element.textContent).join(' ');
    const markers = Array.from(text.matchAll(/(?:^|\s)(\d{1,2})\.\s*(?=[^\d\s])/g))
      .filter(marker => (text.slice(0, marker.index).match(/"/g)?.length ?? 0) % 2 === 0);
    if (!markers.length || markers.some((marker, index) => index > 0
      && Number(marker[1]) !== Number(markers[index - 1][1]) + 1)) continue;
    const fragment = document.createDocumentFragment();
    const introduction = text.slice(0, markers[0].index).trim();
    if (introduction) {
      const paragraph = document.createElement('p');
      paragraph.textContent = introduction;
      fragment.append(paragraph);
    }
    const list = document.createElement('ol');
    list.className = 'course-test-questions';
    list.start = Number(markers[0][1]);
    markers.forEach((marker, index) => {
      const item = document.createElement('li');
      const question = text.slice(marker.index! + marker[0].length, markers[index + 1]?.index ?? text.length).trim();
      appendQuestion(document, item, question);
      list.append(item);
    });
    fragment.append(list);
    paragraphs[0].before(fragment);
    paragraphs.forEach(paragraph => paragraph.remove());
  }
  return document.body.innerHTML;
}

function appendQuestion(document: Document, item: HTMLLIElement, text: string) {
  const transcript = text.match(/^"([\s\S]*?)"\s*/);
  if (transcript) {
    const quote = document.createElement('blockquote');
    quote.textContent = transcript[1];
    item.append(quote);
    text = text.slice(transcript[0].length);
  }
  const choices = Array.from(text.matchAll(/(?:^|\s)([abc])\)\s*/g));
  const paragraph = document.createElement('p');
  paragraph.textContent = text.slice(0, choices[0]?.index ?? text.length).trim();
  item.append(paragraph);
  if (!choices.length) return;
  const list = document.createElement('ul');
  list.className = 'course-test-options';
  choices.forEach((choice, index) => {
    const option = document.createElement('li');
    option.textContent = `${choice[1]}) ${text.slice(choice.index! + choice[0].length, choices[index + 1]?.index ?? text.length).trim()}`;
    list.append(option);
  });
  item.append(list);
}

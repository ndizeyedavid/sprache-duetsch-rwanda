/** Format imported letters, writing prompts and speaking tasks as readable blocks. */
export function normalizePracticeText(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  for (const heading of document.querySelectorAll('h2')) {
    const title = heading.textContent ?? '';
    if (!/^(LESEN|SCHREIBEN|SPRECHEN)/.test(title)) continue;
    let next = heading.nextElementSibling;
    while (next && next.tagName !== 'H2') {
      const element = next;
      next = next.nextElementSibling;
      if (element.tagName !== 'P' || element.children.length) continue;
      const text = element.textContent ?? '';
      if (title === 'SPRECHEN' && /Teil 1 —.*Teil 2 —.*Teil 3 —/.test(text)) {
        const fragment = document.createDocumentFragment();
        for (const part of text.split(/(?=Teil [123] —)/)) {
          if (!part.trim()) continue;
          const [label, ...rest] = part.split(' — ');
          const subheading = document.createElement('h3');
          subheading.textContent = label;
          fragment.append(subheading);
          const tasks = rest.join(' — ').split(/(?=Karte (?:Essen|Freizeit|Wohnen) —|Bild (?:Telefon|Fenster|Stift) →)/);
          appendParagraph(document, fragment, tasks[0]);
          if (tasks.length > 1) {
            const list = document.createElement('ul');
            for (const task of tasks.slice(1)) {
              const item = document.createElement('li');
              item.textContent = task.trim();
              list.append(item);
            }
            fragment.append(list);
          }
        }
        element.replaceWith(fragment);
      } else if (title.startsWith('SCHREIBEN') && text.includes('Modellantwort:')) {
        const [instructions, answer] = text.split('Modellantwort:');
        const fragment = document.createDocumentFragment();
        const [introduction, ...prompts] = instructions.split(' — ');
        appendParagraph(document, fragment, introduction);
        const list = document.createElement('ul');
        for (const prompt of prompts) {
          const item = document.createElement('li');
          item.textContent = prompt.trim();
          list.append(item);
        }
        fragment.append(list);
        const label = document.createElement('h3');
        label.textContent = 'Modellantwort';
        fragment.append(label, letter(document, answer));
        element.replaceWith(fragment);
      } else if (text.includes(' > ')) {
        element.replaceWith(letter(document, text));
      }
    }
  }
  return document.body.innerHTML;
}

function appendParagraph(document: Document, parent: Node, text: string) {
  if (!text.trim()) return;
  const paragraph = document.createElement('p');
  paragraph.textContent = text.trim();
  parent.appendChild(paragraph);
}

function letter(document: Document, text: string) {
  const block = document.createElement('blockquote');
  block.className = 'course-test-letter';
  for (const paragraph of text.split(/\s*>\s*/)) appendParagraph(document, block, paragraph);
  return block;
}

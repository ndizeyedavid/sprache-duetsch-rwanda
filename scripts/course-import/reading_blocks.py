"""Repair prose lists misidentified as tables by PDF column extraction."""
import re

def repair_numbered_lists(blocks):
    result=[]; pending=[]
    def flush():
        if not pending:return
        text=' '.join(pending)
        matches=list(re.finditer(r'(?:^|\s)(\d+)\.\s+',text))
        if matches:
            start=matches[0].group(1)
            entries=[text[m.end():matches[i+1].start() if i+1<len(matches) else len(text)].strip() for i,m in enumerate(matches)]
            result.append(f'<ol start="{start}">'+''.join('<li>'+entry+'</li>' for entry in entries)+'</ol>')
        else:result.append('<p>'+text+'</p>')
        pending.clear()
    for block in blocks:
        rows=re.findall(r'<tr>(.*?)</tr>',block)
        cells=[re.findall(r'<td>(.*?)</td>',row) for row in rows]
        if cells and all(len(row)==2 and re.fullmatch(r'\d+\.',row[0]) for row in cells):
            pending.extend(' '.join(row) for row in cells)
        elif pending and re.fullmatch(r'<p>.*</p>',block):
            pending.append(block[3:-4])
        else:
            flush();result.append(block)
    flush()
    return result

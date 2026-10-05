"""Convert the supplied A1 book into a versioned, reviewable curriculum manifest."""
import re, json, html, hashlib, argparse, subprocess, tempfile
from PIL import Image
from mock_test import practice_test
from reading_blocks import repair_numbered_lists
from pathlib import Path
from xml.etree import ElementTree as ET
parser=argparse.ArgumentParser()
parser.add_argument('source', nargs='?', default='/home/bonheur/Desktop/Projects/dignity/.material/Deutsch_A1_Kursbuch.pdf')
SRC=Path(parser.parse_args().source).resolve()
repo=Path(__file__).resolve().parents[2]
work=tempfile.TemporaryDirectory(prefix='a1-course-')
XML=Path(work.name)/'book.xml'
subprocess.run(['pdftohtml','-xml','-hidden',str(SRC),str(XML.with_suffix(''))],check=True,stdout=subprocess.DEVNULL)
textfile=Path(work.name)/'book.txt'
subprocess.run(['pdftotext','-layout',str(SRC),str(textfile)],check=True)
TXT=textfile.read_text()
OUT=repo/'backend/prisma/course-import/a1-course.json'
assets=repo/'frontend/public/coursebook/a1';assets.mkdir(parents=True,exist_ok=True)
parts=[('Grundlagen',1,5),('Nomen und Artikel',6,11),('Pronomen',12,14),('Verben',15,23),('Satzbau',24,27),('Präpositionen',28,30),('Adjektive und Adverbien',31,33),('Themenwortschatz',34,43),('Kommunikation',44,47),('Prüfungsvorbereitung',48,50)]
root=ET.parse(XML).getroot(); fonts={f.attrib['id']:f.attrib for f in root.iter('fontspec')}
units=[]; unit=None; rows=[]; source_pages=set(); current_page=0;table_cols=[]

portraits={'Kellner':'🧑‍🍳','Arzt':'👨‍⚕️','Patient':'🧑','Patientin':'👩',
 'Anna':'👩','Thomas':'👨','Verkäufer':'🧑','Verkäuferin':'👩',
 'Gast':'👨','Kunde':'👨','Kundin':'👩','A':'👩','B':'👨',
 'Mitarbeiter':'🧑','Reisender':'👨','Reisende':'👩','Person A':'👩','Person B':'👨'}
def escape(t):return html.escape(t,quote=True)
def flush():
    global rows,table_cols
    if not rows or unit is None:rows=[];return
    table=[]; paragraph=[];last_dialogue_top=None
    def flush_p():
        if paragraph:unit['blocks'].append('<p>'+escape(' '.join(paragraph))+'</p>');paragraph.clear()
    def flush_t():
        if table:
            unit['blocks'].append('<div class="course-table-wrap"><table><tbody>'+''.join('<tr>'+''.join('<td>'+escape(c)+'</td>' for c in row)+'</tr>' for row in table)+'</tbody></table></div>');table.clear()
    for row in rows:
        chunks=[]; end=None; heading=False;starts=[]
        for e in sorted(row,key=lambda e:float(e.attrib['left'])):
            text=''.join(e.itertext());left=float(e.attrib['left']);right=left+float(e.attrib['width'])
            if not text.strip():continue
            if end is not None and left-end>15:chunks.append(text);starts.append(left)
            elif chunks:chunks[-1]+=text
            else:chunks=[text];starts=[left]
            end=right
            if fonts[e.attrib['font']].get('color')=='#8c2f39':heading=True
        chunks=[c.strip() for c in chunks];full=' '.join(chunks)
        if not full:continue
        inset=min(float(e.attrib['left']) for e in row)>=77
        if table_cols and inset and not heading:
            cells=['']*len(table_cols)
            for e in sorted(row,key=lambda e:float(e.attrib['left'])):
                left=float(e.attrib['left'])
                col=max([i for i,x in enumerate(table_cols) if left>=x-7] or [0])
                cells[col]+=''.join(e.itertext())
            chunks=[c.strip() for c in cells]
            full=' '.join(chunks)
            if not chunks[0] and table:
                for i,c in enumerate(chunks):
                    if c:table[-1][i]+=' '+c
                continue
        elif len(chunks)>1 and inset:
            table_cols=starts
        else:table_cols=[]
        if heading:
            last_dialogue_top=None
            flush_p();flush_t();unit['blocks'].append('<h2>'+escape(full)+'</h2>');continue
        if len(chunks)>1:
            flush_p();table.append(chunks);continue
        flush_t()
        m=re.match(r'^([A-Za-zÄÖÜäöüß .-]{1,24}):\s*(.+)',full)
        if m and m.group(1) in ['A','B','Anna','Thomas','Kellner','Gast','Arzt','Patient','Patientin','Verkäufer','Kunde','Kundin','Verkäuferin','Mitarbeiter','Reisender','Reisende','Person A','Person B']:
            flush_p();speaker,text=m.groups();last_dialogue_top=max(float(e.attrib['top']) for e in row);unit['blocks'].append('<div class="course-dialogue"><span class="course-character" aria-hidden="true">'+portraits.get(speaker,'🧑')+'</span><p><strong>'+escape(speaker)+'</strong><br>'+escape(text)+'</p></div>')
        elif re.match(r'^Ü\d+\.\d+',full):
            flush_p();unit['blocks'].append('<p class="course-exercise">'+escape(full)+'</p>')
        elif last_dialogue_top is not None and 0 < min(float(e.attrib['top']) for e in row)-last_dialogue_top < 23 and not full.startswith('('):
            unit['blocks'][-1]=unit['blocks'][-1].replace('</p></div>',' '+escape(full)+'</p></div>')
            last_dialogue_top=max(float(e.attrib['top']) for e in row)
        else:paragraph.append(full);last_dialogue_top=None
    flush_p();flush_t();rows=[]

for page in root.findall('page'):
    current_page=int(page.attrib['number']);line=[];top=None
    for e in sorted(page.findall('text') + page.findall('image'), key=lambda e: (round(float(e.attrib['top'])/3), float(e.attrib['left']))):
        if e.tag=='image':
            if line:rows.append(line);line=[]
            flush();top=None
            if unit:
                image=Image.open(e.attrib['src']).convert('RGB');image.thumbnail((1100,1100))
                name=f"page-{current_page}-{Path(e.attrib['src']).stem.split('_')[-1]}.webp"
                image.save(assets/name,'WEBP',quality=82)
                unit['blocks'].append(f'<figure><img src="/coursebook/a1/{name}" alt="Coursebook illustration for unit {unit["number"]}" width="{image.width}" height="{image.height}" loading="lazy"></figure>')
            continue
        text=''.join(e.itertext()).strip();y=float(e.attrib['top'])
        if y>900 and text.isdigit():continue
        match=re.match(r'^Unit (\d+) — (.+)',text)
        if match:
            if line:rows.append(line);line=[]
            # Exclude the upcoming German unit heading from the previous unit.
            if rows and ''.join(rows[-1][0].itertext()).strip().startswith('Einheit '):rows.pop()
            flush();table_cols=[];n=int(match.group(1));unit={'number':n,'title':match.group(2),'pageStart':current_page,'pages':[],'blocks':[]};units.append(unit);top=None;continue
        if unit is None:continue
        if text.startswith('Einheit ') or re.match(r'^TEIL \d+',text):continue
        if current_page not in unit['pages']:unit['pages'].append(current_page)
        if top is not None and abs(y-top)>3:
            rows.append(line);line=[]
        line.append(e);top=y
    if line:rows.append(line)
    flush()

# Exercises are retained verbatim, joined across PDF line/page boundaries.
clean=re.sub(r'(?m)^\s*\d+\s*$', '',TXT).replace('\f','\n')
starts=list(re.finditer(r'(?m)^Unit (\d+) — (.+)$',clean))
answer_start=clean.index('Lösungen zu ausgewählten Übungen',starts[-1].start())
answers={}
answer_text=clean[answer_start:]
for m in re.finditer(r'(?ms)^Ü(\d+)\.(\d+)\s+(.+?)(?=^Ü\d+\.\d+|^Die A1-Wortliste|\Z)',answer_text):
    if len(m.group(3))<2500:answers[f'{m.group(1)}.{m.group(2)}']=' '.join(m.group(3).split())
for i,u in enumerate(units):
    u['body']='\n'.join(repair_numbered_lists(u.pop('blocks')));u['exercises']=[]
    segment=clean[starts[i].end():starts[i+1].start() if i+1<len(starts) else len(clean)]
    if u['number']!=50:
        for m in re.finditer(r'(?ms)^Ü(\d+)\.(\d+)\s+(.+?)(?=^Ü\d+\.\d+|^Merke!|^Video zum Thema|\Z)',segment):
            prompt=' '.join(m.group(3).split());key=f'{m.group(1)}.{m.group(2)}'
            if prompt and int(m.group(1))==u['number']:u['exercises'].append({'key':key,'prompt':prompt,'modelAnswer':answers.get(key)})
    if u['number']==49:u['exercises']=practice_test(u['body'])
    u['part']=next(i+1 for i,(_,lo,hi) in enumerate(parts) if lo<=u['number']<=hi)
    u['sectionCount']=u['body'].count('<h2>')
assert [u['number'] for u in units]==list(range(1,51)), 'Missing or duplicate units'
manifest={'source':'Deutsch_A1_Kursbuch.pdf','sha256':hashlib.sha256(SRC.read_bytes()).hexdigest(),'pages':215,'parts':[{'number':i+1,'title':t,'from':lo,'to':hi} for i,(t,lo,hi) in enumerate(parts)],'units':units}
OUT.write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({'units':len(units),'sections':sum(u['sectionCount'] for u in units),'exercises':sum(len(u['exercises']) for u in units),'dialogueTurns':sum(u['body'].count('course-dialogue') for u in units),'bytes':OUT.stat().st_size}))

"""Convert the book's Unit 49 worked practice test to inline self-study tasks."""
import re, html

def practice_test(body):
    sections={}
    for chunk in body.split('<h2>')[1:]:
        heading,content=chunk.split('</h2>',1)
        sections[html.unescape(heading)]=' '.join(html.unescape(re.sub('<[^>]+>',' ',content)).split())
    activities=[]
    def add(key,prompt,options=None,answer=None,model=None):
        activities.append({'key':f'49.{key}','prompt':prompt,'modelAnswer':model,
          'options':options,'correctIndex':answer})
    for title in ['HÖREN — Teil 1','HÖREN — Teil 3','LESEN — Teil 2']:
        text=sections[title]
        for match in re.finditer(r'(?:^|\s)(\d+)\.\s*("[A-ZÄÖÜ].+?|Sie\s.+?)(?=\s+\d+\.\s*(?:"[A-ZÄÖÜ]|Sie\s)|$)',text):
            number,prompt=match.groups()
            choices=re.split(r'\s+[abc]\)\s*',prompt)
            if len(choices)>=3:
                options=choices[1:]
                # Source's transcripts/adverts determine the key, not guessed answers.
                correct=0 if number=='18' else 1
                add(number,choices[0],options,correct)
    for title in ['HÖREN — Teil 2','LESEN — Teil 1','LESEN — Teil 3']:
        text=sections[title]
        context=text.split('13.')[0] if title=='LESEN — Teil 1' else ''
        for match in re.finditer(r'(\d+)\.\s*(.+?)\s*(?:→\s*)?(richtig|falsch)(?=\s+\d+\.|$)',text):
            number,prompt,answer=match.groups()
            add(number,(context+' '+prompt.removesuffix('→').strip()).strip(),['richtig','falsch'],0 if answer=='richtig' else 1)
    context=sections['SCHREIBEN — Teil 1'].split('Feld')[0]
    for index,(field,answer) in enumerate([('Familienname','Osman'),('Geburtsdatum','03.08.1988'),('Staatsangehörigkeit','ägyptisch'),('Postleitzahl / Ort','20095 Hamburg'),('Beruf','Koch')]):
        add(f'form-{index+1}',f'{context}\n{field}:',model=answer)
    prompt,model=sections['SCHREIBEN — Teil 2'].split('Modellantwort:',1)
    add('writing',prompt.strip(),model=model.strip())
    add('speaking',sections['SPRECHEN'])
    assert len({a['key'] for a in activities})==30
    assert len(activities)==30, f'Incomplete practice test: {len(activities)}'
    return activities

"""Shared argument statistics and validated opinion coding, independent of hosting."""
import hashlib,json,re
from collections import defaultdict
from datetime import datetime,timezone

JUSTICES={'Roberts','Thomas','Alito','Sotomayor','Kagan','Gorsuch','Kavanaugh','Barrett','Jackson','Breyer','Kennedy','Ginsburg','Scalia','Stevens','Souter','Rehnquist','OConnor'}

def hierarchy(label):
    parts=label.split(' > ')
    return {f'lvl{i}':' > '.join(parts[:i+1]) for i in range(len(parts))}

def argument_stats(recording):
    duration=float(recording['audio']['duration_seconds']);words={};speaking=defaultdict(float);lectern=defaultdict(float);people={}
    if duration<=0:raise ValueError('Invalid argument duration')
    previous=0
    for section in recording['sections']:
        advocate=next((t['speaker'] for t in section['turns'] if t['speaker']['kind']=='advocate'),None)
        if not advocate:raise ValueError('Section lacks advocate')
        role=advocate.get('role','').lower();side=0 if 'petitioner' in role and 'respondent' not in role else 1 if 'respondent' in role and 'petitioner' not in role else 2
        lectern[advocate['name']]+=section['stop']-section['start']
        for turn in section['turns']:
            person=turn['speaker'];start=float(turn['start']);stop=float(turn['stop'])
            if not 0<=start<=stop<=duration or start<previous-0.05:raise ValueError('Invalid turn timing')
            previous=stop
            if person['kind']=='justice':
                name=person.get('last_name') or person['name'].split()[-1]
                words.setdefault(name,[0,0,0])[side]+=sum(len(b['text'].split()) for b in turn['text_blocks'])
            else:
                people[person['name']]=person.get('identifier') or re.sub('[^a-z0-9]+','_',person['name'].lower())
                speaking[person['name']]+=stop-start
    return {'overallLength':duration,'wordsSpoken':words,
        'argumentTime':[[name,identifier,round(speaking[name],3)] for name,identifier in sorted(people.items())],
        'argumentTimeAtLectern':[[name,identifier,round(lectern[name],3)] for name,identifier in sorted(people.items())]}

def apply_alignment(records,entry,recording):
    for key in ('recording_id','term','docket','argument_date'):
        if str(recording[key])!=str(entry[key]):raise ValueError('Recording identity differs')
    key=recording['term']+'/'+recording['docket'];record=records.get(key)
    if record is None:
        record={'objectID':key,'term':recording['term'],'docket_number':recording['docket'],'name':recording['case_name']};records[key]=record
    recordings=record.setdefault('recordings',{})
    stats=argument_stats(recording)
    recordings[recording['recording_id']]={'argument_date':recording['argument_date'],'revision':entry['revision'],'url':entry['url'],'statistics':stats}
    # Aggregate separate hearings once each, preserving distinct recording identities.
    aggregate={'overallLength':0,'wordsSpoken':{},'argumentTime':[],'argumentTimeAtLectern':[]};times={k:defaultdict(float) for k in ['argumentTime','argumentTimeAtLectern']}
    for saved in recordings.values():
        value=saved['statistics'];aggregate['overallLength']+=value['overallLength']
        for justice,counts in value['wordsSpoken'].items():aggregate['wordsSpoken'][justice]=[a+b for a,b in zip(aggregate['wordsSpoken'].get(justice,[0,0,0]),counts)]
        for field in times:
            for name,identifier,seconds in value[field]:times[field][(name,identifier)]+=seconds
    for field in times:aggregate[field]=[[n,i,round(t,3)] for (n,i),t in sorted(times[field].items())]
    record['oralArgumentInfo']=aggregate;record['argument_date']=min(v['argument_date'] for v in recordings.values())
    record.setdefault('provenance',{})['oralArgumentInfo']={'source':'scotus_ctc','recordings':sorted(recordings)}
    advocates=defaultdict(set)
    for section in recording['sections']:
        for turn in section['turns']:
            person=turn['speaker']
            if person['kind']!='advocate':continue
            role=person.get('role','').lower();side='petitioner' if 'petitioner' in role and 'respondent' not in role else 'respondent' if 'respondent' in role and 'petitioner' not in role else 'other';advocates[side].add(person['name'])
    existing=record.setdefault('advocates',{})
    for side,names in advocates.items():existing[side]=sorted(set(existing.get(side,[]))|names)
    return record

def validate_coding(value,issues,provisions):
    # Unknown fields are retained privately; only recognized, supported fields publish.
    for field,catalog in [('issue_code',issues),('legal_provision_code',provisions)]:
        if value.get(field) is not None and value[field] not in catalog:raise ValueError('Unknown '+field)
    decision=value.get('decision')
    if decision is not None:
        for field in ['majorityVoters','minorityVoters','abstainers','majorityJoiners','dissentingWriters']:
            people=decision.get(field,[])
            if len(people)!=len(set(people)) or any(name not in JUSTICES for name in people):raise ValueError('Invalid justice list')
        majority=set(decision.get('majorityVoters',[]));minority=set(decision.get('minorityVoters',[]));absent=set(decision.get('abstainers',[]))
        if majority&minority or (majority|minority)&absent:raise ValueError('Conflicting votes')
        if decision.get('majoritySize')!=len(majority) or decision.get('minoritySize')!=len(minority):raise ValueError('Vote count differs')
        if decision.get('majorityWriter') and decision['majorityWriter'] not in majority:raise ValueError('Writer missing from majority')
        if not majority and not minority:raise ValueError('No supported votes')
        if len(majority|minority|absent) not in (8,9):raise ValueError('Incomplete participation')
        if not set(decision.get('majorityJoiners',[]))<=majority:raise ValueError('Joiner missing from judgment coalition')
    for opinion in value.get('opinion_details',[]):
        if opinion.get('author') is not None and opinion['author'] not in JUSTICES:raise ValueError('Unknown author')
        if not opinion.get('evidence'):raise ValueError('Opinion lacks evidence')
    if (decision or value.get('issue_code') or value.get('legal_provision_code')) and not value.get('evidence'):raise ValueError('Coding lacks evidence')
    return value

def apply_coding(record,value,issues,provisions,source):
    validate_coding(value,issues,provisions)
    provenance=record.setdefault('provenance',{})
    for field,code,catalog in [('issue','issue_code',issues),('legalProvision','legal_provision_code',provisions)]:
        if value.get(code) and not record.get(field):record[field]=hierarchy(catalog[value[code]]);provenance[field]={'source':'codex','source_uri':source,'code':value[code]}
    if value.get('decision'):
        record['decision']=value['decision'];record['decision']['source']='codex';provenance['decision']={'source':'codex','source_uri':source}
    if value.get('opinion_details'):record['opinionDetails']=value['opinion_details']
    if value.get('disposition'):record['caseDisposition']=value['disposition']
    if value.get('lower_court') and not record.get('lowerCourt'):record['lowerCourt']=value['lower_court']
    if value.get('decided_date'):
        record['decided_date']=datetime.fromisoformat(value['decided_date']).date().isoformat()
        if record.get('argument_date'):record['delayDays']=(datetime.fromisoformat(record['decided_date'])-datetime.fromisoformat(record['argument_date'])).days
    # Never infer the original opinion assigner from the published coalition.
    return record

def public_records(records):
    result=[]
    for key,record in sorted(records.items()):
        out={k:v for k,v in record.items() if k not in ('recordings','provenance','opinionDetails','research')}
        out['objectID']=key
        result.append(out)
    return result

def flatten(record):
    out={}
    def visit(value,prefix):
        if isinstance(value,dict):
            for key,item in value.items():visit(item,prefix+key+'.')
        else:out[prefix[:-1]]=value
    visit(record,'');return out

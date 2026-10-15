"""Persistent Court 404 caches; temporary failures must never enter these lists."""
import argparse,json,time
from datetime import datetime
from pathlib import Path

def current_term(now=None):
    now=now or datetime.now()
    return str(now.year-(now.month<10))

def options(description):
    parser=argparse.ArgumentParser(description=description)
    parser.add_argument('--term',action='append',help='Process this term (repeatable); default: all local terms')
    parser.add_argument('--refresh',action='store_true',help='Refresh existing successful downloads')
    parser.add_argument('--refresh-missing',action='store_true',help='Retry historical cached misses too')
    return parser.parse_args()

class NegativeCache:
    def __init__(self,path):
        self.path=Path(path)
        self.entries=set(self.path.read_text().split()) if self.path.exists() else set()
        self.retry_path=self.path.with_suffix('.retry.json')
        self.checked=json.loads(self.retry_path.read_text()) if self.retry_path.exists() else {}
    def skip(self,docket,term,refresh=False):
        if refresh or docket not in self.entries:return False
        return str(term)!=current_term() or time.time()-self.checked.get(docket,0)<86400
    def missing(self,docket):
        self.entries.add(docket);self.checked[docket]=time.time();self.save()
    def found(self,docket):
        if docket in self.entries:
            self.entries.remove(docket);self.checked.pop(docket,None);self.save()
    def save(self):
        self.path.write_text(''.join(value+'\n' for value in sorted(self.entries)))
        self.retry_path.write_text(json.dumps(self.checked,sort_keys=True))

def fetch_document(url):
    import requests
    response=requests.get(url,timeout=30)
    if response.status_code in (404,410):return None
    response.raise_for_status()
    if b'ERROR: File or directory not found' in response.content:return None
    return response.content

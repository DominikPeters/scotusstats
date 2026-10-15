# Purpose: Analyze the XML of a Supreme Court opinion
# obtained from https://www.supremecourt.gov/xmls/archive/
# to get counts of words and footnotes.

import os
import json
import requests
import xml.etree.ElementTree as ET
from pathlib import Path
from court_cache import NegativeCache,fetch_document,options
import time

def get_word_count(document):
    count = 0
    for p_tag in document.findall('.//p[@style]'):
        style_content = p_tag.get('style')
        if any(style in style_content for style in ["Footnote", "CASCT"]):
            # text paragraphs of opinions all have styles containing "Footnote" or "CASCT"
            subtree_text = ''.join(p_tag.itertext())
            count += len(subtree_text.split())
    return count

def get_num_footnotes(document):
    # get <footnotes> tag and count its children
    footnotes = document.find('footnotes')
    if footnotes is None:
        return 0
    return len(footnotes)

def analyze_opinion(term, docket_number, refresh=False):
    filename = f"xml/{term}/{docket_number}.xml"
    if not os.path.exists(filename) or refresh:
        url = f"https://www.supremecourt.gov/xmls/archive/{docket_number}.xml"
        print(f"Downloading {url}")
        content = fetch_document(url)
        time.sleep(1)
        if content is None:
            misses.missing(docket_number)
            return None
        # Validate before caching a response (a login/error page is not an opinion).
        ET.fromstring(content)
        misses.found(docket_number)
        with open(filename, "wb") as file:
            file.write(content)
    else:
        with open(filename, "rb") as file:
            content = file.read()
    tree = ET.fromstring(content)
    root = tree
    record = []
    for idx, document in enumerate(root.findall('document'), 1):
        author = document.get('Chamber')
        if author is None:
            continue
        word_count = get_word_count(document)
        num_footnotes = get_num_footnotes(document)
        disposition = document.get('Disposition')
        record.append({
            "author": author,
            "disposition": disposition,
            "word_count": word_count,
            "num_footnotes": num_footnotes,
        })
    return record

def main():
    global misses
    args=options('Count opinion words and footnotes from Court XML')
    misses=NegativeCache('xml404.list.txt')
    data_folder='../data'
    for term in sorted(os.listdir(data_folder)):
        if len(term)!=4 or not term.isdigit() or not os.path.isdir(f'{data_folder}/{term}') or (args.term and term not in args.term):continue
        os.makedirs(f'xml/{term}',exist_ok=True)
        for case in sorted(os.listdir(f'{data_folder}/{term}')):
            if not case.endswith('.json'):continue
            docket=case[:-5].strip()
            if not os.path.exists(f'xml/{term}/{docket}.xml') and misses.skip(docket,term,args.refresh_missing):continue
            try:opinions=analyze_opinion(term,docket,args.refresh)
            except (requests.RequestException,ET.ParseError) as error:
                print(f'Could not read opinion for {docket}: {error}');continue
            if opinions is None:continue
            path=Path(data_folder)/term/case;record=json.loads(path.read_text());record['opinions']=opinions
            path.write_text(json.dumps(record,indent=2))

if __name__=='__main__':main()

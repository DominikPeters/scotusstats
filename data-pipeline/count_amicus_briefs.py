
import os
import json
import requests
from bs4 import BeautifulSoup
import time
from pathlib import Path
from court_cache import NegativeCache,fetch_document,options

def get_amicus_brief_count_old(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')

    amicus_brief_count = 0
    for proceedings_table in soup.find_all('table'):
        for row in proceedings_table.find_all('tr'):
            cols = row.find_all('td')
            if len(cols) > 1:
                text = cols[1].get_text().strip().replace("  ", " ")
                interest_stoppers = ["United States", "leave", "invited", "Argued", "as amicus curiae", "provides", "shall", "not accepted", "due on", "Court-appointed", "are to be", "proof of service", "Consent to", "Islamic"]
                allowed_starts = ["Brief amicus curiae", "Brief amici curiae", "Supplemental amicus curiae brief", "Supplemental amici curiae brief"]
                if 'filed' in text and any(text.startswith(start) for start in allowed_starts):
                    amicus_brief_count += 1
                elif "amic" in text and all(stopper not in text for stopper in interest_stoppers):
                    print(f"  Warning: {text}")
    print(f"  Found {amicus_brief_count} amicus briefs")
    return amicus_brief_count

def get_amicus_brief_count(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    proceedings_table = soup.find('table', {'id': 'proceedings'})
    if not proceedings_table:
        return 0

    amicus_brief_count = 0
    for row in proceedings_table.find_all('tr'):
        cols = row.find_all('td')
        if len(cols) > 1:
            text = cols[1].get_text().strip().replace("  ", " ")
            interest_stoppers = ["United States", "leave", "invited", "Argued", "as amicus curiae", "provides", "shall", "not accepted", "due on", "Court-appointed", "are to be", "proof of service", "Consent to", "Islamic"]
            allowed_starts = ["Brief amicus curiae", "Brief amici curiae", "Supplemental amicus curiae brief", "Supplemental amici curiae brief"]
            if 'filed' in text and any(text.startswith(start) for start in allowed_starts):
                amicus_brief_count += 1
            elif "amic" in text and all(stopper not in text for stopper in interest_stoppers):
                print(f"  Warning: {text}")
    return amicus_brief_count

def process_docket(term, docket_number, data_folder, refresh=False):
    filename = f"docket/{term}/{docket_number}.html"
    if os.path.exists(filename) and not refresh:
        content = Path(filename).read_bytes()
    else:
        internal = term[2:] + "o" + docket_number.replace("-orig", "") if "-orig" in docket_number else docket_number
        content = fetch_document(f"https://www.supremecourt.gov/docket/docketfiles/html/public/{internal}.html")
        time.sleep(1)
        if content is None:
            content = fetch_document(f"https://www.supremecourt.gov/docketfiles/{docket_number}.htm")
            time.sleep(1)
        if content is None:
            misses.missing(docket_number)
            return None
        Path(filename).write_bytes(content)
        misses.found(docket_number)
    soup = BeautifulSoup(content, 'html.parser')
    return get_amicus_brief_count(content) if soup.find('table',id='proceedings') else get_amicus_brief_count_old(content)


def main():
    global misses
    args=options('Count amicus briefs from cached or official Court dockets')
    misses=NegativeCache('docket404.list.txt')
    data_folder='../data'
    for term in sorted(os.listdir(data_folder)):
        if len(term)!=4 or not term.isdigit() or not os.path.isdir(f'{data_folder}/{term}') or (args.term and term not in args.term):continue
        os.makedirs(f'docket/{term}',exist_ok=True)
        for case in sorted(os.listdir(f'{data_folder}/{term}')):
            if not case.endswith('.json'):continue
            docket=case[:-5].strip()
            if not os.path.exists(f'docket/{term}/{docket}.html') and misses.skip(docket,term,args.refresh_missing):continue
            path=Path(data_folder)/term/case
            try:count=process_docket(term,docket,data_folder,args.refresh)
            except requests.RequestException as error:
                print(f'Temporary docket fetch failure for {docket}: {error}');continue
            if count is None:continue
            record=json.loads(path.read_text());record['num_amicus_briefs']=count
            path.write_text(json.dumps(record,indent=2))

if __name__=='__main__':main()

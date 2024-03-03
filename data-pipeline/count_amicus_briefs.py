
import os
import json
import requests
from bs4 import BeautifulSoup
import time

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

def process_old_docket(term, docket_number, data_folder):
    filename = f"docket/{term}/{docket_number}.html"
    if not os.path.exists(filename):
        url = f"https://www.supremecourt.gov/docketfiles/{docket_number}.htm"
        print(f"  Downloading {url}")
        response = requests.get(url)
        time.sleep(1)
        if response.status_code != 200:
            print(f"    Could not get HTML for {docket_number}")
            return None
        content = response.content
        if b"ERROR: File or directory not found" in content:
            with open("docket404.list.txt", "a") as f404:
                f404.write(f"{docket_number}")
                print(f"    404: {docket_number}")
            return None
        with open(filename, "wb") as file:
            file.write(content)
    else:
        with open(filename, "rb") as file:
            content = file.read()

    num_amicus_briefs = get_amicus_brief_count_old(content)
    return num_amicus_briefs

def process_docket(term, docket_number, data_folder):
    filename = f"docket/{term}/{docket_number}.html"
    if not os.path.exists(filename):
        url = f"https://www.supremecourt.gov/docket/docketfiles/html/public/{docket_number}.html"
        if "-orig" in docket_number:
            internal_docket_number = term[2:] + "o" + docket_number.replace("-orig", "")
            url = f"https://www.supremecourt.gov/docket/docketfiles/html/public/{internal_docket_number}.html"
        print(f"  Downloading {url}")
        response = requests.get(url)
        time.sleep(1)
        if response.status_code != 200:
            return process_old_docket(term, docket_number, data_folder)
        content = response.content
        if b"ERROR: File or directory not found" in content:
            return process_old_docket(term, docket_number, data_folder)
        with open(filename, "wb") as file:
            file.write(content)
    else:
        with open(filename, "rb") as file:
            content = file.read()
        if b"<Body>" in content:
            return get_amicus_brief_count_old(content)

    num_amicus_briefs = get_amicus_brief_count(content)
    return num_amicus_briefs

data_folder = "../data"

with open("docket404.list.txt", "r") as f404:
    dockets404 = set(f404.read().splitlines())

# go through all terms (subfolders of data)
for term in sorted(os.listdir(data_folder)):
    if not len(term) == 4 or term[0] == "." or not os.path.isdir(f"{data_folder}/{term}"):
        continue
    print(f"Processing term {term}")
    os.makedirs(f"docket/{term}", exist_ok=True)
    for case in list(os.listdir(f"{data_folder}/{term}")):
        if case.endswith(".json"):
            docket_number = case.split(".")[0]
            if docket_number in dockets404:
                continue
            with open(f"{data_folder}/{term}/{case}", "r") as f:
                case_data = json.load(f)
            num_amicus_briefs = process_docket(term, docket_number, data_folder)
            if num_amicus_briefs is None:
                print(f"    Could not get HTML for {docket_number}")
                continue
            case_data["num_amicus_briefs"] = num_amicus_briefs
            with open(f"{data_folder}/{term}/{case}", "w") as f:
                json.dump(case_data, f, indent=2)

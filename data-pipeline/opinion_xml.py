# Purpose: Analyze the XML of a Supreme Court opinion
# obtained from https://www.supremecourt.gov/xmls/archive/
# to get counts of words and footnotes.

import os
import json
import requests
import xml.etree.ElementTree as ET
import time
from tqdm import tqdm

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

def analyze_opinion(term, docket_number):
    filename = f"xml/{term}/{docket_number}.xml"
    if not os.path.exists(filename):
        url = f"https://www.supremecourt.gov/xmls/archive/{docket_number}.xml"
        response = requests.get(url)
        time.sleep(1)
        content = response.content
        if response.status_code != 200:
            return None
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

# if __name__ == "__main__":
#     record = analyze_opinion("21-442")
#     for item in record:
#         print(f"Opinion by {item['author']} ({item['disposition']}) has {item['word_count']} words and {item['num_footnotes']} footnotes.")

data_folder = "../data"

# go through all terms (subfolders of data)
for term in sorted(os.listdir(data_folder)):
    if not len(term) == 4 or not os.path.isdir(f"{data_folder}/{term}"):
        continue
    print(f"Processing term {term}")
    os.makedirs(f"xml/{term}", exist_ok=True)
    for case in tqdm(list(os.listdir(f"{data_folder}/{term}"))):
        if case.endswith(".json"):
            # get the docket number
            docket_number = case.split(".")[0]
            with open(f"{data_folder}/{term}/{case}", "r") as f:
                case_data = json.load(f)
            try:
                opinions = analyze_opinion(term, docket_number)
            except ET.ParseError as e:
                print(f"Could not parse XML for {docket_number}")
                continue
            if opinions is None:
                print(f"Could not get XML for {docket_number}")
                continue
            case_data["opinions"] = opinions
            with open(f"{data_folder}/{term}/{case}", "w") as f:
                json.dump(case_data, f, indent=2)
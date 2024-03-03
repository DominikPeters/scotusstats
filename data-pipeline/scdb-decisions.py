import pandas as pd
import json
import os
import sys
import csv
import xml.etree.ElementTree as ET

def get_syllabus(docket_number):
    xml_filename = f"xml/{term}/{docket_number}.xml"
    if not os.path.exists(xml_filename):
        return None
    with open(xml_filename, "rb") as file:
        content = file.read()
    tree = ET.fromstring(content)
    # get the content of the first element <p style="SYLCT-H">
    for p_tag in tree.findall('.//p[@style]'):
        style_content = p_tag.get('style')
        if "SYLCT-H" in style_content:
            return ''.join(p_tag.itertext())

translations = json.load(open("scdb/justice-ids.json"))
translate_scdb_id = {}
translate_scdb_num = {}
for justice_record in translations:
    translate_scdb_id[justice_record["scdb_id"]] = justice_record
    translate_scdb_num[str(justice_record["scdb_number"])] = justice_record
def translate(scdb_id):
    return translate_scdb_id[scdb_id]["last_name"]
def translate_all(scdb_ids):
    return [translate_scdb_id[scdb_id]["last_name"] for scdb_id in scdb_ids]

print("SCDB DECISIONS", flush=True)
print("Reading SCDB file", flush=True)

# Read the CSV file
with open("scdb/SCDB_2023_01_justiceCentered_Citation.csv", encoding='ISO-8859-1') as file:
    reader = csv.DictReader(file)
    rows = list(reader)

print("Done reading SCDB file", flush=True)

# get a list of all files in data subfolders
terms = os.listdir("../data")
data_docket_numbers = set()
for term in terms:
    if not len(term) == 4 or not os.path.isdir(f"../data/{term}"):
        continue
    for case in os.listdir(f"../data/{term}"):
        if case.endswith(".json"):
            # get the docket number
            docket_number = case.split(".")[0]
            data_docket_numbers.add(docket_number)

current_case = None
for row_nr, row in enumerate(rows):
    term = row['term']

    # if term != term_of_interest:
    #     continue
    # if int(term) < 2000:
    #     continue

    row_docket = row['docket']
    if row_docket == current_case:
        continue # not the first row about this case, so already handled in previous iterations

    current_case = row_docket
    docket_number = row_docket
    case_row = row

    if docket_number not in data_docket_numbers:
        continue

    with open(f"../data/{term}/{docket_number}.json", "r") as f:
        data_record = json.load(f)
    
    # print(f"Handling case {current_case} (row {row_nr})")

    # Extract the majority and minority size
    majority_size = case_row['majVotes']
    minority_size = case_row['minVotes']

    # Extract the names of the justices and how they voted
    justices_info = []
    final_row_nr = min(len(rows), row_nr+11)
    for following_row in rows[row_nr:final_row_nr]:
        if following_row['docket'] == current_case:
            if following_row['justiceName']: # and following_row['majority'] and following_row['opinion']:
                justices_info.append({
                    'justiceName': translate(following_row['justiceName']), 
                    'majority': following_row['majority'], 
                    'opinion': following_row['opinion'],
                    'vote': following_row['vote'],
                    'agreement': [
                        translate_scdb_num[following_row[col]]["last_name"] 
                        for col in ['firstAgreement', 'secondAgreement'] 
                        if following_row[col].strip() and following_row[col] != '0'
                    ]})

    # if docket_number == "18-1323":
    #     print(case_row['decisionType'])
    #     print(json.dumps(justices_info, indent=4))

    abstainers = [justice['justiceName'] for justice in justices_info if justice['majority'] == '3' or justice['vote'].strip() == '']

    # Majority opinion writer
    majority_opinion_writer_id = case_row['majOpinWriter']
    if not majority_opinion_writer_id:
        continue

    # Majority justices
    majority_justices = [justice['justiceName'] for justice in justices_info if justice['majority'] == '2']

    # Majority joiners
    majority_joiners = [justice['justiceName'] for justice in justices_info if justice['vote'] in ['1', '3', '5']]

    # Dissenting justices
    dissenting_justices = [justice['justiceName'] for justice in justices_info if justice['majority'] == '1']

    # Dissenting opinion writers
    dissenting_opinion_writers = [justice['justiceName'] for justice in justices_info if justice['majority'] == '1' and justice['opinion'] in ['2', '3']]

    # Majority opinion writer
    majority_opinion_writer = None
    for row in rows:
        if row['justice'] == majority_opinion_writer_id:
            majority_opinion_writer = translate(row['justiceName'])
            break

    collect_all_opinions = False
    if collect_all_opinions:
        # Non-majority opinions
        other_opinions = {}
        for justice in justices_info:
            if justice['justiceName'] == majority_opinion_writer:
                continue
            elif justice['opinion'] == '2':
                # authored an opinion
                opinion = {}
                if justice['vote'] == '2':
                    opinion['type'] = "dissent"
                elif justice['vote'] == '3':
                    opinion['type'] = "concurrence"
                elif justice['vote'] == '4':
                    opinion['type'] = "concurrence in judgment"
                elif justice['vote'] == '7' and justice['majority'] == '1':
                    opinion['type'] = "dissent" # (jurisdictional)
                else:
                    raise Exception(f"Unknown vote type {justice['vote']} for opinion written by {justice['justiceName']} (docket {docket_number})")
                opinion['joiners'] = []
                other_opinions[justice['justiceName']] = opinion
        # collect joiners
        for justice in justices_info:
            for agreement in justice['agreement']:
                if agreement in other_opinions:
                    other_opinions[agreement]['joiners'].append(justice['justiceName'])
                else:
                    print(f"{justice['justiceName']} is registered as agreeing with {agreement}, but {agreement} did not author an opinion (docket {docket_number})")
                    # raise Exception(f"{justice['justiceName']} is registered as agreeing with {agreement}, but {agreement} did not author an opinion (docket {docket_number})")

    # Decision type
    decision_type_code = case_row['decisionType']
    decision_type = f'{majority_size}-{minority_size}'
    if decision_type_code == '7': # or any(justice['vote'] == '5' for justice in justices_info):
            decision_type = "plurality opinion"
    elif decision_type_code == '5':
        decision_type = "equally divided"
    elif decision_type_code == '6':
        decision_type = "per curiam"

    # Reconstruct the decision JSON object
    scdb_decision = {
        'type': decision_type,
        'majoritySize': int(majority_size),
        'minoritySize': int(minority_size),
        'majorityWriter': majority_opinion_writer,
        'majorityJoiners': majority_joiners,
        'dissentingWriters': dissenting_opinion_writers,
        'majorityVoters': majority_justices,
        'minorityVoters': dissenting_justices,
        'abstainers': abstainers,
    }

    data_record['decision'] = scdb_decision
    with open(f"../data/{term}/{docket_number}.json", "w") as f:
        json.dump(data_record, f, indent=2)

    compare_with_oyez = False
    if compare_with_oyez:
        # Load oyez-derived data to compare
        oyez_filename = f"../data/{term}/{docket_number}.json"
        if not os.path.isfile(oyez_filename):
            print(f"    No Oyez data for {docket_number}")
            continue
        with open(oyez_filename, "r") as f:
            case_data = json.load(f)
            oyez_decision = case_data['decision']
        if not oyez_decision:
            print(f"    No Oyez decision for {docket_number}")
            continue

        matches_oyez = True

        for key in scdb_decision:
            if key not in oyez_decision:
                matches_oyez = False

        for key in oyez_decision:
            if key not in scdb_decision:
                matches_oyez = False
            # if doesn't match, and if it's a list then not even the set matches
            elif oyez_decision[key] != scdb_decision[key] and \
                    (not isinstance(oyez_decision[key], list) or set(oyez_decision[key]) != set(scdb_decision[key])):
                matches_oyez = False

        if not matches_oyez:
            pass
            print(f"    Decision for {docket_number} does not match")
            for key in scdb_decision:
                if key not in oyez_decision:
                    print(f"        Key {key} not found in Oyez decision")
            for key in oyez_decision:
                if key not in scdb_decision:
                    print(f"        Key {key} not found in SCDB decision")
                # if doesn't match, and if it's a list then not even the set matches
                elif oyez_decision[key] != scdb_decision[key] and \
                        (not isinstance(oyez_decision[key], list) or set(oyez_decision[key]) != set(scdb_decision[key])):
                    print(f"        Key '{key}' does not match")
                    if isinstance(oyez_decision[key], list):
                        print(f"            Oyez: {sorted(oyez_decision[key])}")
                        print(f"            SCDB: {sorted(scdb_decision[key])}")
                    else:
                        print(f"            Oyez: {oyez_decision[key]}")
                        print(f"            SCDB: {scdb_decision[key]}")
                # else:
                #     print(f"Key {key} matches")
            syllabus = get_syllabus(docket_number)
            if syllabus:
                print(f"        Syllabus: {syllabus}")
        else:
            print(f"    Decision for {docket_number} matches")
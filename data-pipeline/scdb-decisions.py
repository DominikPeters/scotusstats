import pandas as pd
import json

translations = json.load(open("scdb/justice-ids.json"))
translate_scdb_id = {}
for justice_record in translations:
    translate_scdb_id[justice_record["scdb_id"]] = justice_record
def translate(scdb_id):
    return translate_scdb_id[scdb_id]["name"]
def translate_all(scdb_ids):
    return [translate_scdb_id[scdb_id]["name"] for scdb_id in scdb_ids]

import csv

# Read the CSV file
with open("scdb/SCDB_2022_01_justiceCentered_Citation.csv", encoding='ISO-8859-1') as file:
    reader = csv.DictReader(file)
    rows = list(reader)

# Docket number to search for
docket_number = '20-659'
docket_number = '15-1391'
docket_number = '19-1392' # Dobbs
docket_number = '20-843' # Bruen
docket_number = '19-123' # Fulton

# Filter rows based on docket number
matching_rows = [row for row in rows if row['docket'] == docket_number]

# If a matching case is found
if matching_rows:
    case_row = matching_rows[0]  # Assuming only one match is found

    # Extract the majority and minority size
    majority_size = case_row['majVotes']
    minority_size = case_row['minVotes']

    # Extract the names of the justices and how they voted
    justices_info = []
    for row in matching_rows:
        if row['justiceName'] and row['majority'] and row['opinion']:
            justices_info.append({'justiceName': row['justiceName'], 'majority': row['majority'], 'opinion': row['opinion']})

    abstainers = [justice['justiceName'] for justice in justices_info if justice['majority'] == '3']

    # Majority opinion writer
    majority_opinion_writer_id = case_row['majOpinWriter']

    # Majority justices
    majority_justices = [justice['justiceName'] for justice in justices_info if justice['majority'] == '2']

    # Dissenting justices
    dissenting_justices = [justice['justiceName'] for justice in justices_info if justice['majority'] == '1']

    # Dissenting opinion writers
    dissenting_opinion_writers = [justice['justiceName'] for justice in justices_info if justice['majority'] == '1' and justice['opinion'] in ['2', '3']]

    # Majority opinion writer
    majority_opinion_writer = None
    for row in rows:
        if row['justice'] == majority_opinion_writer_id:
            majority_opinion_writer = row['justiceName']
            break

    # Reconstruct the decision JSON object with corrected information
    reconstructed_decision_corrected = {
        'type': f'{majority_size}-{minority_size}',
        'majoritySize': int(majority_size),
        'minoritySize': int(minority_size),
        'majorityWriter': translate(majority_opinion_writer),
        'majorityJoiners': [translate(j) for j in majority_justices if j != majority_opinion_writer],
        'dissentingWriters': translate_all(dissenting_opinion_writers),
        'majorityVoters': translate_all(majority_justices),
        'minorityVoters': translate_all(dissenting_justices),
        'abstainers': translate_all(abstainers),
    }

    print(json.dumps(reconstructed_decision_corrected, indent=4))

else:
    reconstructed_decision = 'Case not found in the database'
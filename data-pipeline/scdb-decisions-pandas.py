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

scdb_df = pd.read_csv("scdb/SCDB_2022_01_justiceCentered_Citation.csv", encoding='ISO-8859-1')

docket_number = '20-659'
docket_number = '15-1391'
docket_number = '19-123' # Fulton

case_df = scdb_df[scdb_df['docket'].str.contains(docket_number, na=False)]

# If the case is found, we will proceed to extract the decision details
if not case_df.empty:
    # Extract the majority and minority size
    majority_size = case_df['majVotes'].iloc[0]
    minority_size = case_df['minVotes'].iloc[0]

    # Extract the names of the justices and how they voted
    justices_info = case_df[['justiceName', 'majority', 'opinion']].dropna()

    abstainers = justices_info[justices_info['majority'] == 3]['justiceName'].tolist()
    
    # Extract the justice who wrote the majority opinion using the 'majOpinWriter' field
    # The 'majOpinWriter' field may not be directly in the case_df, so we check the entire scdb_df
    majority_opinion_writer_id = case_df['majOpinWriter'].iloc[0]

    # Majority justices: those who voted with majority (value 2)
    majority_justices = justices_info[justices_info['majority'] == 2]['justiceName'].tolist()

    # Dissenting justices: those who voted in dissent (value 1)
    dissenting_justices = justices_info[justices_info['majority'] == 1]['justiceName'].tolist()

    # Dissenting opinion writers: dissenting justices who wrote an opinion (value 2 or 3 in 'opinion' field)
    dissenting_opinion_writers = justices_info[(justices_info['majority'] == 1) & 
                                            (justices_info['opinion'].isin([2, 3]))]['justiceName'].tolist()

    # Majority opinion writer: identified using 'majOpinWriter' field
    # Assuming 'majority_opinion_writer_id' is already the correct id of the justice who wrote the majority opinion
    majority_opinion_writer = scdb_df[scdb_df['justice'] == majority_opinion_writer_id]['justiceName'].iloc[0]

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
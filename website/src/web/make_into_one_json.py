import json
from datetime import datetime
import os

# source_jsons folder
folder = os.path.dirname(os.path.abspath(__file__)) + '/source_jsons'

output = []

for filename in sorted(os.listdir(folder)):
    if not filename.endswith('.json') or filename == 'cases.json':
        continue

    # Load the input JSON data
    with open(os.path.join(folder, filename), 'r') as file:
        cases = json.load(file)

    # Filter and transform the data
    filtered_cases = []

    for case in cases:
        timeline = case.get('timeline', [])
        if timeline and isinstance(timeline, list):
            argued_events = [
                event for event in timeline if isinstance(event, dict) and event.get('event') == "Argued"
            ]
            if argued_events:
                argued_date_epoch = argued_events[0].get('dates', [None])[0]
                if argued_date_epoch:  # Ensure a valid date is available
                    argued_date = datetime.utcfromtimestamp(argued_date_epoch).strftime('%Y-%m-%d')
                    description = case.get('description') or ('Question: '+case['question'] if case.get('question') else '')
                    description = description.replace('<p>', '').replace('</p>', '')
                    filtered_cases.append({
                        'id': case['ID'],
                        'href': case['href'].replace('https://api.oyez.org/cases/', ''),
                        'name': case['name'],
                        'docket_number': case['docket_number'],
                        'argued_date': argued_date,
                        'term': case['term'],
                        'description': description.strip()
                    })

    output.extend(filtered_cases)

output.sort(key=lambda x: x['argued_date'], reverse=True)

# Write the output JSON data
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cases.json'), 'w') as file:
    json.dump(output, file, ensure_ascii=False, separators=(',', ':'))
    file.write("\n")
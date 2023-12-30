# Make a single file for algolia upload

import os
import json


data_folder = "../data"

records = []

# go through all terms (subfolders of data)
for term in sorted(os.listdir(data_folder)):
    if not len(term) == 4 or not os.path.isdir(f"{data_folder}/{term}"):
        continue
    for case in os.listdir(f"{data_folder}/{term}"):
        if case.endswith(".json"):
            with open(f"{data_folder}/{term}/{case}", "r") as f:
                case_data = json.load(f)
            records.append(case_data)

with open("all_records.json", "w") as f:
    json.dump(records, f, indent=2)
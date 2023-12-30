import csv
import json
import os
import sys

db_file = "scdb/SCDB_2022_01_caseCentered_Citation.csv"

# load coding data
issues = json.load(open("scdb/issues.json"))
legal_provisions = json.load(open("scdb/legal-provisions.json"))

# read in the SCDB file
with open(db_file, "r", encoding='ISO-8859-1') as f:
    reader = csv.DictReader(f)
    scdb = list(reader)

data_folder = "../data"

# go through all terms (subfolders of data)
for term in sorted(os.listdir(data_folder)):
    print(f"Processing term {term}")
    if not len(term) == 4 or not os.path.isdir(f"{data_folder}/{term}"):
        continue
    for case in os.listdir(f"{data_folder}/{term}"):
        if case.endswith(".json"):
            # get the docket number
            docket_number = case.split(".")[0]
            # find the corresponding case in the SCDB file
            for scdb_case in scdb:
                if scdb_case["docket"] == docket_number and scdb_case["term"] == term:
                    # add the SCDB data to the case
                    with open(f"{data_folder}/{term}/{case}", "r") as f:
                        case_data = json.load(f)

                    if scdb_case["issue"] == "":
                        print(f"Warning: No issue for {docket_number}")
                        scdb_case["issue"] = "130020" # miscellaneous
                    issue = issues[scdb_case["issue"]].split(" > ")
                    issue_levels = {}
                    for level in range(len(issue)):
                        issue_levels[f"lvl{level}"] = " > ".join(issue[:level+1])
                    case_data["issue"] = issue_levels

                    if scdb_case["lawSupp"] == "":
                        print(f"Warning: No legal provision for {docket_number}")
                        scdb_case["lawSupp"] = "900" # no legal provision
                    legal_provision = legal_provisions[scdb_case["lawSupp"]].split(" > ")
                    legal_provision_levels = {}
                    for level in range(len(legal_provision)):
                        legal_provision_levels[f"lvl{level}"] = " > ".join(legal_provision[:level+1])
                    case_data["legalProvision"] = legal_provision_levels

                    if "flags" not in case_data:
                        case_data["flags"] = set()
                    else:
                        case_data["flags"] = set(case_data["flags"])
                    if scdb_case["precedentAlteration"] == "1":
                        case_data["flags"].add("precedent-alteration")
                    if scdb_case["declarationUncon"] == "1":
                        case_data["flags"].add("declaration-unconstitutional")
                    case_data["flags"] = list(case_data["flags"])
                    with open(f"{data_folder}/{term}/{case}", "w") as f:
                        json.dump(case_data, f, indent=2)
                    break
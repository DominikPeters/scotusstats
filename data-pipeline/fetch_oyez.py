"""
Responsible for fetching meta data and oral argument transcripts from oyez.org

Author: Dominik Peters
Date: 2023-10-29
"""

import requests
import json
import os
import sox
from datetime import datetime
import subprocess
import time
import sys

import logging
log = logging.getLogger(__name__)
log.setLevel(logging.INFO)
stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.setLevel(logging.INFO)
log.addHandler(stream_handler)

def current_term():
    now = datetime.now()
    current_year = now.year
    # Check if September 1st of the current year has passed
    if now.month > 9 or (now.month == 9 and now.day > 1):
        return str(current_year)
    else:
        return str(current_year - 1)
    
def get_argued_time(case_metadata):
    # argued date is unix timestamp
    for date in case_metadata["timeline"]:
        if date and date["event"] == "Argued":
            return date["dates"][0] 
    return None

def get_decided_time(case_metadata):
    # decided date is unix timestamp
    for date in case_metadata["timeline"]:
        if date and date["event"] == "Decided":
            return date["dates"][0] 
    return None

def classify_advocates(advocates_info):
    advocates = {adv["advocate"]["name"]: adv for adv in advocates_info}
    advocates_for_petitioner = []
    advocates_for_respondent = []
    advocates_ambiguous = []
    for advocate in advocates.keys():
        description = advocates[advocate]["advocate_description"]
        if "petitioner" in description.lower() \
            and not "respondent" in description.lower():
            advocates_for_petitioner.append(advocate)
        elif "respondent" in description.lower() \
            and not "petitioner" in description.lower():
            advocates_for_respondent.append(advocate)
        else:
            advocates_ambiguous.append(advocate)
    return advocates_for_petitioner, advocates_for_respondent, advocates_ambiguous
    
def mp3_duration(filename):
    return sox.file_info.duration(filename)

def analyze_transcript(case_metadata, oral_argument_transcript):
    # Extract advocate information
    advocates = {adv["advocate"]["name"]: adv for adv in case_metadata["advocates"]}
    
    advocates_for_petitioner, advocates_for_respondent, advocates_ambiguous = classify_advocates(case_metadata["advocates"])

    # Extract list of presiding justices
    # justices = {member["name"] : member for member in case_metadata["heard_by"][0]["members"]}
    justices = [member["name"] for member in case_metadata["heard_by"][0]["members"]]
    justice_last_name = {member["name"] : member["last_name"] for member in case_metadata["heard_by"][0]["members"]}

    words_spoken = {
        justice : {
            "petitioner": 0,
            "respondent": 0,
            "other": 0,
        }
        for justice in justices
    }
    for advocate in advocates.keys():
        words_spoken[advocate] = 0
    number_turns = {
        justice : {
            "petitioner": 0,
            "respondent": 0,
            "other": 0,
        }
        for justice in justices
    }
    argument_time = {
        advocate: 0
        for advocate in advocates.keys()
    }

    # Extract transcript sections
    sections = oral_argument_transcript["transcript"]["sections"]

    overall_length = 0

    for section in sections:
        turns = section["turns"]
        
        # Determine the headline (name of the first advocate speaking)
        section_type = None
        advocate = None
        for turn in turns:
            speaker_name = turn["speaker"]["name"]
            if speaker_name in advocates.keys():
                advocate = speaker_name
                if speaker_name in advocates_for_petitioner:
                    section_type = "petitioner"
                elif speaker_name in advocates_for_respondent:
                    section_type = "respondent"
                else:
                    section_type = "other"
                break
        
        if section_type == None:
            continue

        argument_time[advocate] += int(section["stop"] - section["start"])

        # if section_counter == len(sections) - 1 and speaker_name == chapters[0]["title"]:
        #     headline = headline + " (Rebuttal)"

        # List of justices who took turns
        justice_turns = []
        prev_justice = None
        for i, turn in enumerate(turns):
            overall_length = max(overall_length, turn["stop"])

            current_speaker = turn["speaker"]["name"]

            # count words spoken
            if current_speaker in justices:
                words_spoken[current_speaker][section_type] += sum(
                    len(text_block["text"].split()) for text_block in turn["text_blocks"]
                )
            elif current_speaker in advocates.keys():
                words_spoken[current_speaker] += sum(
                    len(text_block["text"].split()) for text_block in turn["text_blocks"]
                )
            else:
                raise Exception(f"Unknown speaker: {current_speaker}")

            if current_speaker == "John G. Roberts, Jr." and i == 0:
                continue

            text_blocks = turn["text_blocks"]
            if len(text_blocks) == 1:
                if len(text_blocks[0]["text"].split()) <= 8:
                    continue
                if current_speaker == "John G. Roberts, Jr." and len(text_blocks[0]["text"].split()) <= 15 and i == len(turns) - 1:
                    continue

            if i == len(turns) - 1:
                if current_speaker == "John G. Roberts, Jr.":
                    continue
            
            # Check if the current turn is Chief Justice and the next turn is also a justice
            is_moderation = current_speaker == "John G. Roberts, Jr."
            is_moderation = is_moderation and i < len(turns) - 1 and turns[i+1]["speaker"]["name"] in justices
            if is_moderation:
                continue

            # Avoid consecutive repetitions
            if current_speaker in justices and current_speaker != prev_justice:
                number_turns[current_speaker][section_type] += 1
                prev_justice = current_speaker

    # compress
    compressed_words_spoken = {}
    for justice in justices:
        compressed_words_spoken[justice_last_name[justice]] = [words_spoken[justice]["petitioner"], words_spoken[justice]["respondent"], words_spoken[justice]["other"]]
    # note this also throws out advocates; reinstate later if needed
        
    # reformat argument time into a list of 3-tuples (advocate name, oyez identifier, time)
    argument_time = [
        (advocate, advocates[advocate]["advocate"]["identifier"], argument_time[advocate])
        for advocate in advocates.keys()
    ]

    return {
        "overallLength": overall_length,
        "wordsSpoken": compressed_words_spoken,
        # "numberTurns": number_turns,
        "argumentTime": argument_time,
    }

def interpret_decision(case_metadata):
    if len(case_metadata["decisions"]) == 1:
        decision = case_metadata["decisions"][0]
        if decision["decision_type"] == "majority opinion":
            majority_size = decision["majority_vote"]
            minority_size = decision["minority_vote"]

            # find majority opinion writer
            majority_writer = None
            for vote in decision["votes"]:
                if vote["opinion_type"] == "majority" \
                    and vote["joining"] is None:
                    if majority_writer is not None:
                        raise Exception(f"Case {case_metadata['docket_number']} has multiple majority opinion writers")
                    majority_writer = vote["member"]["last_name"]
            if majority_writer is None:
                raise Exception(f"Case {case_metadata['docket_number']} has no majority opinion writer")
            
            # find those who joined the majority opinion
            majority_joiners = [majority_writer]
            for vote in decision["votes"]:
                if vote["vote"] == "majority" \
                    and vote["joining"] is not None \
                    and vote["joining"][0]["last_name"] == majority_writer:
                    majority_joiners.append(vote["member"]["last_name"])

            # find dissenting opinion writers
            dissenting_writers = []
            for vote in decision["votes"]:
                if vote["opinion_type"] == "dissent":
                    dissenting_writers.append(vote["member"]["last_name"])

            # find voters in majority and in minority
            majority_voters = []
            minority_voters = []
            abstainers = []
            for vote in decision["votes"]:
                if vote["vote"] == "majority":
                    majority_voters.append(vote["member"]["last_name"])
                elif vote["vote"] == "minority":
                    minority_voters.append(vote["member"]["last_name"])
                elif vote["vote"] is None or vote["vote"] == "none":
                    abstainers.append(vote["member"]["last_name"])
                else:
                    raise Exception(f"Unknown opinion type: {vote['opinion_type']}.")
                
            return {
                "type": f"{majority_size}-{minority_size}",
                "majoritySize": majority_size,
                "minoritySize": minority_size,
                "majorityWriter": majority_writer,
                "majorityJoiners": majority_joiners,
                "dissentingWriters": dissenting_writers,
                "majorityVoters": majority_voters,
                "minorityVoters": minority_voters,
                "abstainers": abstainers,
            }
        elif decision["decision_type"] == "plurality opinion":
            # example: 19-5410
            # todo
            log.info(f"Case {case_metadata['docket_number']} has plurality opinion, todo")
            return { "type": "plurality opinion" }
        elif decision["decision_type"] == "per curiam":
            # example: 18-1447
            # todo
            log.info(f"Case {case_metadata['docket_number']} has per curiam opinion, todo")
            return { "type": "per curiam" }
        elif decision["decision_type"] == "dismissal - improvidently granted":
            # example: 21-588
            # todo
            log.info(f"Case {case_metadata['docket_number']} was digged: dismissal - improvidently, todo")
            return { "type": "dismissed as improvidently granted" }
        elif decision["decision_type"] == "dismissal - other":
            # example: 18-281
            # todo
            log.info(f"Case {case_metadata['docket_number']} was digged: dismissal - other, todo")
            return { "type": "dismissed" }
        elif decision["decision_type"] == "equally divided":
            # example: 20-807
            # todo
            log.info(f"Case {case_metadata['docket_number']} was equally divided, todo")
            return { "type": "equally divided" }
        else:
            raise Exception(f"Unknown decision type: {decision['decision_type']} in case {case_metadata['docket_number']}")
    else:
        # example https://www.oyez.org/cases/2020/19-422
        log.warning(f"Case {case_metadata['docket_number']} has multiple decisions: {', '.join([decision['decision_type'] for decision in case_metadata['decisions'] if decision and 'decision_type' in decision])}")
        return None


def handle_case(case_url, term, docket_number, redownload=False):
    """Fetches info from oyez."""

    # Load the case metadata
    case_number = case_url.split("/")[-1]
    log.info(f"Handling case {case_number}")

    case_json_filename = f"oyez/{term}/{docket_number}.json"
    if os.path.exists(case_json_filename) and not redownload:
        case_metadata = json.load(open(case_json_filename, "r"))
    else:
        case_metadata = requests.get(case_url).json()
        time.sleep(1)
        with open(case_json_filename, "w") as f:
            json.dump(case_metadata, f, indent=2)

    if get_argued_time(case_metadata) is None:
        log.info(f"Case {case_number} has no argued date, skipping")
        return
    if case_metadata["advocates"] is None:
        log.info(f"Case {case_number} has no advocates, skipping")
        return

    record = {
        "objectID": f"{term}/{docket_number}", # for Algolia
        "docket_number": case_metadata["docket_number"],
        "name": case_metadata["name"],
        "term": case_metadata["term"],
    }

    # classify advocates
    advocates_for_petitioner, advocates_for_respondent, advocates_ambiguous = classify_advocates(case_metadata["advocates"])
    record["advocates"] = {
        "petitioner": advocates_for_petitioner,
        "respondent": advocates_for_respondent,
        "other": advocates_ambiguous,
    }

    # lower court or original jurisdiction
    if case_metadata["lower_court"] is None and \
        (("manner_of_jurisdiction" in case_metadata and case_metadata["manner_of_jurisdiction"] == "Original jurisdiction") \
        or ("-orig" in case_metadata["docket_number"])):
        record["lowerCourt"] = "Original jurisdiction"
    elif "lower_court" in case_metadata:
        record["lowerCourt"] = case_metadata["lower_court"]["name"].replace("United States Court of Appeals for the ", "")
    else:
        raise Exception(f"Case {case_metadata['docket_number']} has no lower court nor original jurisdiction")

    if "decisions" in case_metadata and case_metadata["decisions"]:
        record["decision"] = interpret_decision(case_metadata)
    else:
        log.info(f"Case {case_number} has no decisions")
        # return

    # Load the oral argument transcript
    transcript_json_filename = f"oyez/{case_metadata['term']}/{case_number}_transcript.json"
    oral_argument_transcript, oral_argument_info = None, None
    if os.path.exists(transcript_json_filename):
        oral_argument_transcript = json.load(open(transcript_json_filename, "r"))
    else:
        log.info(f"Loading oral argument transcript for case {case_number}")
        for oral_argument_record in case_metadata["oral_argument_audio"]:
            oral_argument_url = oral_argument_record["href"]
            oral_argument_transcript = requests.get(oral_argument_url).json()
            time.sleep(1)
            if oral_argument_transcript["media_file"][0] and oral_argument_transcript["transcript"]:
                with open(transcript_json_filename, "w") as f:
                    json.dump(oral_argument_transcript, f, indent=2)
                break
    if oral_argument_transcript and oral_argument_transcript["transcript"]:
        oral_argument_info = analyze_transcript(case_metadata, oral_argument_transcript)
        record["oralArgumentInfo"] = oral_argument_info

    # days between oral argument and decision
    argued_time = get_argued_time(case_metadata)
    decided_time = get_decided_time(case_metadata)
    if argued_time and decided_time:
        delay_days = (decided_time - argued_time) / 86400
        record["delayDays"] = int(delay_days)

    # Save the record
    json_filename = f"../data/{case_metadata['term']}/{case_metadata['docket_number']}.json"
    json.dump(record, open(json_filename, "w"), indent=2)
    # existing_record = {}
    # if os.path.exists(json_filename):
    #     existing_record = json.load(open(json_filename, "r"))
    # existing_record.update(record)
    # json.dump(existing_record, open(json_filename, "w"), indent=2)

def get_term_from_oyez(term):
    os.makedirs(f"oyez/{term}", exist_ok=True)
    os.makedirs(f"../data/{term}", exist_ok=True)

    oyez_case_list_url = f"https://api.oyez.org/cases?filter=term:{term}&labels=true&page=0&per_page=1000"
    oyez_case_list = requests.get(oyez_case_list_url).json()
    time.sleep(0.2)

    for case in oyez_case_list:
        case_url = case["href"]
        docket_number = case["docket_number"]
        handle_case(case_url, term, docket_number)

def get_from_oyez():
    term = current_term()
    get_term_from_oyez(term)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        term = sys.argv[1]
        get_term_from_oyez(term)
    else:
        for term in range(2014, 2023):
            get_term_from_oyez(str(term))
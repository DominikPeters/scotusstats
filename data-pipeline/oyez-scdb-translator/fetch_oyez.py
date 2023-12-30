import requests
import os
import time

def get_argued_time(case_metadata):
    for date in case_metadata["timeline"]:
        if date and date["event"] == "Argued":
            return date["dates"][0]
    return None

def download_case_json(case_url, term, case_id):
    response = requests.get(case_url)
    if response.status_code == 200:
        file_path = f"oyez_json/{term}_{case_id}.json"
        with open(file_path, 'w') as file:
            file.write(response.text)
        print(f"Downloaded JSON for case ID {case_id} of term {term}")
        time.sleep(0.5)

def main():
    os.makedirs("oyez_json", exist_ok=True)
    
    for term in range(1958, 1990):
        oyez_case_list_url = f"https://api.oyez.org/cases?filter=term:{term}&labels=true&page=0&per_page=1000"
        oyez_case_list = requests.get(oyez_case_list_url).json()

        for case in oyez_case_list:
            argued_time = get_argued_time(case)
            if argued_time:
                case_id = case['ID']
                case_href = case["href"]
                download_case_json(case_href, term, case_id)
                break  # Stop after finding the first argued case for the term

if __name__ == "__main__":
    main()

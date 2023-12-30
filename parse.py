from bs4 import BeautifulSoup

# Read and parse the HTML content
with open("legal-provisions.html", "r") as file:
    soup = BeautifulSoup(file, "html.parser")

# Extract the issue categories and their corresponding sub-issues
issues_dict = {}
current_issue = None

for tr in soup.find_all("tr"):
    # Check if the row is an issue category
    issue_category = tr.find("div", class_="rowHeader")
    if issue_category:
        current_issue = issue_category.get_text(strip=True)
        continue

    # If the row is a sub-issue, associate it with the current issue category
    if current_issue:
        sub_issues = tr.find_all("label", class_="justifyCheckboxRadio")
        for sub_issue in sub_issues:
            # Extract the value associated with the sub-issue
            checkbox = sub_issue.find_previous_sibling("input", type="checkbox")
            if checkbox:
                issues_dict[checkbox["value"]] = f"{current_issue} > {sub_issue.get_text(strip=True)}"

import json

# Save the extracted data to a JSON file
json_path = "legal-provisions.json"
with open(json_path, "w") as json_file:
    json.dump(issues_dict, json_file, indent=4)

export function sum(array) {
    return array.reduce((a, b) => a + b, 0);
}

function unflattenHit(hit) {
    // replace keys like "decision.majorityVoters" with nested objects
    let newHit = {};
    for (const [key, value] of Object.entries(hit)) {
        let keys = key.replace(", Jr.", "").replace(", Sr.", "").replace(". ", " ").split(".");
        let current = newHit;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }
    return newHit;
}

export function unflattenHits(hits) {
    return hits.map(unflattenHit);
}

export function justiceName(longName) {
    // delete ", Jr." and ", Sr." from names, then split on spaces and return last name
    return longName.replace(/, (Jr\.|Sr\.)/, '').split(' ').pop();
}

export function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
        func.apply(this, args);
        }, timeout);
    };
}

function shortenPartyName(party, maxLength) {
    if (party === "Securities and Exchange Commission") return "SEC";
    if (party === "United States") return "US";
    if (party === "United States of America") return "US";
    if (party === "Federal Trade Commission") return "FTC";
    if (party === "Federal Communications Commission") return "FCC";
    if (party === "National Labor Relations Board") return "NLRB";
    if (party === "Federal Bureau of Investigation") return "FBI";
    if (party === "Environmental Protection Agency") return "EPA";
    var shortened = party
        .replace("LLC", "")
        .replace("Inc.", "")
        .replace("Inc", "")
        .replace("Corp.", "")
        .replace("L.P.", "")
        .replace("L.L.C.", "")
        .replace("United States", "US");
    // remove end comma
    if (shortened.endsWith(",")) shortened = shortened.slice(0, -1);
    // truncate
    if (shortened.length > maxLength) shortened = shortened.slice(0, maxLength - 3) + "...";
    return shortened;
}

export function shortenCasename(casename, maxLength=60) {
    return casename.split(' v. ').map(party => shortenPartyName(party, maxLength)).join(' v. ');
}
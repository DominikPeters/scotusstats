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
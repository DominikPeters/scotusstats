// script that makes a string describing the current filters, to add to the chart subtitles
// for example [among cases] which were decided by plurality opinion, which had the majority opinion written by Justice Thomas, ...

import { justiceName } from "../utils.js";

function nameJustice(justice) {
    if (justice === "John G. Roberts, Jr.") return "Chief Justice Roberts";
    return "Justice " + justiceName(justice);
}

function getChosenRefinements(attribute) {
    const filter = search.renderState.scotusstats.currentRefinements.items;
    const chosenRefinements = filter.find(item => item.attribute === attribute);
    if (!chosenRefinements) return [];
    return chosenRefinements.refinements.map(item => item.value);
}

function makeOrString(terms) {
    if (terms.length === 0) return "";
    if (terms.length === 1) return terms[0];
    if (terms.length === 2) return terms.join(" or ");
    const lastTerm = terms.pop();
    return `${terms.join(", ")}, or ${lastTerm}`;
}

function makeAndString(terms) {
    if (terms.length === 0) return "";
    if (terms.length === 1) return terms[0];
    if (terms.length === 2) return terms.join(" and ");
    const lastTerm = terms.pop();
    return `${terms.join(", ")}, and ${lastTerm}`;
}

function makeWrapperString(terms) {
    if (terms.length === 0) return "";
    if (terms.length === 1) return ", " + terms[0];
    if (terms.length === 2) return ", " + terms.join(", and ");
    const lastTerm = terms.pop();
    const joined = terms.join("; ");
    return "; " + `${joined}; and ${lastTerm}`;
}

export function getWhichCaveatString() {
    let stringParts = [];
    // decision type
    let decisionTypes = getChosenRefinements("decision.type");
    if (decisionTypes.length > 0) {
        // replace "plurality opinion" with "by a plurality opinion"
        decisionTypes = decisionTypes.map(type => type.replace("plurality opinion", "by a plurality opinion"));
        const digged = decisionTypes.includes("dismissed as improvidently granted")
        if (digged) {
            // move "dismissed as improvidently granted" to the end
            decisionTypes = decisionTypes.filter(type => type !== "dismissed as improvidently granted");
            decisionTypes.push("dismissed as improvidently granted");
        }
        if (decisionTypes.length === 1 && digged) {
            stringParts.push("which were dismissed as improvidently granted");
        } else {
            stringParts.push("which were decided " + makeOrString(decisionTypes));
        }
    }

    // flags
    let flags = getChosenRefinements("flags");
    let flagPart;
    if (flags.length > 0) {
        if (flags.includes("declaration-unconstitutional")) {
            flagPart = "which contained a declaration of unconstitutionality";
            if (flags.includes("precedent-alteration")) {
                flagPart += " and altered precedent";
            }
        } else if (flags.includes("precedent-alteration")) {
            flagPart = "which altered precedent";
        }
        stringParts.push(flagPart);
    }

    // lower court
    let lowerCourts = getChosenRefinements("lowerCourt");
    if (lowerCourts.length > 0) {
        stringParts.push("which came from the " + makeOrString(lowerCourts));
    }

    // issue
    let issues = getChosenRefinements("issue.lvl0");
    if (issues.length > 0) {
        // get second level of issue if present, otherwise use first level
        let issue = issues[0].split(" > ")[1] || issues[0].split(" > ")[0];
        issue = issue.replace("First Amendment", "the First Amendment");
        stringParts.push("which concerned " + issue);
    }

    // todo: rank by seniority

    // decision.majorityWriter
    let majorityWriters = getChosenRefinements("decision.majorityWriter");
    if (majorityWriters.length > 0) {
        stringParts.push("which had the majority opinion written by " + makeOrString(majorityWriters.map(nameJustice)));
    }

    // decision.majorityVoters
    let majorityVoters = getChosenRefinements("decision.majorityVoters");
    if (majorityVoters.length > 0) {
        stringParts.push("in which " + makeAndString(majorityVoters.map(nameJustice)) + " voted in the majority");
    }

    if (stringParts.length === 0) return "";
    if (stringParts.length === 1) return " and " + stringParts[0];
    return makeWrapperString(stringParts);
}

export function getAmongCaveatString() {
    let caveat = getWhichCaveatString();
    if (caveat.startsWith(" and ")) {
        caveat = caveat.replace(" and", "");
    } else if (caveat.startsWith(", ")) {
        caveat = caveat.replace(", ", " ");
    } else if (caveat.startsWith("; ")) {
        caveat = caveat.replace("; ", " ");
    }
    if (caveat === "") return "";
    return " among cases" + caveat;
}

export function getCaveatString() {
    return getAmongCaveatString().replace(" among cases", "");
}
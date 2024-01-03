import { j1PyramidChart } from "../j1PyramidChart.js";
import { justiceName } from "../../utils.js";
import { getEmbedLink, getTermInfo } from "../chartFooter.js";
import { getWhichCaveatString } from "../caveatGenerator.js";

// case_dispositions = {
//     "1": "stay, petition, or motion granted",
//     "2": "affirmed (includes modified)",
//     "3": "reversed",
//     "4": "reversed and remanded",
//     "5": "vacated and remanded",
//     "6": "affirmed and reversed (or vacated) in part",
//     "7": "affirmed and reversed (or vacated) in part and remanded",
//     "8": "vacated",
//     "9": "petition denied or appeal dismissed",
//     "10": "certification to or from a lower court",
//     "11": "no disposition",
// }

export default function lowerCourtPyramidChart(element, hits) {
    let wins = {};
    let losses = {};
    for (const hit of hits) {
        if (!hit.lowerCourt || !hit.caseDisposition) continue;
        let lowerCourt = hit.lowerCourt;
        let caseDisposition = hit.caseDisposition;
        if (!wins[lowerCourt]) {
            wins[lowerCourt] = 0;
            losses[lowerCourt] = 0;
        }
        if (caseDisposition === "affirmed (includes modified)" 
            || caseDisposition === "affirmed and reversed (or vacated) in part"
            || caseDisposition === "affirmed and reversed (or vacated) in part and remanded") {
            wins[lowerCourt]++;
        } else if (caseDisposition === "reversed"
            || caseDisposition === "reversed and remanded"
            || caseDisposition === "vacated and remanded"
            || caseDisposition === "vacated") {
            losses[lowerCourt]++;
        }
    }

    // delete lower courts with <= 1 wins + losses
    for (const [lowerCourt, numWins] of Object.entries(wins)) {
        if (numWins + losses[lowerCourt] <= 1) {
            delete wins[lowerCourt];
            delete losses[lowerCourt];
        }
    }

    let subtitle = `Number of reversal and affirm decisions. Only showing lower courts with at least two decided cases${getWhichCaveatString()}.`;

    j1PyramidChart(
        element,
        {
            leftData: losses,
            rightData: wins,
            title: "Lower Court Scorecard",
            subtitle: subtitle,
        }
    );

    const footer = element.querySelector('.j1-chart-footer');

    footer.appendChild(getTermInfo());

    const embedLink = getEmbedLink(element, 'frequencyInMajority');
    footer.appendChild(embedLink);
}
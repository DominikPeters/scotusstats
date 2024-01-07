import { j1PyramidChart } from "../j1PyramidChart.js";
import { justiceName } from "../../utils.js";
import { getEmbedLink, getTermInfo } from "../chartFooter.js";
import { getWhichCaveatString, getAmongCaveatString } from "../caveatGenerator.js";

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

const winDispositions = [
    "affirmed (includes modified)",
    "affirmed and reversed (or vacated) in part",
    "affirmed and reversed (or vacated) in part and remanded",
];
const lossDispositions = [
    "reversed",
    "reversed and remanded",
    "vacated and remanded",
    "vacated",
];

export default function lowerCourtPyramidChart(element, hits) {
    let wins = {};
    let losses = {};
    let dispositionCounts = {};
    for (const hit of hits) {
        if (!hit.lowerCourt || !hit.caseDisposition) continue;
        let lowerCourt = hit.lowerCourt;
        let caseDisposition = hit.caseDisposition;
        if (!wins[lowerCourt]) {
            wins[lowerCourt] = 0;
            losses[lowerCourt] = 0;
            dispositionCounts[lowerCourt] = {};
        }
        if (winDispositions.includes(caseDisposition)) {
            wins[lowerCourt]++;
        }
        if (lossDispositions.includes(caseDisposition)) {
            losses[lowerCourt]++;
        }
        if (!dispositionCounts[lowerCourt][caseDisposition]) {
            dispositionCounts[lowerCourt][caseDisposition] = 0;
        }
        dispositionCounts[lowerCourt][caseDisposition]++;
    }
    
    let winsTooltips = {};
    let lossesTooltips = {};
    for (const lowerCourt of Object.keys(dispositionCounts)) {
        winsTooltips[lowerCourt] = "";
        lossesTooltips[lowerCourt] = "";
        for (const [disposition, count] of Object.entries(dispositionCounts[lowerCourt])) {
            if (winDispositions.includes(disposition)) {
                winsTooltips[lowerCourt] += `${disposition}: ${count}<br>`;
            } else if (lossDispositions.includes(disposition)) {
                lossesTooltips[lowerCourt] += `${disposition}: ${count}<br>`;
            }
        }
        winsTooltips[lowerCourt] = winsTooltips[lowerCourt].replace(" (includes modified)", "");
        winsTooltips[lowerCourt] = winsTooltips[lowerCourt].replace(" (or vacated)", "");
    }

    // delete lower courts with 0 wins + losses
    for (const [lowerCourt, numWins] of Object.entries(wins)) {
        if (numWins + losses[lowerCourt] == 0) {
            delete wins[lowerCourt];
            delete losses[lowerCourt];
        }
    }

    let subtitle;
    if (Object.keys(wins).length > 6) {
        // delete lower courts with <= 1 wins + losses
        for (const [lowerCourt, numWins] of Object.entries(wins)) {
            if (numWins + losses[lowerCourt] <= 1) {
                delete wins[lowerCourt];
                delete losses[lowerCourt];
            }
        }
        subtitle = `Number of reversal and affirm decisions. Only showing lower courts with at least two decided cases${getWhichCaveatString()}.`;
    } else {
        subtitle = `Number of reversal and affirm decisions${getAmongCaveatString()}.`;
    }


    j1PyramidChart(
        element,
        {
            leftData: losses,
            rightData: wins,
            leftTooltips: lossesTooltips,
            rightTooltips: winsTooltips,
            title: "Lower Court Scorecard",
            subtitle: subtitle,
        }
    );

    const footer = element.querySelector('.j1-chart-footer');

    footer.appendChild(getTermInfo());

    const embedLink = getEmbedLink(element, 'frequencyInMajority');
    footer.appendChild(embedLink);
}
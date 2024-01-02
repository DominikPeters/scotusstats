import { j1Chart } from "../j1Chart.js";
import { justiceName } from "../../utils.js";
import { getWhichCaveatString } from "../caveatGenerator.js";
import { getEmbedLink, getTermInfo } from "../chartFooter.js";

export default function agreementTriplesChart(element, hits) {
    let justices = {};
    for (const hit of hits) {
        if (!hit.decision || !hit.decision.majorityVoters || !hit.decision.minorityVoters) continue;
        let majorityVoters = hit.decision.majorityVoters;
        let minorityVoters = hit.decision.minorityVoters;
        for (const justice of majorityVoters) {
            justices[justice] = true;
        }
        for (const justice of minorityVoters) {
            justices[justice] = true;
        }
    }

    justices = Object.keys(justices).sort(); // todo: sort by seniority
    let justiceTriples = {};
    for (let i = 0; i < justices.length; i++) {
        for (let j = i + 1; j < justices.length; j++) {
            for (let k = j + 1; k < justices.length; k++) {
                justiceTriples[`${justices[i]}-${justices[j]}-${justices[k]}`] = [justices[i], justices[j], justices[k]];
            }
        }
    }

    if (justices.length === 0) return;

    let numAgreements = {};
    let numCases = {};
    for (const hit of hits) {
        if (!hit.decision || !hit.decision.majorityVoters || !hit.decision.minorityVoters) continue;
        let majorityVoters = hit.decision.majorityVoters;
        let minorityVoters = hit.decision.minorityVoters;
        let allVoters = [...majorityVoters, ...minorityVoters].sort();
        
        for (let i = 0; i < allVoters.length; i++) {
            for (let j = i + 1; j < allVoters.length; j++) {
                for (let k = j + 1; k < allVoters.length; k++) {
                    let triple = `${allVoters[i]}-${allVoters[j]}-${allVoters[k]}`;
                    if (!numAgreements[triple]) {
                        numAgreements[triple] = 0;
                        numCases[triple] = 0;
                    }
                    numCases[triple]++;
                    if (majorityVoters.includes(allVoters[i]) && majorityVoters.includes(allVoters[j]) && majorityVoters.includes(allVoters[k])) {
                        numAgreements[triple]++;
                    } else if (minorityVoters.includes(allVoters[i]) && minorityVoters.includes(allVoters[j]) && minorityVoters.includes(allVoters[k])) {
                        numAgreements[triple]++;
                    }
                }
            }
        }
    }

    // top 5 triples
    let topTriples = Object.entries(numAgreements).sort((a, b) => b[1] - a[1]).slice(0, 5);
    let topTriplesData = {};
    for (const triple of topTriples) {
        const split = triple[0].split('-');
        const justice1 = justiceName(split[0]);
        const justice2 = justiceName(split[1]);
        const justice3 = justiceName(split[2]);
        const description = `<span class="j1-justice-triple">
            <img src="/img/justices/${justice1}.png" alt="${justice1}" class="j1-circle-image" />
            <img src="/img/justices/${justice2}.png" alt="${justice2}" class="j1-circle-image" />
            <img src="/img/justices/${justice3}.png" alt="${justice3}" class="j1-circle-image" /> 
            <span class="j1-group-members-text">${justice1} & ${justice2} & ${justice3}</span>
        </span>`;
        topTriplesData[description] = (triple[1] / numCases[triple[0]] * 100).toFixed(1);
    }

    j1Chart(
        element,
        {
            data: topTriplesData,
            title: "Which triples of justices agree most frequently?",
            subtitle: `Fraction of cases in which 3 justices voted together, among cases in which all participated${getWhichCaveatString()}. (The "3-3-3" court?)`,
            dataSuffix: '%',
            maxDataValue: 100,
            showImage: false
        }
    );

    const footer = element.querySelector('.j1-chart-footer');

    footer.appendChild(getTermInfo());

    const embedLink = getEmbedLink('frequencyInMajority');
    footer.appendChild(embedLink);
}
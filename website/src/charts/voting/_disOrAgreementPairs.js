import { j1Chart } from "../j1Chart.js";
import { justiceName } from "../../utils.js";
import { getWhichCaveatString } from "../caveatGenerator.js";
import { getEmbedLink, getTermInfo } from "../chartFooter.js";

export default function disOrAgreementPairsChart(agree) {
    return function(element, hits) {
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
        let justicePairs = {};
        for (let i = 0; i < justices.length; i++) {
            for (let j = i + 1; j < justices.length; j++) {
                justicePairs[`${justices[i]}-${justices[j]}`] = [justices[i], justices[j]];
            }
        }

        if (justices.length === 0) return;

        let numAgreements = {};
        let numCases = {};
        let disagreementCases = {};
        for (const hit of hits) {
            if (!hit.decision || !hit.decision.majorityVoters || !hit.decision.minorityVoters) continue;
            let majorityVoters = hit.decision.majorityVoters.sort();
            let minorityVoters = hit.decision.minorityVoters.sort();
            let allVoters = [...majorityVoters, ...minorityVoters].sort();
            
            for (let i = 0; i < allVoters.length; i++) {
                for (let j = i + 1; j < allVoters.length; j++) {
                    let pair = `${allVoters[i]}-${allVoters[j]}`;
                    if (!numAgreements[pair]) {
                        numAgreements[pair] = 0;
                        numCases[pair] = 0;
                        disagreementCases[pair] = [];
                    }
                    numCases[pair]++;
                    if (majorityVoters.includes(allVoters[i]) && majorityVoters.includes(allVoters[j])) {
                        numAgreements[pair]++;
                    } else if (minorityVoters.includes(allVoters[i]) && minorityVoters.includes(allVoters[j])) {
                        numAgreements[pair]++;
                    } else {
                        disagreementCases[pair].push(hit.name);
                    }
                }
            }
        }

        const tooltips = {};

        // top pairs
        let topPairs;
        if (agree) {
            topPairs = Object.entries(numAgreements).sort((a, b) => b[1] - a[1]).slice(0, 7);
        } else {
            topPairs = Object.entries(numAgreements).sort((a, b) => a[1] - b[1]).slice(0, 5);
        }
        let topPairData = {};
        for (const pair of topPairs) {
            const justice1 = justiceName(pair[0].split('-')[0]);
            const justice2 = justiceName(pair[0].split('-')[1]);    
            const description = `<span class="j1-justice-pair">
                <img src="/img/justices/${justice1}.png" alt="${justice1}" class="j1-circle-image" />
                <img src="/img/justices/${justice2}.png" alt="${justice2}" class="j1-circle-image" />
                <span class="j1-group-members-text">${justice1} & ${justice2}</span>
            </span>`;
            topPairData[description] = pair[1] / numCases[pair[0]] * 100;
            tooltips[description] = `Agreement: ${pair[1]} of ${numCases[pair[0]]} cases`;
            if (pair[1] / numCases[pair[0]] * 100 < 100) {
                tooltips[description] += `<br>
                Cases with disagreement: <br>&bullet; ${disagreementCases[pair[0]].join('<br>&bullet; ')}`;
            }
        }

        j1Chart(
            element,
            {
                data: topPairData,
                tooltips: agree ? tooltips : {},
                title: agree ? "Which pairs of justices agree most frequently?" : "Which pairs of justices agree least frequently?",
                subtitle: `Fraction of cases in which the two justices voted together, among cases in which both participated${getWhichCaveatString()}.`,
                dataSuffix: '%',
                chartColor: agree ? '#4CAF50' : '#ab2d24',
                maxDataValue: 100,
                showImage: false
            }
        );

        const footer = element.querySelector('.j1-chart-footer');

        footer.appendChild(getTermInfo());

        const embedLink = getEmbedLink(element, agree ? 'agreementPairs' : 'disagreementPairs');
        footer.appendChild(embedLink);
    };
}
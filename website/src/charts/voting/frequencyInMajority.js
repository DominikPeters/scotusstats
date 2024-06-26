import { j1Chart } from "../j1Chart.js";
import { justiceName } from "../../utils.js";
import { getEmbedLink, getTermInfo } from "../chartFooter.js";
import { getWhichCaveatString } from "../caveatGenerator.js";

export default function frequencyInMajorityChart(element, hits) {
    let voterData = {};
    let numInMajority = {};
    let numParticipated = {};
    let casesNotInMajority = {};
    for (const hit of hits.sort((a, b) => a["num_amicus_briefs"] - b["num_amicus_briefs"])) {
        if (!hit.decision || !hit.decision.majorityVoters || !hit.decision.minorityVoters) continue;
        let majorityVoters = hit.decision.majorityVoters;
        let minorityVoters = hit.decision.minorityVoters;
        for (const justice of majorityVoters) {
            if (!numInMajority[justice]) {
                numInMajority[justice] = 0;
                numParticipated[justice] = 0;
                casesNotInMajority[justice] = [];
            }
            numInMajority[justice]++;
            numParticipated[justice]++;
        }
        for (const justice of minorityVoters) {
            if (!numInMajority[justice]) {
                numInMajority[justice] = 0;
                numParticipated[justice] = 0;
                casesNotInMajority[justice] = [];
            }
            numParticipated[justice]++;
            casesNotInMajority[justice].push(hit.name);
        }
    }

    const tooltips = {};

    for (const [justice, num] of Object.entries(numInMajority)) {
        voterData[justiceName(justice)] = (num / numParticipated[justice] * 100).toFixed(2);
        tooltips[justiceName(justice)] = `In majority in ${num} of ${numParticipated[justice]} cases
        <br>
        Cases not in majority: 
        <br>&bullet; 
        ${casesNotInMajority[justice].join('<br>&bullet; ')}`;
    }

    let subtitle = `Fraction of cases in which the justice voted with the majority, 
    among cases in which the justice participated${getWhichCaveatString()}.`;

    j1Chart(
        element,
        {
            data: voterData,
            tooltips: tooltips,
            title: "How often is each justice in the majority?",
            subtitle: subtitle,
            dataFormatter: (value) => value.toFixed(1),
            dataSuffix: '%',
            maxDataValue: 100,
            showImage: true
        }
    );

    const footer = element.querySelector('.j1-chart-footer');

    footer.appendChild(getTermInfo());

    const embedLink = getEmbedLink(element, 'frequencyInMajority');
    footer.appendChild(embedLink);
}
import { echartsContainer } from "../echarts.js";
import { justiceName } from "../../utils.js";

export default function frequencyInMajorityOverTimeChart(element, hits) {
    let numInMajority = {};
    let numParticipated = {};
    let terms = {};
    function initalizeMaps(justice, term) {
        terms[term] = true;
        if (!numInMajority[justice]) {
            numInMajority[justice] = {};
            numParticipated[justice] = {};
        }
        if (!numInMajority[justice][term]) {
            numInMajority[justice][term] = 0;
            numParticipated[justice][term] = 0;
        }
    }
    for (const hit of hits) {
        if (!hit.decision || !hit.decision.majorityVoters || !hit.decision.minorityVoters) continue;
        let term = hit.term;
        let majorityVoters = hit.decision.majorityVoters;
        let minorityVoters = hit.decision.minorityVoters;
        for (const justice of majorityVoters) {
            initalizeMaps(justice, term);
            numInMajority[justice][term]++;
            numParticipated[justice][term]++;
        }
        for (const justice of minorityVoters) {
            initalizeMaps(justice, term);
            numParticipated[justice][term]++;
        }
    }
    // create a sorted list of terms
    terms = Object.keys(terms).sort();
    let voterData = {};
    // get minimum value for y-axis
    let minPercent = 100;
    for (const [justice, num] of Object.entries(numInMajority)) {
        voterData[justiceName(justice)] = [];
        for (const term of terms) {
            if (num[term] === undefined || numParticipated[justice][term] === undefined || numParticipated[justice][term] === 0) {
                voterData[justiceName(justice)].push('-');
            } else {
                let percent = (num[term] / numParticipated[justice][term] * 100).toFixed(1);
                minPercent = Math.min(minPercent, percent);
                voterData[justiceName(justice)].push(percent);
            }
        }
    }
    // round down to nearest 10
    minPercent = Math.max(10, Math.floor((minPercent - 5) / 10) * 10);

    let series = [];
    for (const [justice, data] of Object.entries(voterData)) {
        series.push({
            name: justice,
            type: 'line',
            data: data,
            endLabel: {
                show: true,
                formatter: justice
            },
            smooth: 0.1,
            lineStyle: {
                width: 4
            },
            symbol: 'circle',
            symbolSize: 8,
        });
    }

    echartsContainer(
        element,
        {
            title: "How often is each justice in the majority over time?",
            subtitle: "Fraction of cases in which the justice voted with the majority, among cases in which the justice participated.",
            echartsOptions: {
                tooltip: {},
                xAxis: {
                    type: 'category',
                    data: terms
                },
                yAxis: {
                    type: 'value',
                    min: minPercent,
                    max: '100'
                },
                series: series,
                animation: false,
                grid: {
                    top: 10,
                    bottom: 20,
                    left: 30,
                    right: 10 + 2 * terms.length
                },
            }
        }
    );
}
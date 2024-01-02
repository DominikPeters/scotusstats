import { echartsContainer } from "../echarts.js";
import { justiceName, sum } from "../../utils.js";
import { getAmongCaveatString } from "../caveatGenerator.js";
import { getEmbedLink } from "../chartFooter.js";

export default function wordsSpokenOverTimeChart(element, hits) {
    let wordsSpoken = {};
    let numberArguments = {};
    let terms = {};
    function initalizeMaps(justice, term) {
        terms[term] = true;
        if (!wordsSpoken[justice]) {
            wordsSpoken[justice] = {};
            numberArguments[justice] = {};
        }
        if (!wordsSpoken[justice][term]) {
            wordsSpoken[justice][term] = 0;
            numberArguments[justice][term] = 0;
        }
    }
    for (const hit of hits) {
        if (!hit.oralArgumentInfo || !hit.oralArgumentInfo.wordsSpoken) continue;
        let term = hit.term;
        for (const [justice, words] of Object.entries(hit.oralArgumentInfo.wordsSpoken)) {
            if (!Array.isArray(words)) continue; // advocate
            initalizeMaps(justice, term);
            wordsSpoken[justice][term] += sum(words);
            numberArguments[justice][term]++;
        }
    }
    // create a sorted list of terms
    terms = Object.keys(terms).sort();
    let data = {};
    for (const justice of Object.keys(wordsSpoken)) {
        data[justiceName(justice)] = [];
        for (const term of terms) {
            if (wordsSpoken[justice][term] === undefined || numberArguments[justice][term] === undefined || numberArguments[justice][term] === 0) {
                data[justiceName(justice)].push('-');
            } else {
                data[justiceName(justice)].push((wordsSpoken[justice][term] / numberArguments[justice][term]).toFixed(0));
            }
        }
    }

    let series = [];
    for (const [justice, justiceData] of Object.entries(data)) {
        series.push({
            name: justice,
            type: 'line',
            data: justiceData,
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
            title: "How many words do justices speak during oral argument?",
            subtitle: `For each term, the average number of words spoken during an argument${getAmongCaveatString()}.`,
            height: '500px',
            echartsOptions: {
                tooltip: {},
                xAxis: {
                    type: 'category',
                    data: terms
                },
                yAxis: {
                    type: 'value',
                    name: 'words per argument',
                    nameGap: 0,
                    nameTextStyle: {
                        verticalAlign: 'middle', 
                        align: 'left',
                        backgroundColor: 'white',
                        padding: [0, 4, 0, -2],
                    },
                },
                series: series,
                animation: false,
                grid: {
                    top: 5,
                    bottom: 0,
                    left: 0,
                    right: 0 + 3.5 * terms.length,
                    containLabel: true
                },
            }
        }
    );

    const footer = element.querySelector('.j1-chart-footer');
    const embedLink = getEmbedLink(element, 'wordsSpokenOverTime');
    footer.appendChild(embedLink);
}
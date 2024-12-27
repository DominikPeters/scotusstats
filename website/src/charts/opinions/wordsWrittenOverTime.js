import { echartsContainer } from "../echarts.js";
import { getAmongCaveatString } from "../caveatGenerator.js";
import { getEmbedLink } from "../chartFooter.js";

export default function wordsWrittenOverTimeChart(element, hits) {
    let numWords = {'Total': {}};
    let terms = {};
    for (const hit of hits) {
        if (!hit.decision || !hit.decision.majorityVoters || !hit.decision.minorityVoters) continue;
        if (!hit.opinions) continue;
        let term = hit.term;
        let totalWords = 0;
        for (const opinion of hit.opinions) {
            terms[term] = true;
            const disposition = opinion.disposition;
            if (!numWords[disposition]) {
                numWords[disposition] = {};
            }
            if (!numWords[disposition][term]) {
                numWords[disposition][term] = 0;
            }
            numWords[disposition][term] += opinion['word_count'];
            totalWords += opinion['word_count'];
        }
        if (!numWords['Total'][term]) {
            numWords['Total'][term] = 0;
        }
        numWords['Total'][term] += totalWords;
    }
    // create a sorted list of terms
    terms = Object.keys(terms).sort();
    if (terms.length <= 1) {
        // not enough data to show chart
        element.innerHTML = "";
        element.style.display = "none";
        return;
    }
    let wordData = {};
    // get minimum value for y-axis
    for (const [disposition, num] of Object.entries(numWords)) {
        wordData[disposition] = [];
        for (const term of terms) {
            if (num[term] === undefined) {
                wordData[disposition].push('0');
            } else {
                wordData[disposition].push(num[term]);
            }
        }
    }

    let series = [];
    for (const [disposition, data] of Object.entries(wordData)) {
        series.push({
            name: disposition,
            type: 'line',
            data: data,
            endLabel: {
                show: data[data.length - 1] > 10000,
                align: 'center',
                formatter: disposition,
                textBorderColor: window.darkMode ? '#1a1a1a' : '#fff',
                textBorderWidth: 3,
                color: window.darkMode ? '#efefef' : '#000',
            },
            smooth: 0.2,
            lineStyle: {
                width: 6
            },
            symbol: 'circle',
            symbolSize: 10,
        });
    }

    echartsContainer(
        element,
        {
            title: "How long are opinions over time?",
            subtitle: `Number of words written in opinions by type of opinion${getAmongCaveatString()}.`,
            echartsOptions: {
                tooltip: {},
                xAxis: {
                    type: 'category',
                    data: terms
                },
                yAxis: {
                    type: 'value',
                },
                series: series,
                animation: false,
                grid: {
                    top: 5,
                    bottom: 0,
                    left: 4,
                    right: 15 + 3.5 * terms.length,
                    containLabel: true
                },
            }
        }
    );

    const footer = element.querySelector('.j1-chart-footer');
    const embedLink = getEmbedLink(element, 'wordsWrittenOverTime');
    footer.appendChild(embedLink);
}
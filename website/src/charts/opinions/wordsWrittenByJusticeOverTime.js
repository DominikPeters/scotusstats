import { echartsContainer } from "../echarts.js";
import { justiceName, sum } from "../../utils.js";
import { getAmongCaveatString } from "../caveatGenerator.js";
import { getEmbedLink } from "../chartFooter.js";

export default function wordsWrittenByJusticeOverTimeChart(element, hits) {
    let wordsWritten = {};
    let numberArguments = {};
    let terms = {};
    function initalizeMaps(justice, term) {
        terms[term] = true;
        if (!wordsWritten[justice]) {
            wordsWritten[justice] = {};
        }
        if (!wordsWritten[justice][term]) {
            wordsWritten[justice][term] = 0;
        }
    }
    for (const hit of hits) {
        if (!hit.opinions) continue;
        let term = hit.term;
        for (const opinion of hit.opinions) {
            const justice = opinion.author;
            initalizeMaps(justice, term);
            wordsWritten[justice][term] += opinion.word_count;
        }
    }
    // create a sorted list of terms
    terms = Object.keys(terms).sort();
    if (terms.length <= 1) {
        // not enough data to show chart
        element.innerHTML = "";
        element.style.display = "none";
        return;
    }
    let data = {};
    for (const justice of Object.keys(wordsWritten)) {
        data[justiceName(justice)] = [];
        for (const term of terms) {
            if (wordsWritten[justice][term] === undefined) {
                data[justiceName(justice)].push('-');
            } else {
                data[justiceName(justice)].push((wordsWritten[justice][term]));
            }
        }
    }

    let series = [];
    for (const [justice, justiceData] of Object.entries(data)) {
        const labelLayout = justiceData[justiceData.length - 1] === '-' ? {} : { moveOverlap: 'shiftY' };
        series.push({
            name: justice,
            type: 'line',
            data: justiceData,
            endLabel: {
                show: true,
                formatter: justice,
                textBorderColor: window.darkMode ? '#1a1a1a' : '#fff',
                textBorderWidth: 3,
                color: window.darkMode ? '#efefef' : '#000',
            },
            labelLayout: labelLayout,
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
            title: "How many words does each justice write over time?",
            subtitle: `For each term, the total number of words written in opinions${getAmongCaveatString()}.`,
            height: '500px',
            echartsOptions: {
                tooltip: {},
                xAxis: {
                    type: 'category',
                    data: terms
                },
                yAxis: {
                    type: 'value',
                    name: 'words',
                    nameGap: 0,
                    nameTextStyle: {
                        verticalAlign: 'middle', 
                        align: 'left',
                        backgroundColor: window.darkMode ? '#1a1a1a' : '#fff',
                        padding: [0, 4, 0, -2],
                    },
                },
                series: series,
                animation: false,
                grid: {
                    top: 5,
                    bottom: 0,
                    left: 5,
                    right: 0 + 3.5 * terms.length,
                    containLabel: true
                },
            }
        }
    );

    const footer = element.querySelector('.j1-chart-footer');
    const embedLink = getEmbedLink(element, 'wordsWrittenByJusticeOverTimeChart');
    footer.appendChild(embedLink);
}
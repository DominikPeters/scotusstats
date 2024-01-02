import { echartsContainer } from "../echarts.js";
import { getAmongCaveatString } from "../caveatGenerator.js";
import { getEmbedLink } from "../chartFooter.js";

const xAxisCap = 270;

export default function argumentLengthScatterChart(element, hits) {
    let numArguments = {};
    let maxMinutes = 0;
    for (const hit of hits) {
        if (!hit.oralArgumentInfo || !hit.oralArgumentInfo.overallLength) continue;
        let term = hit.term;
        let mins = hit.oralArgumentInfo.overallLength / 60;
        // round up to nearest 10
        mins = Math.ceil(mins / 10) * 10;
        mins = Math.min(mins, xAxisCap);
        if (!numArguments[term]) {
            numArguments[term] = [];
        }
        numArguments[term].push(mins);
        maxMinutes = Math.max(maxMinutes, mins);
    }
    // make a sorted list of mins buckets
    let minsBuckets = [];
    for (let i = 0; i < maxMinutes; i += 10) {
        minsBuckets.push(i);
    }
    // create a sorted list of terms
    let terms = Object.keys(numArguments).sort();
    let data = [];
    // each data point is [x, y, size]
    // x = mins bucket (can be obtained by dividing minutes by 10 and rounding down)
    // y = term (index in terms array)
    // size = number of cases
    let frequency = {};
    let maxFrequency = 0;
    for (const [i, term] of terms.entries()) {
        for (const mins of numArguments[term]) {
            let x = Math.floor(mins / 10) - 1;
            if (!frequency[x]) {
                frequency[x] = {};
            }
            if (!frequency[x][i]) {
                frequency[x][i] = 0;
            }
            frequency[x][i]++;
            maxFrequency = Math.max(maxFrequency, frequency[x][i]);
        }
    }
    for (const [x, frequencies] of Object.entries(frequency)) {
        for (const [y, size] of Object.entries(frequencies)) {
            data.push([parseInt(x), parseInt(y), size]);
        }
    }

    echartsContainer(
        element,
        {
            title: "How long do oral arguments last?",
            subtitle: `Total length in minutes, by term${getAmongCaveatString()}.`,
            height: `${terms.length * 50 + 100}px`,
            echartsOptions: {
                tooltip: {
                    position: 'top',
                    extraCssText: 'text-align: center;',
                    formatter: function (params) {
                        let minsString = params.value[0] * 10 + '&ndash;' + (params.value[0] * 10 + 10) + ' minutes';
                        if (params.value[0] == (xAxisCap / 10) - 1) {
                            minsString = `${xAxisCap-10}+ minutes`;
                        }
                        return (
                            '<strong>' +
                            params.value[2] +
                            (params.value[2] != 1 ? '</strong> arguments' : '</strong> argument') +
                            ' lasted <strong>' +
                            minsString +
                            '</strong><br/>in the ' +
                            terms[params.value[1]] +
                            ' term'
                        );
                    }
                },
                xAxis: {
                    type: 'category',
                    data: minsBuckets,
                },
                yAxis: {
                    type: 'category',
                    data: terms,
                },
                series: [{
                    name: 'minutes',
                    type: 'scatter',
                    data: data,
                    symbolSize: function (val) {
                        return Math.pow(val[2], 0.55) * 190 / (maxFrequency + 1);
                    },
                }],
                animation: false,
                grid: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10,
                    containLabel: true
                },
            }
        }
    );

    const footer = element.querySelector('.j1-chart-footer');
    const embedLink = getEmbedLink(element, 'argumentLengthScatter');
    footer.appendChild(embedLink);
}
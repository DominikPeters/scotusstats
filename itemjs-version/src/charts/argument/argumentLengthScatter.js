import { echartsContainer } from "../echarts.js";
import { getAmongCaveatString } from "../caveatGenerator.js";
import { getEmbedLink } from "../chartFooter.js";
import { shortenCasename } from "../../utils.js";

const xAxisCap = 180;

export default function argumentLengthScatterChart(element, hits) {
    let numArguments = {};
    let maxMinutes = 0;
    for (const hit of hits) {
        if (!hit.oralArgumentInfo || !hit.oralArgumentInfo.overallLength) continue;
        let term = hit.term;
        let name = hit.name;
        let mins = Math.floor(hit.oralArgumentInfo.overallLength / 60);
        if (!numArguments[term]) {
            numArguments[term] = [];
        }
        numArguments[term].push({ "name": name, "mins": mins });
        maxMinutes = Math.max(maxMinutes, mins);
    }
    // make a sorted list of mins buckets
    let minsBuckets = [];
    for (let i = 0; i <= Math.min(xAxisCap, maxMinutes); i += 10) {
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
    let examples = {};
    let maxFrequency = 0;
    for (const [i, term] of terms.entries()) {
        for (const { name, mins } of numArguments[term]) {
            let x = Math.min(Math.floor(mins / 10), xAxisCap / 10);
            if (!frequency[x]) {
                frequency[x] = {};
            }
            if (!frequency[x][i]) {
                frequency[x][i] = 0;
            }
            frequency[x][i]++;
            if (!examples[x]) examples[x] = {};
            if (!examples[x][i]) examples[x][i] = [];
            if (examples[x][i].length < 4) {
                examples[x][i].push(`${shortenCasename(name)} (${mins} min.)`);
            }
            maxFrequency = Math.max(maxFrequency, frequency[x][i]);
        }
    }
    for (const [x, frequencies] of Object.entries(frequency)) {
        for (const [y, size] of Object.entries(frequencies)) {
            data.push([parseInt(x), parseInt(y), size, examples[x][y]]);
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
                    formatter: function (params) {
                        let minsString = params.value[0] * 10 + '&ndash;' + (params.value[0] * 10 + 10) + ' minutes';
                        if (params.value[0] == (xAxisCap / 10)) {
                            minsString = `${xAxisCap}+ minutes`;
                        }
                        let exampleString = '';
                        if (params.value[3].length < 4) {
                            exampleString += ':<br>';
                        } else {
                            exampleString += ', including:<br>';
                        }
                        exampleString += '&bullet; ' + params.value[3].join('<br/>&bullet; ');
                        return (
                            '<strong>' +
                            params.value[2] +
                            (params.value[2] != 1 ? '</strong> arguments' : '</strong> argument') +
                            ' lasted <strong>' +
                            minsString +
                            '</strong> in the ' +
                            terms[params.value[1]] +
                            ' term' +
                            exampleString
                        );
                    }
                },
                xAxis: {
                    type: 'category',
                    data: minsBuckets,
                    name: 'minutes',
                    nameGap: 0,
                    nameTextStyle: {
                        verticalAlign: 'bottom',
                        align: 'right',
                        lineHeight: '20'
                    },
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
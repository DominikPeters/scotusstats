import { echartsContainer } from "../echarts.js";
import { getAmongCaveatString } from "../caveatGenerator.js";
import { getEmbedLink } from "../chartFooter.js";
import { shortenCasename } from "../../utils.js";

export default function amicusCountScatterChart(element, hits) {
    let numAmici = {};
    let maxNumAmici = 0;
    for (const hit of hits) {
        if (!hit["num_amicus_briefs"]) continue;
        let name = hit.name;
        let term = hit.term;
        let num = hit["num_amicus_briefs"];
        if (!numAmici[term]) {
            numAmici[term] = [];
        }
        numAmici[term].push({"name": name, "num": num});
        maxNumAmici = Math.max(maxNumAmici, num);
    }
    // make a sorted list of num buckets
    let numBuckets = [];
    for (let i = 0; i < maxNumAmici; i += 5) {
        numBuckets.push(i);
    }
    // create a sorted list of terms
    let terms = Object.keys(numAmici).sort();
    let data = [];
    // each data point is [x, y, size]
    // x = num bucket (can be obtained by dividing numAmici by 5 and rounding down)
    // y = term (index in terms array)
    // size = number of cases
    let frequency = {};
    let examples = {};
    let maxFrequency = 0;
    for (const [i, term] of terms.entries()) {
        for (const { name, num } of numAmici[term]) {
            let x = Math.floor(num / 5);
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
                examples[x][i].push(`${shortenCasename(name)} (${num} amici)`);
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
            title: "How many amicus briefs?",
            subtitle: `Number of cases by number of amici ("friends of the court") who filed briefs, by term${getAmongCaveatString()}.`,
            height: `${terms.length * 50 + 100}px`,
            echartsOptions: {
                tooltip: {
                    position: 'top',
                    // extraCssText: 'text-align: center;',
                    formatter: function (params) {
                        let numString = params.value[0] * 5 + '&ndash;' + (params.value[0] * 5 + 5) + ' amici';
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
                            (params.value[2] != 1 ? '</strong> cases' : '</strong> case') +
                            ' had <strong>' +
                            numString +
                            '</strong> in the ' +
                            terms[params.value[1]] +
                            ' term' +
                            exampleString
                        );
                    }
                },
                xAxis: {
                    type: 'category',
                    data: numBuckets,
                    name: 'amici',
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
                    name: 'Number of amici',
                    type: 'scatter',
                    data: data,
                    symbolSize: function (val) {
                        return Math.pow(val[2], 0.5) * 180 / (maxFrequency + 1);
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
    const embedLink = getEmbedLink(element, 'amicusCountScatter');
    footer.appendChild(embedLink);
}
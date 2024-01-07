import { echartsContainer } from "../echarts.js";
import { getAmongCaveatString } from "../caveatGenerator.js";
import { getEmbedLink } from "../chartFooter.js";

export default function amicusCountScatterChart(element, hits) {
    let numAmici = {};
    let maxNumAmici = 0;
    for (const hit of hits) {
        if (!hit["num_amicus_briefs"]) continue;
        let term = hit.term;
        let num = hit["num_amicus_briefs"];
        if (!numAmici[term]) {
            numAmici[term] = [];
        }
        numAmici[term].push(num);
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
    let maxFrequency = 0;
    for (const [i, term] of terms.entries()) {
        for (const num of numAmici[term]) {
            let x = Math.floor(num / 5);
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
            title: "How many amicus briefs?",
            subtitle: `Number of cases with by number of amici ("friends of the court") who filed briefs, by term${getAmongCaveatString()}.`,
            height: `${terms.length * 50 + 100}px`,
            echartsOptions: {
                tooltip: {
                    position: 'top',
                    extraCssText: 'text-align: center;',
                    formatter: function (params) {
                        let numString = params.value[0] * 5 + '&ndash;' + (params.value[0] * 5 + 5) + ' amici';
                        return (
                            '<strong>' +
                            params.value[2] +
                            (params.value[2] != 1 ? '</strong> cases' : '</strong> case') +
                            ' had <strong>' +
                            numString +
                            '</strong><br/> in the ' +
                            terms[params.value[1]] +
                            ' term'
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
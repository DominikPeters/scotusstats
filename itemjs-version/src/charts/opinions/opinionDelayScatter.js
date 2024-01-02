import { echartsContainer } from "../echarts.js";
import { getAmongCaveatString } from "../caveatGenerator.js";

export default function opinionDelayScatterChart(element, hits) {
    let daysTaken = {};
    let maxDays = 0;
    for (const hit of hits) {
        if (!hit.delayDays) continue;
        let term = hit.term;
        let days = hit.delayDays;
        // round up to nearest 10
        days = Math.ceil(days / 10) * 10;
        days = Math.min(days, 270);
        if (!daysTaken[term]) {
            daysTaken[term] = [];
        }
        daysTaken[term].push(days);
        maxDays = Math.max(maxDays, days);
    }
    // make a sorted list of day buckets
    let dayBuckets = [];
    for (let i = 0; i < maxDays; i += 10) {
        dayBuckets.push(i);
    }
    // create a sorted list of terms
    let terms = Object.keys(daysTaken).sort();
    let data = [];
    // each data point is [x, y, size]
    // x = day bucket (can be obtained by dividing delayDays by 10 and rounding down)
    // y = term (index in terms array)
    // size = number of cases
    let frequency = {};
    let maxFrequency = 0;
    for (const [i, term] of terms.entries()) {
        for (const days of daysTaken[term]) {
            let x = Math.floor(days / 10) - 1;
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
            title: "How long after oral argument are decisions issued?",
            subtitle: `Number of days, by term${getAmongCaveatString()}.`,
            height: `${terms.length * 50 + 100}px`,
            echartsOptions: {
                tooltip: {
                    position: 'top',
                    extraCssText: 'text-align: center;',
                    formatter: function (params) {
                        let dayString = params.value[0] * 10 + '&ndash;' + (params.value[0] * 10 + 10) + ' days';
                        if (params.value[0] == 26) {
                            dayString = '260+ days';
                        }
                        return (
                            '<strong>' +
                            params.value[2] +
                            (params.value[2] != 1 ? '</strong> opinions' : '</strong> opinion') +
                            ' issued <strong>' +
                            dayString +
                            ' days</strong><br/>after oral argument in the ' +
                            terms[params.value[1]] +
                            ' term'
                        );
                    }
                },
                xAxis: {
                    type: 'category',
                    data: dayBuckets,
                },
                yAxis: {
                    type: 'category',
                    data: terms,
                },
                series: [{
                    name: 'Days taken',
                    type: 'scatter',
                    data: data,
                    symbolSize: function (val) {
                        return Math.pow(val[2], 0.75) * 80 / (maxFrequency + 1);
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
}
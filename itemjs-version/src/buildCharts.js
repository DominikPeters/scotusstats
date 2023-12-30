import frequencyInMajorityChart from './charts/voting/frequencyInMajority.js';
import frequencyInMajorityOverTimeChart from './charts/voting/frequencyInMajorityOverTime.js';

import fractionWordsChart from './charts/argument/fractionWords.js';

import numberMajorityOpinionsWrittenChart from './charts/opinions/numberMajorityOpinionsWritten.js';

export function buildCharts(hits) {
    if (!hits) return;
    const chartsContainer = document.getElementById('charts');
    chartsContainer.innerHTML = "";

    // voting charts
    const frequencyInMajorityChartContainer = document.createElement('div');
    frequencyInMajorityChartContainer.id = "frequency-in-majority-chart";
    frequencyInMajorityChartContainer.className = "j1-chart-container";
    chartsContainer.appendChild(frequencyInMajorityChartContainer);
    frequencyInMajorityChart(frequencyInMajorityChartContainer, hits);

    const frequencyInMajorityOverTimeChartContainer = document.createElement('div');
    frequencyInMajorityOverTimeChartContainer.id = "frequency-in-majority-over-time-chart";
    frequencyInMajorityOverTimeChartContainer.className = "j1-chart-container";
    chartsContainer.appendChild(frequencyInMajorityOverTimeChartContainer);
    frequencyInMajorityOverTimeChart(frequencyInMajorityOverTimeChartContainer, hits);

    // argument charts
    const fractionWordsChartContainer = document.createElement('div');
    fractionWordsChartContainer.id = "fraction-words-chart";
    fractionWordsChartContainer.className = "j1-chart-container";
    chartsContainer.appendChild(fractionWordsChartContainer);
    fractionWordsChart(fractionWordsChartContainer, hits);

    // opinions charts
    const numberMajorityOpinionsWrittenChartContainer = document.createElement('div');
    numberMajorityOpinionsWrittenChartContainer.id = "number-majority-opinions-written-chart";
    numberMajorityOpinionsWrittenChartContainer.className = "j1-chart-container";
    chartsContainer.appendChild(numberMajorityOpinionsWrittenChartContainer);
    numberMajorityOpinionsWrittenChart(numberMajorityOpinionsWrittenChartContainer, hits);
}
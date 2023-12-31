import frequencyInMajorityChart from './charts/voting/frequencyInMajority.js';
import frequencyInMajorityOverTimeChart from './charts/voting/frequencyInMajorityOverTime.js';

import fractionWordsChart from './charts/argument/fractionWords.js';
import advocateTimeChart from './charts/argument/advocateTime.js';

import numberMajorityOpinionsWrittenChart from './charts/opinions/numberMajorityOpinionsWritten.js';
import opinionDelayScatterChart from './charts/opinions/opinionDelayScatter.js';

import topicsTreeMapChart from './charts/cases/topicsTreeMap.js';

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

    const advocateTimeChartContainer = document.createElement('div');
    advocateTimeChartContainer.id = "advocate-time-chart";
    advocateTimeChartContainer.className = "j1-chart-container";
    chartsContainer.appendChild(advocateTimeChartContainer);
    advocateTimeChart(advocateTimeChartContainer, hits);

    // opinions charts
    const numberMajorityOpinionsWrittenChartContainer = document.createElement('div');
    numberMajorityOpinionsWrittenChartContainer.id = "number-majority-opinions-written-chart";
    numberMajorityOpinionsWrittenChartContainer.className = "j1-chart-container";
    chartsContainer.appendChild(numberMajorityOpinionsWrittenChartContainer);
    numberMajorityOpinionsWrittenChart(numberMajorityOpinionsWrittenChartContainer, hits);

    const opinionDelayScatterChartContainer = document.createElement('div');
    opinionDelayScatterChartContainer.id = "opinion-delay-scatter-chart";
    opinionDelayScatterChartContainer.className = "j1-chart-container";
    chartsContainer.appendChild(opinionDelayScatterChartContainer);
    opinionDelayScatterChart(opinionDelayScatterChartContainer, hits);

    // cases charts
    const topicsTreeMapChartContainer = document.createElement('div');
    topicsTreeMapChartContainer.id = "topics-tree-map-chart";
    topicsTreeMapChartContainer.className = "j1-chart-container";
    chartsContainer.appendChild(topicsTreeMapChartContainer);
    topicsTreeMapChart(topicsTreeMapChartContainer, hits);
}
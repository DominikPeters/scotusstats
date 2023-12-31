import frequencyInMajorityChart from './charts/voting/frequencyInMajority.js';
import frequencyInMajorityOverTimeChart from './charts/voting/frequencyInMajorityOverTime.js';
import agreementPairsChart from './charts/voting/agreementPairs.js';
import agreementTriplesChart from './charts/voting/agreementTriples.js';

import fractionWordsChart from './charts/argument/fractionWords.js';
import wordsSpokenOverTimeChart from './charts/argument/wordsSpokenOverTime.js';
import argumentLengthScatterChart from './charts/argument/argumentLengthScatter.js';
import advocateTimeChart from './charts/argument/advocateTime.js';

import numberMajorityOpinionsWrittenChart from './charts/opinions/numberMajorityOpinionsWritten.js';
import opinionDelayScatterChart from './charts/opinions/opinionDelayScatter.js';

import numberCasesDecidedChart from './charts/cases/numberCasesDecided.js';
import topicsTreeMapChart from './charts/cases/topicsTreeMap.js';

function buildChart(chartFunction, chartId, chartsContainer, hits) {
    const chartContainer = document.createElement('div');
    chartContainer.id = chartId;
    chartContainer.className = "j1-chart-container";
    chartsContainer.appendChild(chartContainer);
    chartFunction(chartContainer, hits);
}

export function buildCharts(hits) {
    if (!hits) return;
    const chartsContainer = document.getElementById('charts');
    chartsContainer.innerHTML = "";

    let h2;
    
    // voting charts
    h2 = document.createElement('h2');
    h2.innerText = "Voting";
    chartsContainer.appendChild(h2);

    buildChart(frequencyInMajorityChart, "frequency-in-majority-chart", chartsContainer, hits);
    buildChart(frequencyInMajorityOverTimeChart, "frequency-in-majority-over-time-chart", chartsContainer, hits);
    buildChart(agreementPairsChart(true), "agreement-pairs-chart", chartsContainer, hits);
    buildChart(agreementPairsChart(false), "disagreement-pairs-chart", chartsContainer, hits);
    buildChart(agreementTriplesChart, "agreement-triples-chart", chartsContainer, hits);

    // argument charts
    h2 = document.createElement('h2');
    h2.innerText = "Oral Argument";
    chartsContainer.appendChild(h2);

    buildChart(fractionWordsChart, "fraction-words-chart", chartsContainer, hits);
    buildChart(wordsSpokenOverTimeChart, "words-spoken-over-time-chart", chartsContainer, hits);
    buildChart(argumentLengthScatterChart, "argument-length-scatter-chart", chartsContainer, hits);
    buildChart(advocateTimeChart, "advocate-time-chart", chartsContainer, hits);

    // opinions charts
    h2 = document.createElement('h2');
    h2.innerText = "Opinions";
    chartsContainer.appendChild(h2);

    buildChart(numberMajorityOpinionsWrittenChart, "number-majority-opinions-written-chart", chartsContainer, hits);
    buildChart(opinionDelayScatterChart, "opinion-delay-scatter-chart", chartsContainer, hits);

    // cases charts
    h2 = document.createElement('h2');
    h2.innerText = "Cases";
    chartsContainer.appendChild(h2);

    buildChart(numberCasesDecidedChart, "number-cases-decided-chart", chartsContainer, hits);
    buildChart(topicsTreeMapChart, "topics-tree-map-chart", chartsContainer, hits);
}
import frequencyInMajorityChart from './charts/voting/frequencyInMajority.js';
import frequencyInMajorityOverTimeChart from './charts/voting/frequencyInMajorityOverTime.js';
import agreementPairsChart from './charts/voting/agreementPairs.js';
import disagreementPairsChart from './charts/voting/disagreementPairs.js';
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

    let section;

    let h2;
    
    // voting charts
    section = document.createElement('section');
    section.id = "voting";
    chartsContainer.appendChild(section);
    h2 = document.createElement('h2');
    h2.innerText = "Voting";
    section.appendChild(h2);

    buildChart(frequencyInMajorityChart, "frequency-in-majority-chart", section, hits);
    buildChart(frequencyInMajorityOverTimeChart, "frequency-in-majority-over-time-chart", section, hits);
    buildChart(agreementPairsChart, "agreement-pairs-chart", section, hits);
    buildChart(disagreementPairsChart, "disagreement-pairs-chart", section, hits);
    buildChart(agreementTriplesChart, "agreement-triples-chart", section, hits);

    // argument charts
    section = document.createElement('section');
    section.id = "argument";
    chartsContainer.appendChild(section);
    h2 = document.createElement('h2');
    h2.innerText = "Oral Argument";
    section.appendChild(h2);

    buildChart(fractionWordsChart, "fraction-words-chart", section, hits);
    buildChart(wordsSpokenOverTimeChart, "words-spoken-over-time-chart", section, hits);
    buildChart(argumentLengthScatterChart, "argument-length-scatter-chart", section, hits);
    buildChart(advocateTimeChart, "advocate-time-chart", section, hits);

    // opinions charts
    section = document.createElement('section');
    section.id = "opinions";
    chartsContainer.appendChild(section);
    h2 = document.createElement('h2');
    h2.innerText = "Opinions";
    section.appendChild(h2);

    buildChart(numberMajorityOpinionsWrittenChart, "number-majority-opinions-written-chart", section, hits);
    buildChart(opinionDelayScatterChart, "opinion-delay-scatter-chart", section, hits);

    // cases charts
    section = document.createElement('section');
    section.id = "cases";
    chartsContainer.appendChild(section);
    h2 = document.createElement('h2');
    h2.innerText = "Cases";
    section.appendChild(h2);

    buildChart(numberCasesDecidedChart, "number-cases-decided-chart", section, hits);
    buildChart(topicsTreeMapChart, "topics-tree-map-chart", section, hits);
}
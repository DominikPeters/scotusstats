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
import wordsWrittenByJusticeChart from './charts/opinions/wordsWrittenByJustice.js';
import wordsWrittenByJusticeOverTimeChart from './charts/opinions/wordsWrittenByJusticeOverTime.js';
import wordsWrittenOverTimeChart from './charts/opinions/wordsWrittenOverTime.js';
import opinionDelayScatterChart from './charts/opinions/opinionDelayScatter.js';
import opinionAssignmentSankeyChart from './charts/opinions/opinionAssignmentSankey.js';

import numberCasesDecidedChart from './charts/cases/numberCasesDecided.js';
import lowerCourtPyramidChart from './charts/cases/lowerCourtPyramid.js';
import amicusCountScatterChart from './charts/cases/amicusCountScatter.js';
import topicsTreeMapChart from './charts/cases/topicsTreeMap.js';

function buildChart(chartFunction, chartId, chartsContainer, hits) {
    const chartContainer = document.createElement('div');
    chartContainer.id = chartId;
    chartContainer.className = "j1-chart-container";
    chartContainer.style.display = "";
    chartsContainer.appendChild(chartContainer);
    chartFunction(chartContainer, hits);
}

function lookingAtSingleTerm() {
    const items = search.renderState.scotusstats.currentRefinements.items;
    if (items.length !== 1) return false;
    const item = items[0];
    if (item.attribute !== "term") return false;
    if (item.refinements.length !== 1) return false;
    return true;
}

function scrollToHash() {
    const hash = window.location.hash;
    if (hash) {
        const element = document.querySelector(hash);
        if (element) {
            element.scrollIntoView({});
        }
    }
}

export function buildCharts(hits, allRecords) {
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
    buildChart(frequencyInMajorityOverTimeChart, "frequency-in-majority-over-time-chart", section, lookingAtSingleTerm() ? allRecords : hits);
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
    buildChart(wordsSpokenOverTimeChart, "words-spoken-over-time-chart", section, lookingAtSingleTerm() ? allRecords : hits);
    buildChart(argumentLengthScatterChart, "argument-length-scatter-chart", section, lookingAtSingleTerm() ? allRecords : hits);
    buildChart(advocateTimeChart, "advocate-time-chart", section, hits);

    // opinions charts
    section = document.createElement('section');
    section.id = "opinions";
    chartsContainer.appendChild(section);
    h2 = document.createElement('h2');
    h2.innerText = "Opinions";
    section.appendChild(h2);

    buildChart(numberMajorityOpinionsWrittenChart, "number-majority-opinions-written-chart", section, hits);
    buildChart(wordsWrittenByJusticeChart, "words-written-by-justice-chart", section, hits);
    buildChart(wordsWrittenByJusticeOverTimeChart, "words-written-by-justice-over-time-chart", section, lookingAtSingleTerm() ? allRecords : hits);
    buildChart(wordsWrittenOverTimeChart, "words-written-over-time-chart", section, lookingAtSingleTerm() ? allRecords : hits);
    buildChart(opinionDelayScatterChart, "opinion-delay-scatter-chart", section, lookingAtSingleTerm() ? allRecords : hits);
    buildChart(opinionAssignmentSankeyChart, "opinion-assignment-sankey-chart", section, hits);

    // cases charts
    section = document.createElement('section');
    section.id = "cases";
    chartsContainer.appendChild(section);
    h2 = document.createElement('h2');
    h2.innerText = "Cases";
    section.appendChild(h2);

    buildChart(numberCasesDecidedChart, "number-cases-decided-chart", section, lookingAtSingleTerm() ? allRecords : hits);
    buildChart(lowerCourtPyramidChart, "lower-court-pyramid-chart", section, hits);
    buildChart(amicusCountScatterChart, "amicus-count-scatter-chart", section, lookingAtSingleTerm() ? allRecords : hits);
    buildChart(topicsTreeMapChart, "topics-tree-map-chart", section, hits);

    setTimeout(scrollToHash, 500);
}

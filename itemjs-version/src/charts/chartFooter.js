import { showEmbedModal } from './embedModal.js';

function summarizeYears(years) {
    if (!years || years.length === 0) return '';

    // Convert to numbers and sort
    const sortedYears = years.map(Number).sort((a, b) => a - b);

    let result = '';
    let start = sortedYears[0];
    let end = start;

    for (let i = 1; i < sortedYears.length; i++) {
        if (sortedYears[i] === end + 1) {
            end = sortedYears[i];
        } else {
            result += start === end ? `${start}, ` : `${start}-${end}, `;
            start = end = sortedYears[i];
        }
    }

    // Handle the last range or year
    result += start === end ? `${start}` : `${start}-${end}`;
    return result;
}

export function getTermInfo() {
    const span = document.createElement('span');
    const filter = search.renderState.scotusstats.currentRefinements.items;
    const termRefinements = filter.find(item => item.attribute === "term");
    if (!termRefinements) return span;
    const terms = termRefinements.refinements.map(item => item.value);
    const years = summarizeYears(terms);
    if (terms.length > 1) {
        span.textContent = ` ·  Terms: ${years}`;
    } else if (terms.length === 1) {
        span.textContent = ` ·  Term: ${years}`;
    } else {
        span.textContent = '';
    }
    return span;
}

export function getEmbedLink(chartContainer, chartType) {
    if (window.isChartEmbed) return document.createElement('span');
    const filter = search.renderState.scotusstats.currentRefinements.items;
    const embedOptions = {
        filter: filter,
        chartType: chartType,
        chartTitle: chartContainer.querySelector('.j1-chart-title').textContent,
        chartSubtitle: chartContainer.querySelector('.j1-chart-subtitle').textContent,
    };

    const span = document.createElement('span');
    span.className = "j1-embed-link-container";
    span.textContent = " · ";

    const a = document.createElement('a');
    a.href = "#";
    a.className = "j1-embed-link";
    a.textContent = "Share";

    a.addEventListener('click', (e) => {
        e.preventDefault();
        showEmbedModal(chartContainer, embedOptions);
    });

    span.appendChild(a);

    return span;
}
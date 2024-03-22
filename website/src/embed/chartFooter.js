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
    return document.createElement('span');
}
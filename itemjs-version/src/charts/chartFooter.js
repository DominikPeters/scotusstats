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

export function getEmbedLink(chartType) {
    const filter = search.renderState.scotusstats.currentRefinements.items;
    const embedOptions = {
        filter: filter,
        chartType: chartType,
    };

    const span = document.createElement('span');
    span.className = "j1-embed-link-container";
    span.textContent = " · ";

    const a = document.createElement('a');
    a.href = "#";
    a.className = "j1-embed-link";
    a.textContent = "Embed this chart";

    a.addEventListener('click', (e) => {
        e.preventDefault();
        fetch('https://scotusstats.com/chart/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'filter': JSON.stringify(embedOptions),
            })
        })
        .then(response => response.json())
        .then(data => {
            // should be "result" => "success", "id" => $id
            if (data.result === "success") {
                const embedLink = document.createElement('input');
                embedLink.type = "text";
                embedLink.value = `https://scotusstats.com/chart/${data.id}`;
                embedLink.className = "embed-link-input";
                a.parentNode.replaceChild(embedLink, a);
                embedLink.select();
                embedLink.addEventListener('blur', () => {
                    embedLink.parentNode.replaceChild(a, embedLink);
                });
            } else {
                console.error("Error registering embed:", data);
            }
        });
    });

    span.appendChild(a);

    return span;
}
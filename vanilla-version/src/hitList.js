export function hitListItemTemplate(hit, { html, components }) {
    return html`
<article>
    <details>
        <summary>
            [${hit.docket_number}] <strong>${hit.name}</strong>
        </summary>
        <p>
            <strong>Term:</strong> ${hit.term}.
            <strong>Lower court:</strong> ${hit.lowerCourt}.
            <a href="https://www.oyez.org/cases/${hit.term}/${hit.docket_number}">Oyez</a>
        </p>
    </details>
</article>
`;
}
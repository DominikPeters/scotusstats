export function hitListItemTemplate(hit, { html, components }) {
    return html`
<article class="hitlist-item">
    <details>
        <summary>
            <span class="hitlist-docket-number">[${hit.docket_number}]</span> <strong>${hit.name}</strong>
        </summary>
        <p>
            <strong>Term:</strong> ${hit.term}. <br/>
            <strong>Lower court:</strong> ${hit.lowerCourt}. <br/>
            <a href="https://www.oyez.org/cases/${hit.term}/${hit.docket_number}">Oyez</a>
        </p>
    </details>
</article>
`;
}
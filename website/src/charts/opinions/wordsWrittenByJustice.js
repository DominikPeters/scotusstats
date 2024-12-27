import { j1Chart } from "../j1Chart.js";
import { justiceName } from "../../utils.js";
import { getAmongCaveatString } from "../caveatGenerator.js";
import { getEmbedLink, getTermInfo } from "../chartFooter.js";

export default function wordsWrittenByJusticeChart(element, hits) {
    let data = {}
    for (const hit of hits) {
        if (!hit.decision || !hit.opinions) continue;
        for (const opinion of hit.opinions) {
            let author = justiceName(opinion.author);
            if (!data[author]) {
                data[author] = 0;
            }
            data[author] += opinion.word_count;
        }
    }
    j1Chart(
        element,
        {
            data: data,
            title: "How many words did each justice write?",
            subtitle: `Number of words written in opinions by each justice${getAmongCaveatString()}.`,
            dataFormatter: (value) => value.toLocaleString(),
            showImage: true
        }
    );

    const footer = element.querySelector('.j1-chart-footer');

    footer.appendChild(getTermInfo());

    const embedLink = getEmbedLink(element, 'wordsWrittenByJusticeChart');
    footer.appendChild(embedLink);
}
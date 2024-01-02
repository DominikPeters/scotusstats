import { j1Chart } from "../j1Chart.js";
import { getCaveatString } from "../caveatGenerator.js";

export default function numberCasesDecidedChart(element, hits) {
    let data = {}
    for (const hit of hits) {
        if (!hit.decision || !hit.term) continue;
        let term = hit.term;
        if (!data[term]) {
            data[term] = 0;
        }
        data[term]++;
    }
    // sort the object by term
    data = Object.fromEntries(Object.entries(data).sort((a, b) => parseInt(b[0]) - parseInt(a[0])));
    j1Chart(
        element,
        {
            data: data,
            title: "How many cases did the Supreme Court decide?",
            subtitle: `Number of cases${getCaveatString()} with opinions, by term.`,
            sort: false,
            showImage: false
        }
    );
}
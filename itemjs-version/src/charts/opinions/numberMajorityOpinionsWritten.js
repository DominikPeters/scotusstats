import { j1Chart } from "../j1Chart.js";
import { justiceName } from "../../utils.js";

export default function numberMajorityOpinionsWrittenChart(element, hits) {
    let data = {}
    for (const hit of hits) {
        if (!hit.decision || !hit.decision.majorityWriter) continue;
        let majorityWriter = justiceName(hit.decision.majorityWriter);
        if (!data[majorityWriter]) {
            data[majorityWriter] = 0;
        }
        data[majorityWriter]++;
    }
    j1Chart(
        element,
        {
            data: data,
            title: "How many majority opinions did each justice write?",
            subtitle: "Number of Opinions of the Court written by each justice.",
            showImage: true
        }
    );
}
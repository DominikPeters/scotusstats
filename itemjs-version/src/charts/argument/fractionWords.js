import { j1Chart } from '../j1Chart.js';
import { sum, justiceName } from '../../utils.js';
import { getWhichCaveatString } from "../caveatGenerator.js";
import { getEmbedLink, getTermInfo } from "../chartFooter.js";

export default function fractionWordsChart(element, hits) {
    // oral argument words chart
    // key oralArgumentInfo > wordsSpoken > justiceName > [list of numbers]
    // key oralArgumentInfo > wordsSpoken > advocateName > single number
    // step 1: get total number of words spoken during oral argument by all justices (ignoring advocates)
    // step 2: get fraction of words spoken by each justice
    // step 3: compute average across cases
    let wordFractions = {};
    for (const hit of hits) {
      if (!hit.oralArgumentInfo || !hit.oralArgumentInfo.wordsSpoken) continue;
      let totalWords = 0;
      for (const [justice, words] of Object.entries(hit.oralArgumentInfo.wordsSpoken)) {
        if (!Array.isArray(words)) continue;
        totalWords += sum(words);
      }
      for (const [justice, words] of Object.entries(hit.oralArgumentInfo.wordsSpoken)) {
        if (!Array.isArray(words)) continue;
        if (!wordFractions[justice]) {
          wordFractions[justice] = [];
        }
        wordFractions[justice].push(sum(words) / totalWords);
      }
    }
    let avgWordFractions = {};
    for (const [justice, fractions] of Object.entries(wordFractions)) {
      avgWordFractions[justiceName(justice)] = (sum(fractions) / fractions.length * 100).toFixed(1);
    }

    j1Chart(
      element,
      {
        data: avgWordFractions,
        title: "How much does each justice speak during oral argument?",
        subtitle: `Fraction of words spoken by the justice during an average oral argument in which they participated${getWhichCaveatString()}.`,
        dataSuffix: '%',
        maxDataValue: Math.max(30, Math.max(...Object.values(avgWordFractions)) + 10),
        showImage: true
      }
    );

    const footer = element.querySelector('.j1-chart-footer');

    footer.appendChild(getTermInfo());

    const embedLink = getEmbedLink('frequencyInMajority');
    footer.appendChild(embedLink);
}
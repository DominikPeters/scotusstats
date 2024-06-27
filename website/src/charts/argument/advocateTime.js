import { j1Chart } from '../j1Chart.js';
import { getAmongCaveatString } from "../caveatGenerator.js";
import { getEmbedLink, getTermInfo } from "../chartFooter.js";
import c from 'dom-to-image-more';

export default function advocateTimeChart(element, hits) {
    let advocateTime = {};
    let caseNames = {};
    const customImages = {};
    for (const hit of hits) {
      if (!hit.oralArgumentInfo || !hit.oralArgumentInfo.argumentTime) continue;
      // argument time is a list of 3-tuples (advocate name, oyez identifier, time)
      for (const [advocate, identifier, time] of hit.oralArgumentInfo.argumentTime) {
        if (!advocateTime[advocate]) {
          advocateTime[advocate] = 0;
          caseNames[advocate] = [];
        }
        advocateTime[advocate] += parseFloat(time) / 60;
        customImages[advocate] =  `/img/advocates/${identifier}.jpg`;
        caseNames[advocate].push(hit.name);
      }
    }
    let maxTime = Math.max(...Object.values(advocateTime));
    let sortedAdvocates = Object.keys(advocateTime).sort((a, b) => advocateTime[b] - advocateTime[a]);

    let top15AdvocateTimes = {};
    let tooltips = {};
    for (const advocate of sortedAdvocates.slice(0, 15)) {
      top15AdvocateTimes[advocate] = advocateTime[advocate];
      tooltips[advocate] = `${advocate} spoke for ${Math.round(advocateTime[advocate])} minutes in ${caseNames[advocate].length} cases
      <br>&bullet; ${caseNames[advocate].slice(0, 8).join('<br>&bullet; ')}${caseNames[advocate].length > 8 ? '<br>&bullet; ...' : ''}`;
    }

    j1Chart(
      element,
      {
        data: top15AdvocateTimes,
        tooltips: tooltips,
        title: "Longest total argument time by advocate",
        subtitle: `Top 15 advocates, summing across all their arguments${getAmongCaveatString()}.`,
        dataFormatter: (value) => value > 60 ? `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')} h` : `${Math.floor(value)} m`,
        maxDataValue: maxTime,
        chartColor: '#1d81a2',
        showImage: true,
        customImages: customImages
      }
    );

    const footer = element.querySelector('.j1-chart-footer');

    footer.appendChild(getTermInfo());

    const embedLink = getEmbedLink(element, 'advocateTime');
    footer.appendChild(embedLink);
}
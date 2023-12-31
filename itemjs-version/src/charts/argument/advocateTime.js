import { j1Chart } from '../j1Chart.js';

export default function advocateTimeChart(element, hits) {
    let advocateTime = {};
    for (const hit of hits) {
      if (!hit.oralArgumentInfo || !hit.oralArgumentInfo.argumentTime) continue;
      for (const [advocate, time] of Object.entries(hit.oralArgumentInfo.argumentTime)) {
        if (!advocateTime[advocate]) {
          advocateTime[advocate] = 0;
        }
        advocateTime[advocate] += parseFloat(time) / 60;
      }
    }
    let maxTime = Math.max(...Object.values(advocateTime));
    let sortedAdvocates = Object.keys(advocateTime).sort((a, b) => advocateTime[b] - advocateTime[a]);

    let top20AdvocateTimes = {};
    for (const advocate of sortedAdvocates.slice(0, 20)) {
      top20AdvocateTimes[advocate] = advocateTime[advocate];
    }

    j1Chart(
      element,
      {
        data: top20AdvocateTimes,
        title: "Longest total argument time by advocate",
        subtitle: "Top 20 advocates, summing across all their arguments.",
        dataFormatter: (value) => value > 60 ? `${(value / 60).toFixed(0)}:${(value % 60).toString().padStart(2, '0')} hours` : `${value} m`,
        maxDataValue: maxTime,
        showImage: false,
      }
    );
}
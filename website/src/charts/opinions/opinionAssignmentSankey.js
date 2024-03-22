import { echartsContainer } from "../echarts.js";
import { getAmongCaveatString } from "../caveatGenerator.js";
import { getEmbedLink, getTermInfo } from "../chartFooter.js";
import { shortenCasename } from "../../utils.js";

export default function opinionAssignmentSankeyChart(element, hits) {
    let assignments = {};
    let totalAssignments = {};
    let assignees = [];
    for (const hit of hits) {
        if (!hit.majOpinionAssigner) continue;
        if (!hit.decision || !hit.decision.majorityWriter) continue;
        let majOpinionAssigner = hit.majOpinionAssigner;
        let majOpinionWriter = hit.decision.majorityWriter;
        if (!assignments[majOpinionAssigner]) {
            assignments[majOpinionAssigner] = {};
            totalAssignments[majOpinionAssigner] = 0;
        }
        if (!assignments[majOpinionAssigner][majOpinionWriter]) {
            assignments[majOpinionAssigner][majOpinionWriter] = [];
        }
        if (!assignees.includes(majOpinionWriter)) {
            assignees.push(majOpinionWriter);
        }
        assignments[majOpinionAssigner][majOpinionWriter].push(hit.name);
        totalAssignments[majOpinionAssigner]++;
    }
    let assigners = Object.keys(assignments).sort((a, b) => totalAssignments[b] - totalAssignments[a]);

    // sankey data
    let data = [];
    for (const assigner of assigners) {
        const color = assigner === "Roberts" ? '#5470c6' : '#c68b54';
        data.push({
            name: `${assigner} `, 
            depth: 0, 
            label: {
                position: 'left', 
                textBorderColor: window.darkMode ? '#1a1a1a' : '#fff',
                color: window.darkMode ? '#efefef' : '#000'
            }, 
            itemStyle: {color: color}
        });
    }
    for (const assignee of assignees) {
        data.push({
            name: `${assignee}`, 
            depth: 1, 
            label: {
                textBorderColor: window.darkMode ? '#1a1a1a' : '#fff',
                color: window.darkMode ? '#efefef' : '#000'
            }, 
            itemStyle: {color: '#4CAF50'}
        });
    }
    let links = [];
    for (const [assigner, assignerAssignments] of Object.entries(assignments)) {
        for (const [assignee, cases] of Object.entries(assignerAssignments)) {
            let tooltip = `${assigner} assigned <strong>${cases.length}</strong> majority opinions to ${assignee}`;
            if (cases.length > 5) {
                tooltip += ", including:<br>";
            } else {
                tooltip += ":<br>";
            }
            for (let i = 0; i < Math.min(cases.length, 5); i++) {
                tooltip += `&bullet; ${shortenCasename(cases[i], 29)}<br>`;
            }
            tooltip = tooltip.slice(0, -4); // remove last <br>
            links.push({
                source: `${assigner} `, 
                target: `${assignee}`, 
                value: cases.length, 
                tooltip: tooltip, 
                lineStyle: { color: window.darkMode ? '#fff' : '#314656' }
            });
        }
    }

    let subtitle = getAmongCaveatString();
    if (subtitle) {
        subtitle = subtitle.replace("among", "Among") + ".";
    } else {
        subtitle = "The most senior justice in the majority assigns the opinion.";
    }

    echartsContainer(
        element,
        {
            title: "Who assigns majority opinions to whom?",
            subtitle: subtitle,
            height: '500px',
            echartsOptions: {
                tooltip: {
                    trigger: 'item',
                    triggerOn: 'mousemove',
                    formatter: function (params) {
                        let data = params.data;
                        // check if data has depth
                        if (data.depth === undefined) {
                            // edge
                            return data.tooltip;
                        } else {
                            // node
                            if (data.depth == 0) {
                                return `${data.name} assigned <strong>${params.value}</strong> majority opinions`;
                            } else {
                                return `${data.name} was assigned <strong>${params.value}</strong> majority opinions`;
                            }
                        }
                    }
                },
                series: {
                    type: 'sankey',
                    layout: 'none',
                    draggable: false,
                    top: '0',
                    bottom: '5',
                    left: '70',
                    right: '70',
                    data: data,
                    links: links,
                },
                animation: false,
                grid: {
                    top: 10,
                    bottom: 10,
                    left: 0,
                    right: 0,
                    containLabel: true
                },
            }
        }
    );

    const footer = element.querySelector('.j1-chart-footer');

    footer.appendChild(getTermInfo());

    const embedLink = getEmbedLink(element, 'opinionDelayScatter');
    footer.appendChild(embedLink);
}
import { echartsContainer } from "../echarts.js";

export default function topicsTreeMapChart(element, hits) {
    let lvl0Encountered = {}; // value = index in data array
    let lvl1Encountered = {};

    let data = [];

    for (const hit of hits) {
        if (!hit.issue || !hit.issue.lvl0) continue;
        if (!hit.issue.lvl1) { throw new Error("lvl1 is undefined"); }

        let lvl0 = hit.issue.lvl0;
        let lvl1 = hit.issue.lvl1;
        lvl1 = lvl1.replace("judicial review of administrative agency's or administrative official's actions and procedures", "judicial review");
        lvl1 = lvl1.replace(" and related federal or state statutes or regulations", "");
        lvl1 = lvl1.replace(" of state legislation or regulation", "");
        lvl1 = lvl1.replace("federal and some state ", "");
        lvl1 = lvl1.replace("vis-a-vis congress or the states", "");
        lvl1 = lvl1.replace("federal or state regulation", "regulation");
        lvl1 = lvl1.replace("attorneys' and governmental employees' or officials' fees or compensation or licenses", "fees");
        lvl1 = lvl1.replace("federal pre-emption of state court jurisdiction", "state court jurisdiction");
        lvl1 = lvl1.replace("statutory construction of criminal laws", "statutory construction");

        if (!lvl0Encountered[lvl0]) {
            lvl0Encountered[lvl0] = data.length;
            data.push({
                name: lvl0,
                children: [],
                value: 0
            });
        }
        let lvl0Index = lvl0Encountered[lvl0];
        if (!lvl1Encountered[lvl1]) {
            lvl1Encountered[lvl1] = data[lvl0Index].children.length;
            data[lvl0Index].children.push({
                name: lvl1.split(" > ")[1].split(" (")[0].split(",")[0].split(":")[0].split(" - ")[0],
                value: 0
            });
        }
        let lvl1Index = lvl1Encountered[lvl1];
        data[lvl0Index].children[lvl1Index].value++;
        data[lvl0Index].value++;
    }

    echartsContainer(
        element,
        {
            title: "Issues in cases before the Supreme Court",
            subtitle: "Based on the <a href='http://www.supremecourtdatabase.org/documentation.php?var=issue'>coding by SCDB</a>.",
            height: `600px`,
            echartsOptions: {
                tooltip: { trigger: 'item' },
                series: [{
                    type: 'sunburst',
                    nodeClick: false, // no data drill down
                    data: data,
                    radius: [0, '75%'],
                    tooltip: {
                        formatter: '{b}: {c} cases'
                    },
                    // leafDepth: 1,
                    // label: {
                    //     show: true,
                    //     formatter: '{b}'
                    // },
                    // upperLabel: {
                    //     show: true,
                    //     height: 30
                    // }
                    levels: [
                        {},
                        {
                          r0: '15%',
                          r: '55%',
                          itemStyle: {
                            borderWidth: 2
                          },
                          label: {
                            // rotate: 'tangential'
                          }
                        },
                        {
                          r0: '55%',
                          r: '60%',
                          label: {
                            position: 'outside',
                            padding: 3,
                            silent: false,
                            fontSize: 9
                          },
                        }
                      ]
                }],
                grid: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10,
                    containLabel: true
                },
            }
        }
    );
}
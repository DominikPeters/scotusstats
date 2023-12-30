import { hitListItemTemplate } from './hitList.js';

const { algoliasearch, instantsearch } = window;

const searchClient = algoliasearch('9AG3F6OG4G', '5b008847329cee790612473c3d2a93a9');

const search = instantsearch({
    indexName: 'scotusstats',
    searchClient,
    initialUiState: {
        scotusstats: {
            refinementList: {
                term: ['2022', '2021', '2020'],
            },
        }
    }
});


search.addWidgets([
    instantsearch.widgets.searchBox({
        container: '#searchbox',
    }),
    instantsearch.widgets.hits({
        container: '#hits',
        templates: {
            item: hitListItemTemplate
        },
    }),
    instantsearch.widgets.configure({
        hitsPerPage: 200,
        attributesToRetrieve: [
            'term',
            'name',
            'docket_number',
            'decision',
            'flags',
            'issue',
            'legalProvision',
            'lowerCourt',
        ],
        attributesToHighlight: [],
    }),
    instantsearch.widgets.dynamicWidgets({
        container: '#dynamic-widgets',
        attributesToRender: ['term', 'lowerCourt', 'issue', 'legalProvision', 'flags', 'decision.majorityWriter', 'decision.majorityVoters'],
        widgets: [
            container =>
                instantsearch.widgets.panel({
                    templates: { header: () => 'Term' },
                })(instantsearch.widgets.refinementList)({
                    container,
                    attribute: 'term',
                    sortBy: ['name:desc'],
                }),
            container =>
                instantsearch.widgets.panel({
                    templates: { header: () => 'Lower Court' },
                })(instantsearch.widgets.refinementList)({
                    container,
                    attribute: 'lowerCourt',
                    showMore: true,
                }),
            container =>
                instantsearch.widgets.panel({
                    templates: { header: () => 'Issue' },
                })(instantsearch.widgets.hierarchicalMenu)({
                    container,
                    attributes: ['issue.lvl0', 'issue.lvl1', 'issue.lvl2'],
                    showMore: true,
                }),
            container =>
                instantsearch.widgets.panel({
                    templates: { header: () => 'Legal Provision' },
                })(instantsearch.widgets.hierarchicalMenu)({
                    container,
                    attributes: ['legalProvision.lvl0', 'legalProvision.lvl1', 'legalProvision.lvl2'],
                }),
            container =>
                instantsearch.widgets.panel({
                    templates: { header: () => 'Flags' },
                })(instantsearch.widgets.refinementList)({
                    container,
                    attribute: 'flags',
                }),
            container =>
                instantsearch.widgets.panel({
                    templates: { header: () => 'Decision' },
                })(instantsearch.widgets.refinementList)({
                    container,
                    attribute: 'decision.type',
                    sortBy: ['name:desc'],
                    limit: 15
                }),
            container =>
                instantsearch.widgets.panel({
                    templates: { header: () => 'Writer of Majority Opinion' },
                })(instantsearch.widgets.refinementList)({
                    container,
                    attribute: 'decision.majorityWriter',
                }),
            container =>
                instantsearch.widgets.panel({
                    templates: { header: () => 'Justices in majority' },
                })(instantsearch.widgets.refinementList)({
                    container,
                    attribute: 'decision.majorityVoters',
                    operator: 'and',
                }),
        ],
    }),
    instantsearch.widgets.currentRefinements({
        container: '#applied-filters',
    }),
    instantsearch.widgets.pagination({
        container: '#pagination',
    }),
]);

search.start();

function justiceName(longName) {
    // delete ", Jr." and ", Sr." from names, then split on spaces and return last name
    return longName.replace(/, (Jr\.|Sr\.)/, '').split(' ').pop();
}


const myLabelLayout = function (params) {
    if (params.labelRect.width > params.rect.width - 5) {
        return { x: params.labelRect.x + params.rect.width, y: params.labelRect.y };
    }
}

const hideLabelLayout = function (params) {
    if (params.labelRect.width > params.rect.width - 2) {
        return { fontSize: 0 };
    }
    if (params.labelRect.width > params.rect.width - 8) {
        return { dx: (params.rect.width - params.labelRect.width - 8) / 2 };
    }
}

var myChart = echarts.init(document.getElementById('mychart'), null, { renderer: 'svg' });

var option = {
    tooltip: {},
    yAxis: {
        show: true,
        type: 'category',
        data: [],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
            align: 'left',
            color: '#000',
            fontSize: 14,
            formatter: function (value) {
                return `{value|${justiceName(value)}}`;
            },
            rich: {
                value: {
                    lineHeight: 14,
                },
            }
        },
        offset: 140
    },
    xAxis: { show: false },
    grid: {
        left: 150,
        // left: 0,
        top: 0,
        // bottom: 100,
    },
    textStyle: { fontFamily: 'Roboto', fontSize: 14 },
    animation: true,
    series: [
        {
            name: '% in majority',
            type: 'bar',
            data: [],
            barCategoryGap: '10%',
            barWidth: 53,
            label: {
                show: true,
                position: 'insideLeft',
                distance: -80,
                // show exactly 1 decimal place, and add % sign
                // formatter: v=>v.data + '%',
                formatter: function (value) {
                    if (value.data < 0) {
                        return `{${justiceName(value.name)}| } {blackValue|${value.data}}%`
                    } else {
                        return `{${justiceName(value.name)}| }   {value|${value.data}}%`
                    }
                },
                rich: {
                    lineHeight: 20,
                    value: {
                        lineHeight: 14,
                        fontSize: 20
                    },
                    blackValue: {
                        lineHeight: 14,
                        fontSize: 20,
                        color: '#000',
                        padding: [0, 0, 0, 20]
                    },
                }
            },
            // labelLayout: myLabelLayout
        }
    ]
};
for (const justice of ['Scalia', 'Thomas', 'Alito', 'Roberts', 'Gorsuch', 'Kavanaugh', 'Barrett', 'Ginsburg', 'Breyer', 'Sotomayor', 'Kagan', 'Jackson']) {
    const richStyle = {
        lineHeight: 20,
        width: 80,
        height: 60,
        backgroundColor: {
            image: `/img/justices/${justice}.png`
        }
    };
    option.series[0].label.rich[justice] = richStyle;
    option.yAxis.axisLabel.rich[justice] = richStyle;
}
myChart.setOption(option);


window.addEventListener('resize', function () {
    myChart.resize();
});


///////////// Vertical bar chart for justices in majority //////////////
var verticalChart = echarts.init(document.getElementById('verticalChart'), null, { renderer: 'svg' });

var option = {
    tooltip: {},
    xAxis: {
        show: false,
        type: 'category',
        data: [],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
            align: 'center',
            color: '#000',
            fontSize: 10,
            rich: {}
        },
        // offset: 200
    },
    yAxis: { show: false },
    // grid: {
    //     // left: 210,
    //     left: 0,
    //     top: 0,
    //     // bottom: 100,
    // },
    textStyle: { fontFamily: 'Roboto', fontSize: 14 },
    animation: true,
    series: [
        {
            name: '% in majority',
            type: 'bar',
            data: [],
            // barCategoryGap: '10%',
            // barWidth: 53,
            label: {
                show: true,
                position: 'insideBottom',
                align: 'center',
                distance: -1,
                // // show exactly 1 decimal place, and add % sign
                // // formatter: v=>v.data + '%',
                formatter: function (value) {
                    return `{${justiceName(value.name)}| }\n\n{value|${value.data}}%`
                },
                rich: {
                    lineHeight: 20,
                    value: {
                        lineHeight: 14,
                        fontSize: 12
                    },
                }
            },
            // labelLayout: myLabelLayout
        }
    ]
};
for (const justice of ['Scalia', 'Thomas', 'Alito', 'Roberts', 'Gorsuch', 'Kavanaugh', 'Barrett', 'Ginsburg', 'Breyer', 'Sotomayor', 'Kagan', 'Jackson']) {
    const richStyle = {
        lineHeight: 20,
        width: 70,
        height: 70,
        backgroundColor: {
            image: `/img/justices/${justice}.png`
        }
    };
    option.series[0].label.rich[justice] = richStyle;
    option.xAxis.axisLabel.rich[justice] = richStyle;
}
verticalChart.setOption(option);


window.addEventListener('resize', function () {
    verticalChart.resize();
});




search.on('render', () => {
    // try {
    //   let hits = search.helper.lastResults.hits;
    // } catch (e) {
    //   console.error(e);
    //   return;
    // }
    let hits, facets;
    try {
        hits = search.renderState.scotusstats.hits.hits;
        facets = search.renderState.scotusstats.hits.results.facets;
    } catch (e) {
        // no results currently
        return;
    }
    let caseCount = hits.length;
    let majorityVoterFacet = facets.find(facet => facet.name === 'decision.majorityVoters');
    let voters = [];
    let voterPercent = [];
    if (majorityVoterFacet) {
        myChart.resize();
        for (const [voter, count] of Object.entries(majorityVoterFacet.data)) {
            voters.push(voter);
            voterPercent.push((count / caseCount * 100).toFixed(1));
        }

        const chartHeight = (voters.length * 60) + 'px';
        document.getElementById('mychart').style.height = chartHeight;

        const newOptions = {
            grid: {
                height: chartHeight,
            },
            yAxis: {
                data: voters,
            },
            series: [
                {
                    data: voterPercent,
                },
            ],
        }
        myChart.setOption(newOptions);

        // update vertical chart
        const newVerticalOptions = {
            xAxis: {
                data: voters,
            },
            series: [
                {
                    data: voterPercent,
                },
            ],
        }
        verticalChart.setOption(newVerticalOptions);
    }
});
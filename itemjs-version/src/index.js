import { createIndex, getSearchClient } from "instantsearch-itemsjs-adapter";
import instantsearch from 'instantsearch.js';
import { searchBox, hits, pagination, configure, panel, refinementList, hierarchicalMenu, currentRefinements } from 'instantsearch.js/es/widgets';
import { hitListItemTemplate } from './hitList.js';
import { buildCharts } from './buildCharts.js';
import { unflattenHits, justiceName } from './utils.js';

const options = {
    // searchableFields: ["name"], // not doing search
    query: "",
    aggregations: {
        term: {
            title: "Term",
            size: 10,
            conjunction: false
        },
        lowerCourt: {
            title: "Lower Court",
            size: 10,
            conjunction: false
        },
        "issue.lvl0": {
            title: "Issue",
            size: 10
        },
        "issue.lvl1": {
            title: "issue.lvl1",
            size: 10
        },
        "issue.lvl2": {
            title: "issue.lvl2",
            size: 10
        },
        "legalProvision.lvl0": {
            title: "Legal Provision",
            size: 10
        },
        "legalProvision.lvl1": {
            title: "legalProvision.lvl1",
            size: 10
        },
        "legalProvision.lvl2": {
            title: "legalProvision.lvl2",
            size: 10
        },
        flags: {
            title: "Flags",
            size: 10,
        },
        "decision.type": {
            title: "Decision",
            size: 10,
            conjunction: false
        },
        "decision.majorityWriter": {
            title: "Majority writer",
            size: 10,
            conjunction: false
        },
        "decision.majorityVoters": {
            title: "In majority",
            size: 10
        },
        "decision.minorityVoters": {
            title: "In minority",
            size: 10
        }
    },
    sortings: {
        term_asc: {
            field: "term",
            order: "asc"
        },
        name_asc: {
            field: "name",
            order: "asc"
        }
    }
};

fetch("/data/flattened_records.json")
    .then(response => response.json())
    .then(data => {
        buildSearch(data);
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });

let search;

function buildSearch(data) {
    setUpMobileMenu();
    // console.log(data);

    const index = createIndex(data, options);
    const searchClient = getSearchClient(index);

    search = instantsearch({
        indexName: 'scotusstats',
        searchClient,
        initialUiState: {
            scotusstats: {
                refinementList: {
                    term: ['2022', '2021', '2020', '2019'],
                },
            }
        },
        future: {
            preserveSharedStateOnUnmount: true,
        },
    });

    search.addWidgets([
        // searchBox({
        //   container: '#searchbox',
        // }),
        hits({
            container: '#hits',
            templates: {
                item: hitListItemTemplate
            },
        }),
        configure({
            hitsPerPage: 10000,
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
        panel({
            templates: { header: () => 'Term' },
        })(refinementList)({
            container: '#term-refinement',
            attribute: 'term',
            sortBy: ['name:desc'],
        }),
        panel({
            templates: { header: () => 'Lower Court' },
        })(refinementList)({
            container: '#lowerCourt-refinement',
            attribute: 'lowerCourt',
            showMore: true,
        }),
        panel({
            templates: { header: () => 'Issue' },
        })(hierarchicalMenu)({
            container: '#issue-refinement',
            attributes: ['issue.lvl0', 'issue.lvl1', 'issue.lvl2'],
            showMore: true,
        }),
        panel({
            templates: { header: () => 'Legal Provision' },
        })(hierarchicalMenu)({
            container: '#legalProvision-refinement',
            attributes: ['legalProvision.lvl0', 'legalProvision.lvl1', 'legalProvision.lvl2'],
        }),
        panel({
            templates: { header: () => 'Features' },
        })(refinementList)({
            container: '#flags-refinement',
            attribute: 'flags',
            // rename values "declaration-unconstitutional", "precedent-alteration"
            // to "declaration of unconstitutionality", "alteration of precedent"
            transformItems(items) {
                for (const item of items) {
                    if (item.value === "declaration-unconstitutional") {
                        item.highlighted = "found unconstitutional";
                    } else if (item.value === "precedent-alteration") {
                        item.highlighted = "alteration of precedent";
                    }
                }
                return items;
            }
        }),
        panel({
            templates: { header: () => 'Decision' },
        })(refinementList)({
            container: '#decision-refinement',
            attribute: 'decision.type',
            sortBy: ['name:desc'],
            limit: 15
        }),
        panel({
            templates: { header: () => 'Writer of Majority Opinion' },
        })(refinementList)({
            container: '#majorityWriter-refinement',
            attribute: 'decision.majorityWriter',
        }),
        panel({
            templates: { header: () => 'Justices in majority' },
        })(refinementList)({
            container: '#majorityVoters-refinement',
            attribute: 'decision.majorityVoters',
            operator: 'and',
        }),
        currentRefinements({
            container: '#applied-filters',
            transformItems(items) {
                for (const item of items) {
                    item.label = options.aggregations[item.attribute].title;
                    if (item.attribute == "flags") {
                        for (const ref of item.refinements) {
                            if (ref.value === "declaration-unconstitutional") {
                                ref.label = "found unconstitutional";
                            } else if (ref.value === "precedent-alteration") {
                                ref.label = "alteration of precedent";
                            }
                        }
                    }
                    // replace justice long with short names
                    if (["decision.majorityVoters", "decision.minorityVoters", "decision.majorityWriter"].includes(item.attribute)) {
                        for (const ref of item.refinements) {
                            ref.label = justiceName(ref.value);
                        }
                    }
                }
                return items;
            }
        }),
        // pagination({
        //   container: '#pagination',
        // }),
    ]);

    search.start();
    window.search = search;

    // add event listeners
    search.on('render', updateDisplays);
}

let renderedHits = "";

function getRefinements() {
    const filter = search.renderState.scotusstats.currentRefinements.items;
    const refinements = {};
    for (const item of filter) {
        refinements[item.attribute] = item.refinements.map(ref => ref.value);
    }
    console.log(refinements);
}

function updateDisplays(forceUpdate = false) {
    getRefinements();
    const mobileMenuOpen = document.querySelector(".search-panel").classList.contains("show-menu");
    if (mobileMenuOpen) {
        return; // can't see charts
    }
    let flatHits, hits;
    try {
        flatHits = search.renderState.scotusstats.hits.hits;
    } catch (e) {
        // no results currently
        console.error(e);
        return;
    }
    if (search.renderState.scotusstats.hits.results === undefined) {
        return;
    }
    const hitString = JSON.stringify(flatHits.map(hit => hit.objectID));
    if (hitString === renderedHits && !forceUpdate) {
        return; // avoid re-rendering
    }
    hits = unflattenHits(flatHits);
    buildCharts(hits);
    renderedHits = hitString;
    buildSideTOC();
}


function setUpMobileMenu() {
    const searchPanel = document.querySelector(".search-panel");
    function toggleMenu() {
        console.log("toggle menu");
        if (searchPanel.classList.contains("show-menu")) {
            searchPanel.classList.remove("show-menu");
            // await render, then update displays
            setTimeout(() => updateDisplays(true), 1);
        } else {
            searchPanel.classList.add("show-menu");
        }
    }
    const hamburger = document.getElementById("hamburger-button");
    const closeMenuButton = document.getElementById("close-menu-button");
    hamburger.onclick = toggleMenu;
    closeMenuButton.onclick = toggleMenu;
}

function updateTOC() {
    var current = "about";

    document.querySelectorAll(".j1-chart-container").forEach((section) => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 150) {
            current = section.getAttribute("id");
        }
    });

    document.querySelectorAll(".sidetoc-item-chart").forEach((li) => {
        li.classList.remove("active");
        if (current === li.getAttribute("id").replace("sidetoc-item-chart-", "")) {
            li.classList.add("active");
            // li.scrollIntoView({ block: "nearest" }); // only needed if toc does not fit into screen
        }
    });
}

function buildSideTOC() {
    const sidetoc = document.getElementById("sidetoc");
    sidetoc.innerHTML = "";

    const sectionUl = document.createElement("ul");
    sidetoc.appendChild(sectionUl);

    const resultsContainer = document.querySelector(".search-panel__results");


    for (const section of resultsContainer.querySelectorAll("section")) {
        const li = document.createElement("li");
        li.className = "sidetoc-item-section";
        li.id = "sidetoc-item-section-" + section.id;
        const a = document.createElement("a");
        a.href = "#" + section.id;
        a.textContent = section.querySelector("h2").textContent;
        li.appendChild(a);
        sectionUl.appendChild(li);
        const chartUl = document.createElement("ul");
        li.appendChild(chartUl);
        for (const chart of section.querySelectorAll(".j1-chart-container")) {
            const titleObject = chart.querySelector(".j1-chart-title");
            if (!titleObject) continue;
            const title = titleObject.textContent;
            const chartLi = document.createElement("li");
            chartLi.className = "sidetoc-item-chart";
            chartLi.id = "sidetoc-item-chart-" + chart.id;
            const chartA = document.createElement("a");
            chartA.href = "#" + chart.id;
            chartA.textContent = title;
            chartLi.appendChild(chartA);
            chartUl.appendChild(chartLi);
        }
    }

    window.addEventListener("scroll", updateTOC);
}
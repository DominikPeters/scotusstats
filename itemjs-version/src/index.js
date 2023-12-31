import { createIndex, getSearchClient } from "instantsearch-itemsjs-adapter";
import instantsearch from 'instantsearch.js';
import { searchBox, hits, pagination, configure, panel, refinementList, hierarchicalMenu, currentRefinements } from 'instantsearch.js/es/widgets';
import { hitListItemTemplate } from './hitList.js';
import { buildCharts } from './buildCharts.js';
import { unflattenHits } from './utils.js';

const options = {
  searchableFields: ["name"],
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
      size: 10
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
      title: "decision.majorityVoters",
      size: 10
    },
    "decision.minorityVoters": {
      title: "decision.minorityVoters",
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
      templates: { header: () => 'Flags' },
    })(refinementList)({
      container: '#flags-refinement',
      attribute: 'flags',
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

function updateDisplays() {
  let flatHits, hits;
  try {
    flatHits = search.renderState.scotusstats.hits.hits;
    // facets = search.renderState.scotusstats.hits.results.facets;
  } catch (e) {
    // no results currently
    console.error(e);
    return;
  }
  hits = unflattenHits(flatHits);
  buildCharts(hits);
}

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
    instantsearch.widgets.panel({
        templates: { header: () => 'Term' },
    })(instantsearch.widgets.refinementList)({
        container: '#term-refinement',
        attribute: 'term',
        sortBy: ['name:desc'],
    }),
    instantsearch.widgets.panel({
        templates: { header: () => 'Lower Court' },
    })(instantsearch.widgets.refinementList)({
        container: '#lowerCourt-refinement',
        attribute: 'lowerCourt',
        showMore: true,
    }),
    instantsearch.widgets.panel({
        templates: { header: () => 'Issue' },
    })(instantsearch.widgets.hierarchicalMenu)({
        container: '#issue-refinement',
        attributes: ['issue.lvl0', 'issue.lvl1', 'issue.lvl2'],
        showMore: true,
    }),
    instantsearch.widgets.panel({
        templates: { header: () => 'Legal Provision' },
    })(instantsearch.widgets.hierarchicalMenu)({
        container: '#legalProvision-refinement',
        attributes: ['legalProvision.lvl0', 'legalProvision.lvl1', 'legalProvision.lvl2'],
    }),
    instantsearch.widgets.panel({
        templates: { header: () => 'Flags' },
    })(instantsearch.widgets.refinementList)({
        container: '#flags-refinement',
        attribute: 'flags',
    }),
    instantsearch.widgets.panel({
        templates: { header: () => 'Decision' },
    })(instantsearch.widgets.refinementList)({
        container: '#decision-refinement',
        attribute: 'decision.type',
        sortBy: ['name:desc'],
        limit: 15
    }),
    instantsearch.widgets.panel({
        templates: { header: () => 'Writer of Majority Opinion' },
    })(instantsearch.widgets.refinementList)({
        container: '#majorityWriter-refinement',
        attribute: 'decision.majorityWriter',
    }),
    instantsearch.widgets.panel({
        templates: { header: () => 'Justices in majority' },
    })(instantsearch.widgets.refinementList)({
        container: '#majorityVoters-refinement',
        attribute: 'decision.majorityVoters',
        operator: 'and',
    }),
    instantsearch.widgets.currentRefinements({
        container: '#applied-filters',
    }),
    instantsearch.widgets.pagination({
        container: '#pagination',
    }),
]);

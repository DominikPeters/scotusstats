
const options = {
    searchableFields: ["name"],
    query: "",
    aggregations: {
        term: {
            title: "term",
            size: 10
        },
        lowerCourt: {
            title: "lowerCourt",
            size: 10
        },
        "issue.lvl0": {
            title: "issue.lvl0",
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
            title: "legalProvision.lvl0",
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
            title: "flags",
            size: 10
        },
        "decision.type": {
            title: "decision.type",
            size: 10
        },
        "decision.majorityWriter": {
            title: "decision.majorityWriter",
            size: 10
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

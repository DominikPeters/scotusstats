<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="theme-color" content="#000000">

  <link rel="shortcut icon" href="../favicon.png">

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/instantsearch.css@8.1.0/themes/satellite-min.css">
  <link rel="stylesheet" href="../styles/j1-chart.css">

  <title>scotusstats chart</title>
</head>

<body>
<div id="chart"></div>
<script type="module">
import frequencyInMajorityChart from './charts/voting/frequencyInMajority.js';
// import frequencyInMajorityOverTimeChart from './charts/voting/frequencyInMajorityOverTime.js';
// import agreementPairsChart from './charts/voting/agreementPairs.js';
// import agreementTriplesChart from './charts/voting/agreementTriples.js';

import fractionWordsChart from './charts/argument/fractionWords.js';

import { unflattenHits } from './utils.js';
// import wordsSpokenOverTimeChart from './charts/argument/wordsSpokenOverTime.js';
// import argumentLengthScatterChart from './charts/argument/argumentLengthScatter.js';
// import advocateTimeChart from './charts/argument/advocateTime.js';

// import numberMajorityOpinionsWrittenChart from './charts/opinions/numberMajorityOpinionsWritten.js';
// import opinionDelayScatterChart from './charts/opinions/opinionDelayScatter.js';

// import numberCasesDecidedChart from './charts/cases/numberCasesDecided.js';
// import topicsTreeMapChart from './charts/cases/topicsTreeMap.js';
<?php

// get the filter filename from GET parameter, ensuring it's only alphanumeric, 0-9, -, and _
if (!isset($_GET['filter']) || !preg_match('/^[a-zA-Z0-9-_]+$/', $_GET['filter'])) {
    die('console.error("Invalid filter filename.");</script></body></html>');
}

// Sanitize the filter filename from GET parameter
$filter_filename = 'filters/' . preg_replace('/[^a-zA-Z0-9-_]/', '', $_GET['filter']) . '.json';


if (!file_exists($filter_filename) || !is_readable($filter_filename)) {
    die('console.error("Filter file ' . $filter_filename . ' not found or not readable.");</script></body></html>');
}

// Load records from JSON file
$records = json_decode(file_get_contents('records.json'), true);

// Load filter configuration from the sanitized filename
$embed_object = json_decode(file_get_contents($filter_filename), true);
$filter_config = $embed_object['filter'];

// Define the filtering functions similar to Python version
function matchFacet($record, $attribute, $values) {
    $record_value = $record[$attribute] ?? [];
    if (!is_array($record_value)) {
        $record_value = [$record_value];
    }
    return count(array_intersect($record_value, $values)) > 0;
}

function matchDisjunctive($record, $attribute, $values) {
    return in_array($record[$attribute] ?? null, $values);
}

function matchHierarchical($record, $attribute, $values) {
    $record_value = $record[$attribute] ?? '';
    foreach ($values as $value) {
        if (strpos($record_value, $value) !== false) {
            return true;
        }
    }
    return false;
}

function adjustAttributeForHierarchical($attribute, $value) {
    if (strpos($value, ' > ') !== false) {
        $parts = explode('.', $attribute);
        if (end($parts) == 'lvl0') {
            $parts[count($parts) - 1] = 'lvl1';
            return implode('.', $parts);
        }
    }
    return $attribute;
}

// Function to filter records
function filterRecords($records, $filter_config) {
    $filtered_records = [];
    foreach ($records as $record) {
        $include_record = true;
        foreach ($filter_config as $filter_item) {
            $attribute = $filter_item['attribute'];
            $refinements = $filter_item['refinements'];
            $values = array_map(function($refinement) { return $refinement['value']; }, $refinements);

            $attribute = adjustAttributeForHierarchical($attribute, $values[0]);

            if (isset($filter_item['type']) && $filter_item['type'] == 'disjunctive') {
                if (matchDisjunctive($record, $attribute, $values)) {
                    continue;
                } else {
                    $include_record = false;
                    break;
                }
            } elseif (isset($filter_item['type']) && $filter_item['type'] == 'hierarchical') {
                if (matchHierarchical($record, $attribute, $values)) {
                    continue;
                } else {
                    $include_record = false;
                    break;
                }
            } else {
                if (!matchFacet($record, $attribute, $values)) {
                    $include_record = false;
                    break;
                }
            }
        }
        if ($include_record) {
            $filtered_records[] = $record;
        }
    }
    return $filtered_records;
}

// Apply the filter configuration to the records
$filtered_records = filterRecords($records, $filter_config);

// Output the filtered records as a JavaScript variable
echo "const hits = unflattenHits(" . json_encode($filtered_records) . ");\n";
?>
console.log(hits);

function buildChart(chartFunction, chartId, chartsContainer, hits) {
    const chartContainer = document.createElement('div');
    chartContainer.id = chartId;
    chartContainer.className = "j1-chart-container";
    chartsContainer.appendChild(chartContainer);
    chartFunction(chartContainer, hits);
}

const chartsContainer = document.getElementById('chart');
buildChart(fractionWordsChart, 'frequency-in-majority-chart', chartsContainer, hits);
</script>
</body>
</html>
<?php
// if GET parameter 'embed' is set (to 1), we are in embed mode
$embed_mode = false;
if (isset($_GET['embed']) && $_GET['embed'] == 1) {
    $embed_mode = true;
}

// get the filter filename from GET parameter, ensuring it's only alphanumeric, 0-9, -, and _
if (!isset($_GET['filter']) || !preg_match('/^[a-zA-Z0-9-_]+$/', $_GET['filter'])) {
    die("Invalid filter filename.");
}

// Sanitize the filter filename from GET parameter
$filter_filename = 'filters/' . preg_replace('/[^a-zA-Z0-9-_]/', '', $_GET['filter']) . '.json';

if (!file_exists($filter_filename) || !is_readable($filter_filename)) {
    die("Filter file ' . $filter_filename . ' not found or not readable.");
}

// Load filter configuration from the sanitized filename
$embed_object = json_decode(file_get_contents($filter_filename), true);
$filter_config = $embed_object['filter'];
$chart_type = $embed_object['chartType'];
$chart_title = $embed_object['chartTitle'];
$chart_subtitle = $embed_object['chartSubtitle'];


function findAndLoadFile($fileName) {
    $folders = ['voting', 'cases', 'argument', 'opinions'];
    foreach ($folders as $folder) {
        if ($embed_mode) {
            $filePath = '../charts/' . $folder . '/' . $fileName;
        } else {
            $filePath = 'charts/' . $folder . '/' . $fileName;
        }
        if (file_exists($filePath)) {
            return file_get_contents($filePath);
        }
    }
    die("Chart definition not found.");
}

// Load the chart definition from the chart type
$chart_definition = findAndLoadFile($chart_type . '.js');
if (!$embed_mode) {
    $chart_definition = str_replace("'./_disOrAgreementPairs.js'", "'./charts/voting/_disOrAgreementPairs.js'", $chart_definition);
    $chart_definition = str_replace("from '../../", "from './", $chart_definition);
    $chart_definition = str_replace('from "../../', 'from "./', $chart_definition);
    $chart_definition = str_replace("from '../", "from './charts/", $chart_definition);
    $chart_definition = str_replace('from "../', 'from "./charts/', $chart_definition);
} else {
    $chart_definition = str_replace("'./_disOrAgreementPairs.js'", "'../voting/_disOrAgreementPairs.js'", $chart_definition);
    $chart_definition = str_replace("from './", "from '../", $chart_definition);
    $chart_definition = str_replace('from "./', 'from "../', $chart_definition);
    $chart_definition = str_replace("from '../../", "from '../", $chart_definition);
    $chart_definition = str_replace('from "../../', 'from "../', $chart_definition);
    $chart_definition = str_replace("from '../", "from '../charts/", $chart_definition);
    $chart_definition = str_replace('from "../', 'from "../charts/', $chart_definition);
}
$chart_definition = str_replace("export default", "", $chart_definition);

$echarts_used = strpos($chart_definition, 'echarts') !== false;

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" conte  nt="#000000"> 
    <link rel="shortcut icon" href="../favicon.png">    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/instantsearch.css@8.1.0/themes/satellite-min.css">
    <!-- og title and description -->
    <meta property="og:title" content="<?php echo $chart_title; ?>">
    <meta property="og:description" content="<?php echo $chart_subtitle; ?>">
    <meta property="og:site_name" content="scotusstats.com">
    <meta property="og:type" content="website">
    <!-- twitter title and description -->
    <meta name="twitter:title" content="<?php echo $chart_title; ?>">
    <meta name="twitter:description" content="<?php echo $chart_subtitle; ?>">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:site" content="@scotusstats">
    <meta name="twitter:creator" content="@scotusstats">
    <!-- title -->
    <title><?php echo $chart_title; ?> | scotusstats.com</title>
    <!-- description -->
    <meta name="description" content="<?php echo $chart_subtitle; ?>">
<?php
if ($embed_mode) {
    if ($echarts_used) {
        echo '    <script src="../charts/echarts.min.js"></script>\n';
    }
?>
    <link rel="stylesheet" href="../../styles/j1-chart.css">   
    <style> 
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
                Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        }

        .j1-chart-container {
            border: 0;
            padding: 0;
        }
    </style>
<?php
} else {
    if ($echarts_used) {
        echo '    <script src="charts/echarts.min.js"></script>\n';
    }
?>
    <link rel="stylesheet" href="../styles/j1-chart.css">   
    <style> 
        body {
            margin: 0;
            padding: 10px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
                Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        }

        #chart {
            max-width: 800px;
            margin: 0 auto;
        }
    </style>
<?php
}
?>
    <title>scotusstats chart</title>
</head>

<body>
<div id="chart"></div>
<script type="module">
<?php

if ($embed_mode) {
    echo "import { unflattenHits } from '../utils.js';\n";
} else {
    echo "import { unflattenHits } from './utils.js';\n";
}

// put filters so they are at search.renderState.scotusstats.currentRefinements.items
echo "window.search = { renderState: { scotusstats: { currentRefinements: { items: " . json_encode($filter_config) . " } } } };\n";

echo $chart_definition;
echo "\n\n";

// Load records from JSON file
$records = json_decode(file_get_contents('records.json'), true);

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

function buildChart(chartFunction, chartId, chartsContainer, hits) {
    const chartContainer = document.createElement('div');
    chartContainer.id = chartId;
    chartContainer.className = "j1-chart-container";
    chartsContainer.appendChild(chartContainer);
    chartFunction(chartContainer, hits);
}

window.hits = hits;
window.buildChart = buildChart;
window.<?php echo $chart_type; ?>Chart = <?php echo $chart_type; ?>Chart;

const chartsContainer = document.getElementById('chart');
buildChart(<?php echo $chart_type; ?>Chart, 'chart', chartsContainer, hits);
</script>
</body>
</html>
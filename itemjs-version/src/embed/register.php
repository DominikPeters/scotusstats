<?php

function customHash($input) {
    // Step 1: Hash the input using SHA-256
    $hash = hash('sha256', $input, true);

    // Step 2: Convert binary hash to base64 (to use the full alphabet and special characters)
    $base64Hash = base64_encode($hash);

    // Step 3: Replace '+' and '/' from base64 to '-' and '_' respectively
    $modifiedBase64 = strtr($base64Hash, '+/', '-_');

    // Step 4: Truncate the string to 10 characters
    $shortenedHash = substr($modifiedBase64, 0, 10);

    return $shortenedHash;
}

// Function to validate the JSON structure
function isValidJson($data) {
    if (!is_array($data)) {
        return false;
    }

    foreach ($data as $key => $value) {
        if (!in_array($key, ['chartType', 'filters']) || 
            ($key === 'chartType' && !is_string($value)) || 
            ($key === 'filters' && !is_array($value))) {
            return false;
        }

        if (is_string($value) && strlen($value) > 300) {
            return false;
        }

        if (is_array($value)) {
            foreach ($value as $item) {
                if (!isValidFilter($item)) {
                    return false;
                }
            }
        }
    }

    return true;
}

// Function to validate each filter
function isValidFilter($filter) {
    $validKeys = ['indexName', 'indexId', 'attribute', 'label', 'refinements'];
    foreach ($filter as $key => $value) {
        if (!in_array($key, $validKeys) || 
            (is_string($value) && strlen($value) > 300)) {
            return false;
        }

        if ($key === 'refinements' && is_array($value)) {
            foreach ($value as $refinement) {
                if (!isValidRefinement($refinement)) {
                    return false;
                }
            }
        }
    }

    return true;
}

// Function to validate each refinement
function isValidRefinement($refinement) {
    $validKeys = ['attribute', 'type', 'value', 'label', 'count'];
    foreach ($refinement as $key => $value) {
        if (!in_array($key, $validKeys) || 
            (is_string($value) && strlen($value) > 300)) {
            return false;
        }
    }

    return true;
}

// Check if the 'filter' field is present in the POST request
if (isset($_POST['filter'])) {
    $filter = json_decode($_POST['filter'], true);

    if ($filter === null) {
        echo json_encode(["result" => "error", "message" => "JSON could not be decoded"]);
        exit;
    }

    // Validate the JSON structure
    // if (!$isValidJson($filter)) {
    //     echo json_encode(["result" => "error", "message" => "Invalid JSON structure"]);
    //     exit;
    // }

    // Proceed with processing...
    $id = customHash($_POST['filter']);
    $filename = "filters/{$id}.json";
    file_put_contents($filename, json_encode($filter));
    echo json_encode(["result" => "success", "id" => $id]);
} else {
    echo json_encode(["result" => "error", "message" => "No filter provided"]);
}
?>

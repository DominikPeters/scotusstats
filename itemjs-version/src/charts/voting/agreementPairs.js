import disOrAgreementPairsChart from './_disOrAgreementPairs.js';

export default function agreementPairsChart(element, hits) {
    return disOrAgreementPairsChart(true)(element, hits);
}
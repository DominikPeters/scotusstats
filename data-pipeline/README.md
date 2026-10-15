# Data pipeline

Run scripts from this directory using Python 3. Install `requests` and `beautifulsoup4` for Court/Oyez fetching. SCDB import/export uses the standard library.

## Court downloads and historical misses

`count_amicus_briefs.py` and `opinion_xml.py` support:

- `--term 2025` (repeatable): select terms; default is all local term directories.
- `--refresh`: redownload successful cached documents.
- `--refresh-missing`: retry historical cached misses as well.

The versioned `docket404.list.txt` and `xml404.list.txt` retain confirmed missing documents, one docket per line. Historical entries are skipped by default. Current-term misses retry at most once per day; ignored `.retry.json` sidecars record the latest check. HTTP 403, 429, 5xx and network failures never become permanent misses. Both current and old docket URLs must be missing before a docket is added. Existing downloaded documents remain usable even when their docket also appears in an old miss list.

The historical concatenated docket list was reconstructed against known local docket filenames and merged with the newer entries, without dropping any recovered identifiers.

## SCDB

The importers use the versioned `SCDB_2025_01` case-centered and justice-centered CSV snapshots. `read_scdb.py` adds topic/legal-provision coding; `scdb-decisions.py` groups justice rows by term and docket. These scripts modify local `../data` records; they do not deploy the website. Review generated records before exporting, particularly cases with multiple decisions.

Run offline checks with `python -m unittest discover -p "test_*.py" -v`.

The obsolete holding/GPT experiments were removed; current opinion interpretation uses the cloud workflow below.

## Automated statistics

`stats_core.py` computes statistics from the shared `/podcast/alignment/index.json` exports, distinguishes speaking turns from time at the lectern, and replaces recording revisions without double counting. Separate hearings are retained by recording ID and aggregated for the existing case-level charts.

The cloud `scotus_cloud.statistics_worker` stores versioned canonical records and evidence privately in Cloud Storage. A small gzip seed initializes it from the isolated SCDB backfill. Existing SCDB topics are preserved. Official opinion listing rows are checked daily; changed entries and uncoded recent cases enter bounded Codex batches. Official docket/opinion downloads are archived by content hash. Codex receives relevant syllabus/authorship passages and the existing taxonomies; ambiguous fields become dashboard questions.

The PHP worker endpoint publishes only `data/flattened_records.json` and `data/status.json`, atomically, retaining the previous dataset privately. It never mirrors or deletes the shared webroot. Progress, publication timestamps, pending work and async answers appear in the dashboard's Statistics section. Controller ticks launch a job on a changed alignment index, a daily check, an owner request, or unfinished backfill. The site defaults to the latest available term.

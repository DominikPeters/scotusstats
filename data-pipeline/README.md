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

The staged holding/GPT experiments remain separate from this supported maintenance path.

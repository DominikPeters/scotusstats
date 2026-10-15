# Argument search / web player

`index.html` searches the published `cases.json` catalog. The catalog is versioned so a clean checkout builds a usable search page; raw `source_jsons/*.json` downloads remain ignored. Regenerate it with `python make_into_one_json.py` after updating the term-list responses in `source_jsons/`.

Case links have the form `/web/{term}/{docket}/{slug}`. On the existing Apache host, the root rewrite rule is:

```apache
RewriteEngine On
RewriteRule ^web/([0-9]+)(/.*)?$ /player/player.html?case=$1 [L,QSA]
```

The player reads the original browser path to resolve the term and docket. Its `player.html`, `player.js`, portraits and supporting assets are maintained separately in `DominikPeters/scotus-videos` and deployed under `/player/`. They must already be present; the scotusstats webpack build does not create or replace them. Preserve this root rewrite rule during deployment.

The catalog currently covers arguments through January 22, 2025. It is a historical snapshot, not yet connected to the new cloud update pipeline. MiniSearch is loaded from the versioned CDN URL in `index.html`.

The search page merges this historical catalog with `/podcast/alignment/index.json` at load time. New aligned recordings appear automatically, with an explicit `recording` query parameter so multiple hearings remain distinguishable. The player prefers this shared Court alignment and falls back to Oyez when none exists.

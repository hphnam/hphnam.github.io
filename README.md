# Nam Hoang — GitHub Pages upload package

Latest fixed portfolio, exported 14 October 2026.

## Update hphnam.github.io

1. Extract this ZIP. `index.html`, `assets` and `media` sit directly at its root.
2. Open your `hphnam.github.io` checkout in GitHub Desktop and use **Show in Finder** / **Show in Explorer**.
3. Replace the existing `index.html`, `assets` and `media` with the copies from this package. Copy the other package files too. Preserve your existing `.git` folder, `.github` workflows and any `CNAME` file.
4. Review the changes in GitHub Desktop, commit and push to the branch your existing Pages workflow publishes (currently `main`).
5. Wait for the existing GitHub Pages deployment to finish. Open `https://hphnam.github.io/?v=20261014-fixed#/` to load the new page.

Keep `index.html` at the repository root; do not upload the ZIP itself or put the website inside another folder. Your existing Pages settings and deployment workflow can remain in place.

## What is included

All current page content, fonts, artwork, videos, published download assets and case controllers. The skill bubbles, About and Credentials styles are included in the compiled stylesheet, whose linked URL is versioned by its content hash. The original Home order, services, case palettes, opening screen and media behaviour are retained.

Heavy case content remains deferred. Local media needs an HTTP server for reliable preview; opening `index.html` directly as a file can prevent JavaScript modules from loading.

## Preview locally (optional)

From the extracted folder, run:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## If you later edit CSS

Edit the relevant source stylesheet in `assets`, then run:

```sh
node maintenance/rebuild-styles.mjs
```

The helper rebuilds `assets/portfolio.css` in the original cascade order and updates the versioned link in `index.html`. Add new source stylesheets to its ordered list first. It rejects omitted CSS files so styling cannot silently disappear from the export.

## Export validation

Checked: complete ZIP integrity; local HTML/CSS asset paths; dynamic controller files; stylesheet version matching; all 33 source styles included; deployment-ready root layout. Live browser rendering and playback still require a check on GitHub after deployment.

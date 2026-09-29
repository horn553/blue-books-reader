# Blue Books Reader (Unofficial)

A Chrome extension that makes WHO Blue Books easier to read while preserving the original text, figures, citations, links, and reading order.

**Independent project. Not affiliated with, endorsed by, or produced by WHO or IARC.** Existing authorized access to the [WHO Classification of Tumours website](https://tumourclassification.iarc.who.int/) is required. This extension does not provide books or unlock access.

## Features

- Adjustable text size, maximum text width, and line spacing. Text size and width are independent.
- Page-level reading with a sticky section outline on wide screens.
- Navigation derived from existing headings, with expandable groups for long outlines.
- Independent chapter expansion and working book-wide expand/collapse controls.
- Responsive figures and scrolling tables, preserving captions, footnotes, and merged cells.
- Local reading-position restoration when returning to an article in the same tab.
- A popup switch to return to the site's original presentation.

The extension changes presentation and navigation, not medical content. It does not summarize, correct, translate, or supplement the source.

## Install locally

1. Download this repository or clone it.
2. Open `chrome://extensions/` in Chrome and enable **Developer mode**.
3. Choose **Load unpacked** and select the directory containing `manifest.json`.
4. Reload an already-open WHO Blue Books page.
5. Open the extension popup to adjust your preferences.

After updating files, click **Reload** in Chrome's extension manager, then reload the site. No build is needed for local installation. A Web Store listing has not yet been published.

## Privacy and permissions

Page content is processed locally. There are no developer-server requests, analytics, advertising, telemetry, or remotely hosted code. Preferences use `chrome.storage.local`. Supported page paths, scroll positions, and timestamps use the site's tab-scoped `sessionStorage` for reading-position restoration. See [Privacy](PRIVACY.md) for retention and deletion.

The only API permission is `storage`. Content scripts match only `https://tumourclassification.iarc.who.int/*`, including entry pages so they can detect same-site SPA navigation. Layout changes activate only on supported numeric chapter/article/attachment routes. The extension does not use cookies, browser history, tabs, scripting, or background-service permissions.

## Compatibility

Representative Digestive System Tumours pages have been evaluated, including chapter navigation, figures, abbreviations, and TNM tables. Not every volume, edition, viewport, or source-site feature has been tested.

Abbreviation pairing is deliberately limited to the inspected `/chaptercontent/72/286` structure. Some standalone attachment pages retain their native layout. Unknown structures are left alone rather than reconstructed. Site updates may require extension updates. Notes, feedback, favourites, and subscriptions remain functions of the original site.

## Development

Use Node.js 22 or newer:

```sh
npm ci --ignore-scripts
npm test
npm run build
```

The build creates `dist/blue-books-reader-0.2.0.zip` and its SHA-256 checksum. An explicit allowlist puts the manifest at the ZIP root and excludes tests, dependencies, store assets, and inspection material. Dependencies are development-only; the extension has no third-party runtime code.

`npm run demo` serves original synthetic examples on localhost. They are not WHO/IARC content. The server substitutes localhost only in a served development copy; the package retains its production-origin restriction. `npm run assets` recreates the original icons and promotional artwork.

## Publishing and maintenance

- [Store listing](store/LISTING.md)
- [Privacy declarations and reviewer notes](store/REVIEWER-NOTES.md)
- [Submission checklist](store/SUBMISSION.md)
- [Verification scope](docs/VERIFICATION.md)
- [Changelog](CHANGELOG.md)

Report problems in [GitHub Issues](https://github.com/horn553/blue-books-reader/issues), with the version, viewport size, and affected route. Do not post account information, patient information, copyrighted book text, or figures.

## License

Extension code and original project artwork are under the [MIT License](LICENSE). WHO/IARC names and site content are not licensed by this repository. No book content or publisher logos are bundled.

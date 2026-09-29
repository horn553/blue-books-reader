# Submission checklist

Version: **0.2.2**. Status: **not submitted to Chrome Web Store**.

## Prepared

- English interface, listing copy, support links, and privacy policy.
- Manifest V3 with one API permission and one content-script origin.
- Original icons, a 440 x 280 promotional tile, and labelled 1280 x 800 sample screenshots.
- MIT license, synthetic tests, CI, and allowlisted reproducible packaging.

## Publisher steps

1. Review LISTING.md and REVIEWER-NOTES.md.
2. Complete developer registration, verified contact details, and any publisher/trader declarations required by the dashboard. Do not invent these details or substitute repository metadata.
3. Reload version 0.2.2 locally and perform the live smoke test in REVIEWER-NOTES.md. Earlier 0.1.4 behavior was confirmed by the owner; the English release needs its final installed-package check.
4. Arrange authorized reviewer access to the subscription site and provide instructions privately in the dashboard.
5. Run `npm ci --ignore-scripts`, `npm test`, and `npm run build`. Upload `dist/blue-books-reader-0.2.2.zip`, not a GitHub source archive. The manifest is at the ZIP root.
6. Fill the listing, upload images, link the public privacy policy, and complete privacy fields. Review the actual dashboard wording and personally confirm certifications.
7. Select distribution regions, review the draft, then submit when ready. Nothing in this repository automatically publishes to the store.

## Future releases

Update manifest/package versions, the reader.js version marker, relevant docs, and CHANGELOG.md. Run tests and rebuild. CI produces an upload candidate, not a store submission. Do not commit member-site content, credentials, private logs, or captures.

## Official references

- [Package preparation](https://developer.chrome.com/docs/webstore/prepare)
- [Image requirements](https://developer.chrome.com/docs/webstore/images)
- [Listing fields](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)
- [Publishing workflow](https://developer.chrome.com/docs/webstore/publish/)

Requirements checked September 29, 2026. The dashboard and store review determine acceptance.

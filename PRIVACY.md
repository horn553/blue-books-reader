# Privacy Policy

**Blue Books Reader (Unofficial)** · Version 0.2.0 · Updated September 29, 2026

This policy describes the extension maintained at [horn553/blue-books-reader](https://github.com/horn553/blue-books-reader), independently of WHO and IARC.

## Local data handling

The extension reads the displayed page's document structure, headings, text labels, figure elements, and tables to adjust presentation and create navigation. This happens locally in the browser. It does not send page contents to the developer or another service, or store a copy of book text or images.

| Data | Purpose | Location and retention |
| --- | --- | --- |
| Enabled state, text size, width, line spacing | Apply reading preferences | `chrome.storage.local`, until changed or the extension is removed |
| Supported page path, vertical scroll position, timestamp | Restore the reading position when returning in the same tab | The website's tab-scoped `sessionStorage`; records older than four hours are ignored, not automatically deleted |
| Heading labels and navigation state | Display an outline and operate chapter controls | The current page's memory/DOM; removed on disable or page unload |

Session storage normally ends when the tab session ends. Browser session restoration can preserve it. Because position records use the website's own session storage, scripts on that origin may also access them. Only the path is stored, not the query string, URL fragment, credentials, or a full browser history.

The extension observes local clicks, keyboard activation, and scrolling to operate these features. It does not keep an interaction log or use the browser history API.

## Sharing and network activity

The extension does not transmit this data to the developer or any third party. It does not sell data, use it for advertising, or use it for creditworthiness or lending decisions. There is no analytics, telemetry, crash-reporting service, or remote executable code.

The original website continues to make its normal requests. Its policies govern those requests and any account, note, feedback, or favourite actions you perform. Opening a Privacy or Support link visits GitHub under GitHub's policies. Information you voluntarily post in a public GitHub issue is public; do not post sensitive information or copyrighted book content.

## Permissions

- **Storage:** save display preferences in this Chrome profile, without Chrome Sync.
- **Site content script:** access only `https://tumourclassification.iarc.who.int/*` to recognize navigation and format supported pages. Account, login, and search pages receive no reading-layout modifications. No other site is accessed.

No cookies, passwords, authentication tokens, patient records, payment details, or account form fields are intentionally read, collected, or stored by the extension. The extension does not provide medical advice.

## Your controls

Use the popup to disable the layout or restore default display preferences. Disabling stops new reading-position saves but does not erase earlier session records. Removing the extension removes its Chrome-local preferences. To remove position records, close the relevant site tabs without restoring their sessions, or clear that site's browser storage. Clearing site storage can also clear data belonging to the original website.

## Changes and contact

Changes are recorded in this repository alongside the extension version. For questions, use [GitHub Issues](https://github.com/horn553/blue-books-reader/issues) without posting private information.

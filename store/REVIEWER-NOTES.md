# Privacy declarations and reviewer notes

## Single purpose

Improve the reading layout and in-page navigation of supported WHO Blue Books chapter and article pages, preserving source content for users with existing authorized access.

## Permission justification

**storage:** Stores only the enabled state, text size, maximum text width, and line spacing in chrome.storage.local so display preferences persist. No synchronization or external transmission is used.

**https://tumourclassification.iarc.who.int/* content-script match:** Required to format the displayed document and detect client-side navigation from an entry page to a chapter/article. Layout changes activate only on recognized numeric chapter/article/attachment routes. The broad path on this one origin supports SPA navigation; no other origin is requested. No additional host_permissions or optional permissions are used.

## Remote code

No. All extension JavaScript/CSS are packaged locally. No remote scripts, eval, WebAssembly, background service worker, or developer endpoint is used. Development dependencies and the synthetic demo server are excluded from the ZIP.

## Data-use fields

Disclose local handling instead of claiming the extension handles no data. Prepare dashboard selections for **Website content**, **Web history** (only supported page paths for restoration), and **User activity** (local interaction and scroll handling). Explain that processing/storage is entirely local, with no collection by the developer, transmission, sale, analytics, or advertising. Match the exact category descriptions displayed at submission time.

These categories describe on-device handling, not a remote history or activity database. Preferences use chrome.storage.local; reading positions use the site's sessionStorage. There is no patient-record collection or account-form processing.

The implementation is consistent with data-use certifications: data is not sold or transferred outside permitted uses, used for unrelated purposes, or used for creditworthiness/lending. The publisher must review and personally confirm the dashboard's certifications.

## Live review instructions

1. Install the submitted ZIP and open the supported website using authorized reviewer access.
2. Open `/chapters/72`. Open two chapters individually, then expand/collapse all with the book-wide control. Test Enter/Space.
3. Open an article. Adjust Text size and Maximum text width independently in the popup.
4. Scroll a long article and use its outline. Open a figure using the original viewer.
5. Inspect TNM tables and footnotes. Follow an ordinary internal link and use Back to check position restoration.
6. Disable the reading layout and verify the original presentation returns.

**Access prerequisite:** The website requires its own account/subscription. Reviewer credentials are not supplied in this repository. Before submission, arrange authorized reviewer access through the dashboard's private reviewer instructions. Never put credentials in this public repository. The synthetic demo supplements, but does not replace, live integration review.

## Offline source review

Run `npm ci --ignore-scripts`, `npm test`, and `npm run demo` to inspect synthetic examples without accessing the member site. The demo substitutes localhost only in its development response and is excluded from the package.

## References

- [Local processing must be disclosed](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)
- [Privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)

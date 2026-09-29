# Verification scope

## Automated checks

Synthetic DOM tests verify text/link/image preservation, table spans, delayed content, repeated enhancement, SPA cleanup, chapter controls, grouped outlines, font controls, independent width settings, and disabling/restoration. Publication tests cover popup settings, manifest metadata, icons, and ZIP contents.

Fixtures are original, not member-site content. Tests do not contact the production site. DOM tests cannot prove browser layout or every Angular interaction.

## Manual evaluation before public preparation

Representative Digestive System Tumours pages were examined with authorized access at normal browsing pace: chapter navigation, figures, abbreviations, and long TNM tables. Text, link, and image-reference counts were compared before/after presentation changes on a representative article. Sticky navigation, figure viewing, original note-dialog opening without submission, and back-navigation restoration were checked.

Negative full-width row margins caused horizontal overflow. Synthetic Chrome checks verified matching client/scroll widths, independent 10/18/24px text-size changes, and sticky navigation. The owner subsequently confirmed the 0.1.4 fixes including book-wide expansion.

## 0.2.0

Changes since 0.1.4 are English popup text, branding/icons, links, documentation, and build/test tooling. Reading-layout logic is unchanged except for the version marker. Chrome screenshots show current UI with an explicit sample-content label.

Reload the final installed package before submission and follow store/REVIEWER-NOTES.md. This is a separate publisher check. Not every volume, edition, viewport, or original-site feature has been tested.

No subscription, saved note, feedback submission, or favourite was changed during evaluation. Original content and private captures are excluded from this repository.

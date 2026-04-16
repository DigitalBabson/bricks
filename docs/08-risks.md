# ITCMS-7535 — Part 8: Risks & Mitigations

[← Back to Table of Contents](./ITCMS-7535-upgrade-plan.md)

---

| Risk | Impact | Mitigation |
|---|---|---|
| Searchstax token exposed in browser | Low — read-only search token | Token is read-only and scoped to the search index. Calling Searchstax directly avoids added latency from a proxy. Keep token in `.env` (not in source). If security requirements change, swap `DEV_SEARCHSTAX_ENDPOINT` to a Drupal proxy endpoint — no other frontend changes needed. |
| N+1 hydration calls after Searchstax search | Slow search results for 20+ bricks | Use batch Drupal endpoint (`filter[id][operator]=IN`) to hydrate all bricks in a single call. Fall back to `Promise.all` per-brick calls if batch fails. Add loading skeleton UI. |
| Drupal `meta.count` missing or inconsistent on filtered queries | Numbered pagination could drift from actual results for browse or location-filtered mode | Use `meta.count` when present for Drupal-backed pagination. If a specific filtered endpoint does not return it consistently, treat that as a backend contract issue and fall back to prev/next-only navigation for that mode until corrected. Searchstax results continue to use `numFound`. |
| Searchstax downtime | Keyword search broken for users | Implemented: fall back to Drupal's `CONTAINS` filter with a user-visible message. |
| Hero/placeholder images hosted on Drupal | Images unavailable if Drupal CDN is down | Same risk as all brick images — acceptable since the whole app depends on Drupal. |

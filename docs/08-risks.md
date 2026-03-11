# ITCMS-7535 — Part 8: Risks & Mitigations

[← Back to Table of Contents](./ITCMS-7535-upgrade-plan.md)

---

| Risk | Impact | Mitigation |
|---|---|---|
| Searchstax token exposed in browser | Low — read-only search token | Token is read-only and scoped to the search index. Calling Searchstax directly avoids added latency from a proxy. Keep token in `.env` (not in source). If security requirements change, swap `DEV_SEARCHSTAX_ENDPOINT` to a Drupal proxy endpoint — no other frontend changes needed. |
| N+1 hydration calls after Searchstax search | Slow search results for 20+ bricks | Use batch Drupal endpoint (`filter[id][operator]=IN`) to hydrate all bricks in a single call. Fall back to `Promise.all` per-brick calls if batch fails. Add loading skeleton UI. |
| No total count from Drupal API | Cannot show last page number in pagination for browse mode | Use `links.next` presence to determine if more pages exist. For Searchstax results, `numFound` provides exact total enabling full pagination with last page number. |
| Searchstax downtime | Keyword search broken for users | Implemented: fall back to Drupal's `CONTAINS` filter with a user-visible message. |
| Hero/placeholder images hosted on Drupal | Images unavailable if Drupal CDN is down | Same risk as all brick images — acceptable since the whole app depends on Drupal. |

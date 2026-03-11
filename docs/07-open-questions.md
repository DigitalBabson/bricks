# ITCMS-7535 — Part 7: Open Questions / Blockers

[← Back to Table of Contents](./ITCMS-7535-upgrade-plan.md)

---

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | ~~What is the exact Searchstax endpoint URL and request/response format?~~ | Backend team | **Resolved** — `emselect` endpoint with `fq=tcngramm_X3b_en_description:{keyword}`, returns `ss_uuid` + `numFound`. See [§2.4](./02-architecture.md#24-api-endpoints). |
| 2 | ~~Does Searchstax require an API key? Should it be proxied through Drupal for production?~~ | Backend team | **Resolved** — Token auth via `Authorization: Token {token}` header, stored in `.env`. A Drupal proxy would add latency to every search request, so the app will call Searchstax directly from the browser. The token is a read-only search token scoped to the index, which limits the risk. If the security posture changes, a proxy can be introduced later without frontend changes (just swap `DEV_SEARCHSTAX_ENDPOINT` to point at the proxy). |
| 3 | ~~Does the Drupal bricks endpoint return a total count?~~ | Backend team | **Resolved** — Yes. Drupal returns `meta.count` on the bricks listing endpoint (for example, `6280` on `/jsonapi/bricks`). Use `meta.count` to calculate `totalPages` for Drupal-backed pagination. Searchstax continues to use `numFound`. |
| 4 | ~~Is location filtering done via Searchstax facets or Drupal JSON:API filters?~~ | Backend team | **Resolved** — Drupal JSON:API filter on `brickParkLocation.id`. Searchstax is for keyword search only. |
| 5 | ~~Are the Adobe XD specs final?~~ | Design/PM | **Resolved** — Yes, specs are final. |
| 6 | ~~Should the keyword search minimum remain at 4 characters?~~ | PM/UX | **Resolved** — Lowered to 3 characters. Debounce at 500ms. |
| 7 | ~~Searchstax fallback?~~ | Backend/PM | **Resolved** — Yes, fall back to Drupal `CONTAINS` search if Searchstax is unavailable. |
| 8 | ~~What hero image should be used?~~ | Design/PM | **Resolved** — Hosted on Drupal: `https://babsondev.prod.acquia-sites.com/sites/default/files/2026-03/find-my-brick-hero.jpg` (dev). |
| 9 | ~~Does the parkLocations endpoint support `include` for map images?~~ | Backend team | **Resolved** — `parkLocations?include=field_brick_zone_image` returns images. Resource type: `parkLocation`. |
| 10 | ~~What are the exact footer links and copy?~~ | Design/PM | **Resolved** — Footer is a duplicate of the header's first line: "BABSON COLLEGE" in white on green. No subheader, no links. |
| 11 | ~~Are zones grouped hierarchically?~~ | Backend team | **Resolved** — No. Flat list, sorted alphanumerically ascending. |
| 12 | ~~Is there a park-wide "Location Overview" map?~~ | Backend team | **Resolved** — No. Default to the first location's map in the sorted list. |
| 13 | The Searchstax `ss_uuid` hydration requires one Drupal call per brick (`/brick/{uuid}`). For a page of 20 results, that's 20 parallel requests. Is there a batch endpoint (e.g., `/bricks?filter[id][operator]=IN&filter[id][value]={uuid1,uuid2,...}`) to reduce this to a single call? | Backend team | **Resolved** — Yes, batch endpoint is available. |
| 14 | ~~Separate Searchstax indices per environment?~~ | Backend team | **Resolved** — Yes, separate indices. Using dev index for demo. |

---

**Next:** [Part 8 — Risks & Mitigations](./08-risks.md)

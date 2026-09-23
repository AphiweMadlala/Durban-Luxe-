# Media reconciliation

Source: every carousel frame of the 31 @durban_luxe posts, downloaded once via Apify (`data/raw/media/<shortcode>/NN.jpg`, carousel order preserved). Pipeline: `scripts/build-data.py`. Validation: `npm run validate`.

## Totals

| | |
|---|---|
| Frames downloaded | 479 (all 1440 × 1440 JPEG) |
| Included in galleries | 478 |
| Excluded | 1: `data/raw/media/DPglvr0jAs7/12.jpg` (near-duplicate of previous frame) |
| Derivatives | WebP at 640, 1024, 1440 px (1434 files) |
| Weight | 640w 17 MB · 1024w 30 MB · 1440w 56 MB (total) |

## Audit checks

| Check | Result |
|---|---|
| Missing files | 0 (every image × every width exists) |
| Zero-byte / corrupt files | 0 (every source is fully decoded by Pillow to make its derivatives; the validator also checks size) |
| Duplicate hashes (exact, SHA-1) | 0 across all galleries |
| Near-duplicates (perceptual) | 1 pair, inside DPglvr0jAs7; frame 12 excluded |
| Wrong-property images | 0 cross-post photo matches, so no image appears under two properties |
| Low-resolution thumbnails | 0; every source is 1440 px, the Instagram maximum |
| Promo graphics, text cards, UI screenshots | 0; every frame was reviewed on contact sheets (`data/raw/sheets/`) and all are real property photography |
| Portrait graphics as heroes | n/a; all sources are square |
| Video | None. The profile has no reels, so `video` is `null` everywhere |
| Other hosts' images | 2 search hits from other accounts were excluded before download |

## Hero selection

Heroes were hand-picked from contact sheets. The rule: the frame that best shows *this* home's main selling point (ocean, pool or architecture), well composed, with no clutter at the 1:1 crop. Where the first frame was an interior or a detail, a later frame was chosen.

| Property | Photos | Hero | File |
|---|---|---|---|
| Umhlanga Rocks Pool House | 20 | frame 01 | `images/properties/umhlanga-rocks-pool-house/01` |
| Salt Rock Beach Villa | 20 | frame 01 | `images/properties/salt-rock-beach-villa/01` |
| Balinese Sea-View Villa | 20 | frame 01 | `images/properties/balinese-sea-view-villa/01` |
| Dolphin Coast Ocean Deck | 13 | frame 13 | `images/properties/dolphin-coast-ocean-deck/13` |
| Beacon Rock Loft, Umhlanga | 17 | frame 16 | `images/properties/beacon-rock-umhlanga-loft/16` |
| Zimbali Garden Cottage | 18 | frame 14 | `images/properties/zimbali-garden-cottage/14` |
| Zimbali Bushbuck Pool Villa | 18 | frame 01 | `images/properties/zimbali-bushbuck-pool-villa/01` |
| Zimbali Sea-View Villa | 17 | frame 17 | `images/properties/zimbali-sea-view-villa/17` |
| Ballito Penthouse | 10 | frame 09 | `images/properties/ballito-penthouse/09` |
| Westbrook Beach House | 20 | frame 18 | `images/properties/westbrook-beach-house/18` |
| Dolphin Coast Architectural Villa | 17 | frame 09 | `images/properties/dolphin-coast-architectural-villa/09` |
| Solar-Powered Pool Home | 16 | frame 02 | `images/properties/solar-powered-pool-home/02` |
| Port Zimbali Milkwood House | 15 | frame 01 | `images/properties/port-zimbali-milkwood-house/01` |
| Christmas Bay Beachfront Villa | 20 | frame 20 | `images/properties/christmas-bay-beachfront-villa/20` |
| Zimbali Golf-View Villa | 15 | frame 01 | `images/properties/zimbali-golf-view-villa/01` |
| Dolphin Coast Beach Bungalow | 10 | frame 08 | `images/properties/dolphin-coast-beach-bungalow/08` |
| Forty Seconds Beach Terrace | 16 | frame 13 | `images/properties/forty-seconds-beach-terrace/13` |
| Ballito Beachfront Apartment | 14 | frame 01 | `images/properties/ballito-beachfront-apartment/01` |
| Beachfront Garden Retreat | 14 | frame 01 | `images/properties/durban-beachfront-garden-retreat/01` |
| Umhlanga Beach Duplex | 16 | frame 03 | `images/properties/umhlanga-beach-duplex/03` |
| Contemporary Garden Pool House | 17 | frame 01 | `images/properties/contemporary-garden-pool-house/01` |
| Veranda Sea-View Villa | 12 | frame 02 | `images/properties/veranda-sea-view-villa/02` |
| Zimbali Family Villa | 17 | frame 17 | `images/properties/zimbali-family-villa/17` |
| Zimbali Tinderwood Villa | 11 | frame 11 | `images/properties/zimbali-tinderwood-villa/11` |
| Entertainer's Pool Villa | 14 | frame 13 | `images/properties/dolphin-coast-entertainers-villa/13` |
| Ballito Fairway Townhouse | 13 | frame 01 | `images/properties/ballito-fairway-townhouse/01` |
| Zimbali Indoor-Outdoor Villa | 15 | frame 13 | `images/properties/zimbali-indoor-outdoor-villa/13` |
| Umdloti Ocean-View Villa | 19 | frame 17 | `images/properties/umdloti-ocean-view-villa/17` |
| Ballito Dual-Level Home | 15 | frame 02 | `images/properties/ballito-dual-level-sea-view-home/02` |
| Shaka's Rock Group House | 9 | frame 02 | `images/properties/shakas-rock-group-house/02` |
| Ballito Tropical Coastal Villa | 10 | frame 04 | `images/properties/ballito-tropical-coastal-villa/04` |

## Delivery

- `srcset` 640/1024/1440 with per-slot `sizes`, explicit `width`/`height`, `loading="lazy"` + `decoding="async"` except the LCP image (`fetchpriority="high"`).
- The collection page loads only one card image per listing. Galleries load on property pages only, and the lightbox lazy-loads beyond the first two slides.
- Images are never upscaled beyond 1440 px (the source maximum), so there are no full-bleed photos on very wide screens.
- WebP quality 84 (640/1024) and 88 (1440), method 6, chosen to keep interior detail (stone, timber, fabric) clean. AVIF was not added: WebP is supported by every current browser, and a second set of derivatives would add substantially to the repo (already about 100 MB of images) for a modest per-visit saving. It can be added later with a `<picture>` wrapper in `templates/components.mjs`.

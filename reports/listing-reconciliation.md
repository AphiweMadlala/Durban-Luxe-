# Listing reconciliation

Generated from `data/properties.json` (source: 31 posts on @durban_luxe, extracted 2026-09-23 via Apify `apify/instagram-scraper`).

## Result

| | |
|---|---|
| Posts on the profile | 31 (all carousels, 8 May 2025 to 12 Sep 2026) |
| Property posts | 31 (no brand, lifestyle, review, promo or booking-info posts exist) |
| Canonical properties | **31** (one post = one property, see matching below) |
| Status | 31 `active`, 0 `archived`, 0 `unknown` |
| Excluded posts | 2 URLs found by web search belong to **other** accounts (`homegroundescapes` CYjRsd3q6Ci, `oceanpearlluxury_` DXKYdBBjS37) and were excluded |

## Matching and deduplication

Instagram businesses often re-post the same home, so every pair of posts was tested before accepting "one post = one property":

1. **Photography:** perceptual hashes (aHash + dHash, 64-bit) of all 479 carousel frames, compared pairwise across posts. **0 cross-post matches** (threshold: Hamming ≤ 10 on both). The only near-duplicate pair is *inside* one post (DPglvr0jAs7 frames 11/12).
2. **Captions:** bedroom/bathroom/guest counts, location header, rate and amenity lists compared. No two posts share the same combination.
3. **One borderline case:** DPOFTO1DDLK and the Zimbali Indoor-Outdoor Villa post share a caption template (including housekeeping hours) but no photography and different specs, so they stay separate properties.

## Status logic

- `active` = currently published on the live feed with no retirement/sold-out/unavailable signal. **This is not availability.** The site never shows "available"; it offers "Check availability", which drafts a WhatsApp message.
- The account has no pinned posts, no highlights data, no link-in-bio page and no OTA listings, so there was no second source to mark anything `archived`. If Durban Luxe confirms a home has left the portfolio, set its `status` in `data/curation.json` and rebuild.

## Rates

Every listing publishes a rate in the same form: **"From R… p/n · Minimum stay of 3 nights · Rate excl VAT"** (one listing, Umhlanga Rocks Pool House, says *includes* VAT). These are recorded as `priceType: from-rate` with the date of the post. None were promotional or date-specific. The site shows them as "From R… per night, excl. VAT" with the publication date on the property page, and says rates are confirmed on enquiry.

**Staleness:** 12 rates were published more than a year ago (May to Sep 2025). They are not presented as current prices, but Durban Luxe should confirm them before launch.

## Canonical list (oldest post first)

| # | Source post · date | Name (descriptive) | Location | Type | Beds | Baths | Guests | From / night | Photos | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | [DJZyKeSsq-u](https://www.instagram.com/p/DJZyKeSsq-u/) · 2025-05-08 | Umhlanga Rocks Pool House | Durban & Umhlanga → Umhlanga / Umhlanga Rocks | House | 5 | — | 10 | R8,500 incl. VAT | 20 | active |
| 2 | [DJjHjXrsfcz](https://www.instagram.com/p/DJjHjXrsfcz/) · 2025-05-12 | Salt Rock Beach Villa | Dolphin Coast → Salt Rock | Villa | 4 | 4 | 8 | R10,000 excl. VAT | 20 | active |
| 3 | [DJoZyqAsBdp](https://www.instagram.com/p/DJoZyqAsBdp/) · 2025-05-14 | Balinese Sea-View Villa | Dolphin Coast → Dolphin Coast | Villa | 5 | 5 | 10 | R10,700 excl. VAT | 20 | active |
| 4 | [DJ9XepgqQee](https://www.instagram.com/p/DJ9XepgqQee/) · 2025-05-22 | Dolphin Coast Ocean Deck | Dolphin Coast → Dolphin Coast | Beach residence | 3 | 2 | 6 | R7,000 excl. VAT | 13 | active |
| 5 | [DKKKlwFMPUd](https://www.instagram.com/p/DKKKlwFMPUd/) · 2025-05-27 | Beacon Rock Loft, Umhlanga | Durban & Umhlanga → Umhlanga / Umhlanga Rocks (Beacon Rock) | Apartment | 3 | 3 | 6 | R6,500 excl. VAT | 17 | active |
| 6 | [DLSzgbWMhV3](https://www.instagram.com/p/DLSzgbWMhV3/) · 2025-06-24 | Zimbali Garden Cottage | Dolphin Coast → Zimbali | House | 5 | 5 | 12 | R6,000 excl. VAT | 18 | active |
| 7 | [DMKU29BMzpC](https://www.instagram.com/p/DMKU29BMzpC/) · 2025-07-16 | Zimbali Bushbuck Pool Villa | Dolphin Coast → Zimbali | Villa | 4 | 4 | 8 | R6,500 excl. VAT | 18 | active |
| 8 | [DMNIlIlMF7o](https://www.instagram.com/p/DMNIlIlMF7o/) · 2025-07-17 | Zimbali Sea-View Villa | Dolphin Coast → Zimbali (Zimbali Estate Resort) | Villa | 4 | 3 | 8 | R6,500 excl. VAT | 17 | active |
| 9 | [DMk37ehtcs9](https://www.instagram.com/p/DMk37ehtcs9/) · 2025-07-26 | Ballito Penthouse | Dolphin Coast → Ballito | Penthouse | 3 | 2½ | 6 | R5,900 excl. VAT | 10 | active |
| 10 | [DMk6ftvNyTU](https://www.instagram.com/p/DMk6ftvNyTU/) · 2025-07-26 | Westbrook Beach House | Durban & Umhlanga → Westbrook | House | 5 | 5 | 10 | R9,000 excl. VAT | 20 | active |
| 11 | [DObOh0mjKiC](https://www.instagram.com/p/DObOh0mjKiC/) · 2025-09-10 | Dolphin Coast Architectural Villa | Dolphin Coast → Dolphin Coast | Villa | 4 | 6½ | 8 | R12,000 excl. VAT | 17 | active |
| 12 | [DObQ48zjAKO](https://www.instagram.com/p/DObQ48zjAKO/) · 2025-09-10 | Solar-Powered Pool Home | Dolphin Coast → Dolphin Coast | House | 4 | 3½ | 8 | R6,500 excl. VAT | 16 | active |
| 13 | [DObTNn2jNjp](https://www.instagram.com/p/DObTNn2jNjp/) · 2025-09-10 | Port Zimbali Milkwood House | Dolphin Coast → Zimbali / Port Zimbali (Port Zimbali) | House | 5 | 3 | 10 | R10,000 excl. VAT | 15 | active |
| 14 | [DPOB1g9jCgt](https://www.instagram.com/p/DPOB1g9jCgt/) · 2025-09-30 | Christmas Bay Beachfront Villa | Dolphin Coast → Christmas Bay | Villa | 6 | 6½ | 14 | R15,000 excl. VAT | 20 | active |
| 15 | [DPOFTO1DDLK](https://www.instagram.com/p/DPOFTO1DDLK/) · 2025-09-30 | Zimbali Golf-View Villa | Dolphin Coast → Zimbali (Zimbali Estate) | Villa | 4 | 4 | 8 | R5,000 excl. VAT | 15 | active |
| 16 | [DPOG8KbjMGN](https://www.instagram.com/p/DPOG8KbjMGN/) · 2025-09-30 | Dolphin Coast Beach Bungalow | Dolphin Coast → Dolphin Coast | Bungalow | 2 | 2 | 6 | R4,000 excl. VAT | 10 | active |
| 17 | [DPOJTSoDH_w](https://www.instagram.com/p/DPOJTSoDH_w/) · 2025-09-30 | Forty Seconds Beach Terrace | Dolphin Coast → Dolphin Coast | Beach residence | 3 | 2 | 6 | R5,000 excl. VAT | 16 | active |
| 18 | [DPOMAxFjA-r](https://www.instagram.com/p/DPOMAxFjA-r/) · 2025-09-30 | Ballito Beachfront Apartment | Dolphin Coast → Ballito | Apartment | 3 | 3½ | 6 | R6,000 excl. VAT | 14 | active |
| 19 | [DPgbVx5jJDr](https://www.instagram.com/p/DPgbVx5jJDr/) · 2025-10-07 | Beachfront Garden Retreat | Durban & Umhlanga → Durban | Beach residence | 3 | 3 | 6 | R3,500 excl. VAT | 14 | active |
| 20 | [DPgdG1jDL3z](https://www.instagram.com/p/DPgdG1jDL3z/) · 2025-10-07 | Umhlanga Beach Duplex | Durban & Umhlanga → Umhlanga | Apartment | 3 | 2 | 6 | R4,000 excl. VAT | 16 | active |
| 21 | [DPge5h7DIM-](https://www.instagram.com/p/DPge5h7DIM-/) · 2025-10-07 | Contemporary Garden Pool House | Dolphin Coast → Dolphin Coast | House | 3 | 3 | 6 | R4,500 excl. VAT | 17 | active |
| 22 | [DPghsyMjNSa](https://www.instagram.com/p/DPghsyMjNSa/) · 2025-10-07 | Veranda Sea-View Villa | Dolphin Coast → Dolphin Coast | Villa | 4 | 4 | 8 | R5,000 excl. VAT | 12 | active |
| 23 | [DPgjytrjOze](https://www.instagram.com/p/DPgjytrjOze/) · 2025-10-07 | Zimbali Family Villa | Dolphin Coast → Zimbali (Zimbali Coastal Estate) | Villa | 4 | 2½ | 6 | R4,500 excl. VAT | 17 | active |
| 24 | [DPglvr0jAs7](https://www.instagram.com/p/DPglvr0jAs7/) · 2025-10-07 | Zimbali Tinderwood Villa | Dolphin Coast → Zimbali (Tinderwood, Zimbali Coastal Estate) | Villa | 3 | 2 | 6 | R3,500 excl. VAT | 11 | active |
| 25 | [DPgqDpqjEa-](https://www.instagram.com/p/DPgqDpqjEa-/) · 2025-10-07 | Entertainer's Pool Villa | Dolphin Coast → Dolphin Coast | Villa | 4 | 5 | 8 | R8,000 excl. VAT | 14 | active |
| 26 | [DPgsoW1DMtA](https://www.instagram.com/p/DPgsoW1DMtA/) · 2025-10-07 | Ballito Fairway Townhouse | Dolphin Coast → Ballito | Townhouse | 3 | 2 | 6 | R5,000 excl. VAT | 13 | active |
| 27 | [DPqYxmxjCla](https://www.instagram.com/p/DPqYxmxjCla/) · 2025-10-11 | Zimbali Indoor-Outdoor Villa | Dolphin Coast → Zimbali | Villa | 4 | 4½ | 8 | R5,000 excl. VAT | 15 | active |
| 28 | [DPqbmxFjPv5](https://www.instagram.com/p/DPqbmxFjPv5/) · 2025-10-11 | Umdloti Ocean-View Villa | Durban & Umhlanga → Umdloti | Villa | 3 | 3 | 6 | R6,500 excl. VAT | 19 | active |
| 29 | [DPqdkFnjJS0](https://www.instagram.com/p/DPqdkFnjJS0/) · 2025-10-11 | Ballito Dual-Level Home | Dolphin Coast → Ballito | House | 4 | 4½ | 8 | R7,000 excl. VAT | 15 | active |
| 30 | [DVgoVIPDAfF](https://www.instagram.com/p/DVgoVIPDAfF/) · 2026-03-05 | Shaka's Rock Group House | Dolphin Coast → Ballito / Shaka's Rock | House | 8 | 6½ | 16+ | R13,000 excl. VAT | 9 | active |
| 31 | [DdLpaP3jFjI](https://www.instagram.com/p/DdLpaP3jFjI/) · 2026-09-12 | Ballito Tropical Coastal Villa | Dolphin Coast → Ballito | Villa | 5 | 6 | 10 | R14,000 excl. VAT | 10 | active |

**Names:** Durban Luxe does not name its properties. The names above are descriptive labels built only from each caption's location and verified features (for example "Salt Rock Beach Villa"). Durban Luxe should replace them with their preferred names in `data/curation.json`.

## Per-listing notes and conflicts

- **Umhlanga Rocks Pool House** (`DJZyKeSsq-u`): Only listing whose published rate INCLUDES VAT; all others are excl. VAT. Bathroom count not published.
- **Balinese Sea-View Villa** (`DJoZyqAsBdp`): Caption lists '3 open plan garages' in description.
- **Beacon Rock Loft, Umhlanga** (`DKKKlwFMPUd`): Building (Beacon Rock) stated in caption; exact unit not published.
- **Zimbali Bushbuck Pool Villa** (`DMKU29BMzpC`): Bathroom count (4) comes from the description; the amenity line omits it.
- **Ballito Penthouse** (`DMk37ehtcs9`): Sunset/rooftop-pool character is from the post's own photos.
- **Dolphin Coast Architectural Villa** (`DObOh0mjKiC`): 6.5 bathrooms for 4 bedrooms as published.
- **Port Zimbali Milkwood House** (`DObTNn2jNjp`): Private pool stated in description (not in amenity list); visible in photos.
- **Zimbali Golf-View Villa** (`DPOFTO1DDLK`): Caption header reads 'Zimbali Estate, Ballito'.
- **Ballito Beachfront Apartment** (`DPOMAxFjA-r`): Caption reads 'Minimum stay of 3' (unit omitted); treated as 3 nights, consistent with every other listing.
- **Beachfront Garden Retreat** (`DPgbVx5jJDr`): Caption gives only 'Durban' — no suburb.
- **Umhlanga Beach Duplex** (`DPgdG1jDL3z`): Caption header says 'Durban'; description places it 'right on the beach in Umhlanga'.
- **Zimbali Family Villa** (`DPgjytrjOze`): Resort access is 'paid' per caption.
- **Zimbali Tinderwood Villa** (`DPglvr0jAs7`): Carousel image 12 is a near-duplicate of 11 and is excluded.
- **Zimbali Indoor-Outdoor Villa** (`DPqYxmxjCla`): Shares caption template/housekeeping hours with DPOFTO1DDLK but no shared photography — treated as a separate property.
- **Shaka's Rock Group House** (`DVgoVIPDAfF`): Caption lists '8 Bedrooms' and describes '7 spacious bedrooms plus a separate granny flat' — consistent (7+1).
- **Ballito Tropical Coastal Villa** (`DdLpaP3jFjI`): Most recent listing (12 Sep 2026).

## Field coverage

| Field | Listings with data |
|---|---|
| Bedrooms, beds, guests, rate, min stay | 31 / 31 |
| Bathrooms | 30 / 31 |
| Town/suburb more specific than "Dolphin Coast" | 22 / 31 |
| Estate or building | 6 / 31 |
| Parking bay count | 1 / 31 (parking *availability* is known for 27) |
| Check-in/out times, house rules, cancellation terms | 0 / 31 (not published) |
| Coordinates | 0 / 31 (deliberately: no addresses are published) |

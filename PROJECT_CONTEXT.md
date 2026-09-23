# Project context: Durban Luxe website proposal

A static, generated website proposal for **Durban Luxe** (@durban_luxe), an Instagram-first holiday-rental business on the KwaZulu-Natal coast. Built from the business's own Instagram content; enquiries go to its real WhatsApp.

## Quick start

```
npm install                     # Phosphor icon set (only dependency)
npm run data                    # raw Instagram data -> data/*.json + WebP derivatives (needs Pillow)
npm run validate                # data integrity checks
npm run build                   # data + templates -> dist/
npm run serve                   # http://localhost:4173
node scripts/qa.mjs --shots     # browser sweep (needs Playwright's Chromium)
node scripts/qa-interactions.mjs
```

**Deploying (GitHub Pages, from a branch):** Pages publishes `main` / (root), and the site is served at `https://aphiwemadlala.github.io/Durban-Luxe-/`. `npm run deploy` (`scripts/deploy-pages.mjs`) builds into `.pages-build/` with base `/Durban-Luxe-/`, then publishes to the repo root: `index.html`, `404.html`, `about/`, `enquire/`, `stays/`, `css/`, `js/`, `fonts/`, `images/`, `favicon.svg`, `robots.txt`, `sitemap.xml`. It only removes the entries listed in `.pages-manifest.json` from the previous publish, and aborts if a generated name would collide with a source path (`data/`, `public/`, `scripts/`, `templates/`, …). Commit and push `main` after deploying. **Edit `public/` and `templates/`, never the published copies at the root.** `dist/` stays a local, uncommitted preview build (`npm run build && npm run serve`).

## 1. Source hierarchy

1. **@durban_luxe Instagram posts**: the only source of properties, facts, rates and photos.
2. **@durban_luxe profile**: business positioning (bio) and the booking channel (WhatsApp bio link).
3. **Public web search**: used only to confirm what does *not* exist (no website, OTA listings or email). Nothing on the site comes from third-party pages.
4. **Human curation** (`data/curation.json`): descriptive names, location hierarchy, hero choice and web copy. Every entry must be traceable to the post's caption or its own photos.

Anything not in these sources is left `null` and shown as "not published / ask when you enquire".

## 2. Instagram extraction workflow

- Apify REST API with `APIFY_TOKEN` (no OAuth): `apify/instagram-scraper` with `resultsType: posts` on the profile URL, plus a `details` run for the profile.
- Raw output is cached in `data/raw/posts.json` and `data/raw/profile.json`. Carousel frames are downloaded once to `data/raw/media/<shortcode>/NN.jpg` (1-based, carousel order).
- Perceptual hashes live in `data/raw/hashes.json`; contact sheets for visual review in `data/raw/sheets/`.
- `scripts/build-data.py` never calls the network. It only reads `data/raw/` and `data/curation.json`.

## 3. Property matching

- Posts are compared on **photography** (aHash/dHash Hamming distance across all frames) and on **caption facts** (location, bedrooms/bathrooms/guests, rate, amenity list).
- Result at extraction: 31 posts → 31 distinct properties, 0 shared photos across posts.
- **Limitation:** `build-data.py` currently builds one property per post (curation entries are keyed by shortcode). If Durban Luxe re-posts a home, `build-data.py` needs a small extension: a `mergeInto: <shortcode>` curation key that appends the repeat post's frames to the original gallery and records it in `instagramPosts`, with the newest caption winning on rate. The validator already fails if one post is assigned to two properties.

## 4. Listing status

`active` = on the live feed with no retirement signal. `archived` = confirmed gone. `unknown` = uncertain. Only `active` listings appear on the site. **Status never means availability**: the site never claims a date is free.

## 5. Media pipeline

Source JPEG (1440²) → WebP 640/1024/1440 (`public/images/properties/<slug>/NN-<w>.webp`) → `srcset`/`sizes` in templates. Heroes (`heroIndex`) and exclusions (`exclude`) are declared in `curation.json`, and recorded in `data/media-manifest.json` with SHA-1 and source permalink. Details: `reports/media-reconciliation.md`.

## 6. Amenity normalisation

`TAXONOMY` in `scripts/build-data.py` maps raw caption lines (for example "Wifi", "Unlimited WiFi") by regex to one canonical id, with a category and a priority (1 = headline, 2 = notable, 3 = standard). Prose-derived amenities carry `source: "description"`. `data/amenities.json` lists categories, ids, listing counts and any unmapped raw lines. Property pages show priority-1/2 amenities first and the rest behind "Show all".

## 7. Architecture

```
data/raw/            cached Apify output + downloaded frames (source of truth)
data/curation.json   human layer: names, locations, heroes, copy
scripts/build-data.py   -> data/{properties,instagram-posts,amenities,business,media-manifest}.json + images
scripts/build-site.mjs  -> dist/ (pure template functions in templates/*.mjs)
scripts/validate.mjs    data integrity (fails on errors, warns on optional gaps)
scripts/qa*.mjs         Playwright QA
public/                 css, js, fonts, images copied into dist/
reports/                research, brand, media, listing and QA reports
```

- No framework and no runtime dependencies. Every page is pre-rendered HTML; `public/js/site.js` progressively enhances filters, the gallery/lightbox, the mobile nav and the WhatsApp enquiry. All pages work without JS.
- Pages: home, `/stays/` (collection, filters in the URL query), `/stays/<slug>/` × 31, `/about/`, `/enquire/`, `404.html`, `sitemap.xml`, `robots.txt`.
- Structured data: `VacationRental` on property pages, `LodgingBusiness` on the home page, populated only with facts from the dataset.

## 8. Design philosophy

The photography is the hero and the logo is the frame: white, ink and bronze UI, Cormorant Garamond + Hanken Grotesk, square photos, no boxes or ornament beyond the logo's diamond. Full system in `DESIGN.md`; how it was derived in `reports/brand-audit.md`.

## 9. Proposal mode

`PROPOSAL_MODE` (default on; `PROPOSAL_MODE=false npm run build` to disable) adds `<meta name="robots" content="noindex, nofollow">` to every page and `Disallow: /` to `robots.txt`. Nothing about proposal mode is visible on the pages themselves. No analytics or third-party scripts are included.

## 10. Known limitations

- Property names are descriptive labels; Durban Luxe publishes none.
- 12 of 31 "from" rates were published more than a year ago; they must be confirmed before launch.
- 9 listings are located only as "Dolphin Coast"; 1 has no bathroom count.
- No check-in times, house rules, cancellation or payment terms are public.
- No reviews exist in the source, so none are shown.
- No map: no coordinates are published, and area-level pins would add little over the location filter.
- WhatsApp is the only verified channel; voice calls and email are unconfirmed.

## 11. Refreshing inventory

1. Re-run the Apify scrape into `data/raw/posts.json` (only new posts are needed; keep existing ones).
2. Download new carousel frames into `data/raw/media/<shortcode>/`.
3. Add a `curation.json` entry per new post (a repeat of an existing home needs the merge extension described in §3). Set `status` for retired homes.
4. `npm run data && npm run validate && npm run build`, then run the QA scripts.

## 12. Future booking integration

The enquiry form already collects property, dates and guests, and hands them to one function in `public/js/site.js`. To integrate a booking engine or channel manager (for example NightsBridge, Lodgify or an OTA iCal feed):

- **Availability:** fetch per-property availability at build time (static JSON) or client-side from the provider's API. Only then show dates as available.
- **Booking:** replace the WhatsApp hand-off with a deep link to the provider's checkout for that property and date range, and keep WhatsApp as the secondary option.
- **Rates:** replace `priceFromZAR` with live rates from the provider; the validator's price rules still apply.

Until one of these exists, the site must keep treating every request as an enquiry.

# Research audit

What was researched, how, what was found, and what could not be verified. Extraction date: **2026-09-23**.

## 1. Tools

| Tool | Status | Used for |
|---|---|---|
| Apify (REST API with `APIFY_TOKEN`; CLI present but not logged in, OAuth deliberately not used) | Working | Instagram profile + all posts (`apify/instagram-scraper`), post lookups for stray URLs, Google search (`apify/google-search-scraper`) |
| Firecrawl CLI | Installed, **not authenticated** | Not used. There were no external booking pages or websites to crawl (see §4) |
| Agent Reach | **Not installed** | Not used. Google search via Apify covered the wider public-source check |
| design-taste-frontend, design-md | Available | Design read and DESIGN.md structure |
| Impeccable | Available | Detector scan + critique pass (see `final-qa.md`) |
| Playwright | Chromium installed during QA | Browser QA: `scripts/qa.mjs`, `scripts/qa-interactions.mjs` |
| img2threejs | Available | **Skipped on purpose.** 3D adds nothing to a photography-led rental site |

Cost control: the profile was scraped **once** (31 posts, full feed), plus one small lookup run for 2 stray URLs and one search run. Raw responses are cached in `data/raw/` so rebuilds never hit Apify.

## 2. Instagram extraction

| | |
|---|---|
| Profile | @durban_luxe, "Durban Luxe", 6,590 followers, 31 posts, public, not verified |
| Bio | "Luxury Holiday Homes in Durban, South Africa · Beachfront Villas • Family Getaways • Event Stays · Personal Concierge Service" |
| Bio link | WhatsApp: `wa.me/270837062601?countryCode=27&phoneNumber=0837062601` = **+27 83 706 2601** |
| Posts | 31, **all carousel (Sidecar)**, 479 frames, 8 May 2025 to 12 Sep 2026 |
| Reels / video | None |
| Tagged locations | None (location comes from caption text: "Located in …") |
| Pinned posts | None |
| Highlights | Not exposed by the scraper (`highlightReelCount: null`) |
| Alt text | Instagram's auto-generated alt only; not used (site alt text is written per image) |

Per post we saved id, shortcode, URL, date, caption, media type, all carousel image URLs in order, hashtags, mentions and alt text. See `data/instagram-posts.json` (normalised) and `data/raw/posts.json` (raw).

## 3. Classification

All 31 posts share one caption template:

```
Located in <place>
<1–3 paragraphs of description>
From R<rate> p/n · Minimum stay of 3 nights · Rate excl VAT
Amenities & Facilities
-<n> Bedrooms | <n> Beds | <n> Guests [| <n> Bathrooms]
-<amenity lines>
Services …
```

| Category | Posts |
|---|---|
| PROPERTY | 31 |
| PROPERTY UPDATE / GALLERY (repeat of a home) | 0 (see dedup in `listing-reconciliation.md`) |
| PROMOTION / RATE SPECIAL | 0 |
| REVIEW | 0 |
| BRAND / LIFESTYLE / DESTINATION / TEAM | 0 |
| BOOKING INFO | 0 (the booking method is only in the bio link) |

So the site has **no reviews, testimonials, team, awards or lifestyle content**, and none were invented. The homepage "view from here" section reuses property photography that shows the coast.

## 4. Outside Instagram

Google searches (via Apify) for `"Durban Luxe" holiday`, `"durban_luxe"`, `"Durban Luxe" airbnb OR booking.com OR lekkeslaap`, `"0837062601"` and `"083 706 2601"`:

- **No website, booking engine, Airbnb, Booking.com, LekkeSlaap or NightsBridge listing** was found for this business.
- "Durban Luxe" results are other, unrelated businesses (Luxe Morningside Boutique Hotel, Luxe on Ridge, Luxe Suites Boutique Hotel). **Do not confuse them.**
- Two Instagram URLs in the results belonged to other hosts (`homegroundescapes`, `oceanpearlluxury_`) and were excluded.
- No email address, street address, company registration, cancellation or payment policy is public.

## 5. Verified booking workflow

**WhatsApp is the verified channel** (the bio's only link). Instagram DM is implied by the platform. There is no availability calendar or booking engine, so the site:

- drafts a WhatsApp message (property, link, dates, nights, guests, optional name/note) that the visitor reviews and sends themselves;
- never shows "available", never confirms anything, and sends nothing automatically;
- lists the number as WhatsApp. Voice calls on the same number are **not** confirmed, so no "Call us" button.

## 6. Factual conflicts and gaps

| Item | Handling |
|---|---|
| WhatsApp link format `wa.me/270837062601` (country code + trunk 0) | Normalised to `wa.me/27837062601`; the link's own query string confirms 27 / 0837062601 |
| 12 rates published > 12 months ago | Shown as dated "from" rates, confirmed on enquiry. **Client should confirm before launch** |
| One listing says "Rate includes VAT", 30 say "excl VAT" | Shown per listing |
| Property names not published | Descriptive labels assigned (`nameSource` field); client to supply real names |
| 9 listings give only "Dolphin Coast" (no town) | Shown as Dolphin Coast; filterable under the region |
| Bathroom count missing for 1 listing | Omitted, not guessed |
| Check-in/out times, house rules, cancellation, deposits | Not published anywhere. Pages say "Not published. Ask Durban Luxe when you enquire." |
| No reviews | No review content or star ratings anywhere on the site |

## 7. Questions for Durban Luxe

1. Are all 31 homes still offered? Any to archive?
2. Preferred property names (or keep the descriptive labels?)
3. Are the 2025 rates still current as "from" prices?
4. Email address and whether the number takes calls.
5. Check-in/out times, deposit, cancellation and house rules to publish.
6. Towns for the 9 "Dolphin Coast" listings.
7. Permission to use guest reviews, if any exist off-Instagram.

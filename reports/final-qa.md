# Final QA

Run on 2026-09-23 against the built site (`npm run build` → `dist/`, served by `npm run serve`), headless Chromium via Playwright.

Reproduce:

```
npm run validate                    # data integrity
npm run build && npm run serve      # in one shell
node scripts/qa.mjs --shots         # pages × breakpoints, images, overflow, links → .qa/
node scripts/qa-interactions.mjs    # behaviour tests
```

## 1. Summary

| Suite | Result |
|---|---|
| Data validation | **Pass**. 31 properties, 478 images × 3 sizes, 72 amenities. 0 errors, 15 warnings (1 bathroom count unpublished, 12 rates over a year old, no public email) |
| Page sweep: all 36 pages at 375 and 1440 px, 7 key pages at 390/430/768/1024 | **100 page-width checks, 0 problems**: no horizontal overflow, no broken images, no console errors, one `h1` per page, alt on every image |
| Internal links | **113 unique links, 0 broken** |
| Proposal mode | `noindex, nofollow` on every page; `robots.txt` = `Disallow: /` |
| Interaction tests | **36 / 36 pass** |

## 2. Interaction tests

```
    PASS  collection shows all 31 stays  (31)
    PASS  location filter: Zimbali = 8  (8)
    PASS  URL reflects location  (http://localhost:4173/stays/?where=area%3Azimbali)
    PASS  combined filters: Zimbali + 8 guests + private pool = 6  (6)
    PASS  results status announces count  (Showing 6 of 31 stays in Zimbali)
    PASS  region selection includes its areas  (14)
    PASS  back button restores previous filter state  (area:zimbali / 6)
    PASS  deep link filters Ballito  (6)
    PASS  sort price ascending  (5000,5900,6000,7000,13000,14000)
    PASS  search "umdloti" finds 1  (1)
    PASS  empty state appears for no matches
    PASS  lightbox opens from keyboard
    PASS  body scroll locked while open
    PASS  ArrowRight advances image  (1 -> 2)
    PASS  ArrowLeft goes back
    PASS  focus trapped in lightbox
    PASS  Escape closes lightbox
    PASS  focus restored to opener
    PASS  scroll unlocked after close
    PASS  1-night stay shows minimum-stay heads-up (non-blocking)  (That's 1 night. The usual minimum is 3, but you can still ask.)
    PASS  submit opens wa.me with real number  (https://api.whatsapp.com/send/?phone=27837062601&text=Hi+Dur)
    PASS  draft names the property and guests  (Hi Durban Luxe, I'm interested in Christmas Bay Beachfront Villa. | http://localhost:4173/stays/christmas-bay-beachfront-villa/ |  | Check-in: Fri, 23 Oct 2026 )
    PASS  draft asks to confirm (no availability claim)
    PASS  mobile menu opens
    PASS  menu toggle aria-expanded=true
    PASS  Escape closes mobile menu
    PASS  filter drawer opens
    PASS  drawer locks scroll
    PASS  drawer apply button shows live count  (Show 6 stays)
    PASS  drawer closes, results filtered  (6)
    PASS  filter count badge
    PASS  mobile gallery counter present
    PASS  swiping strip updates counter  (3)
    PASS  action bar visible
    PASS  action bar compact (<= 80px)  (72px)
    PASS  no uncaught page errors
```

Tested areas: filters (location hierarchy, guests, bedrooms, rate, type, features), search, sorting, URL state and deep links, back/forward, empty state, lightbox (keyboard open, arrows, Escape, focus trap, focus return, scroll lock), WhatsApp draft (real number, property, dates, guests, no availability claim, nothing sent), mobile menu, mobile filter drawer (live count, scroll lock), mobile swipe gallery counter, sticky action bar.

## 3. Defects found and fixed in this pass

| # | Defect | Fix |
|---|---|---|
| 1 | **Horizontal page scroll on every home-page width.** The page scrolled sideways about 1,800 px on phones: visually-hidden text inside the "More from the collection" cards was `position: absolute` with no positioned ancestor, so it escaped the rail's scroll clipping | `.card` and `.rail` are now containing blocks (`position: relative`) |
| 2 | Property page, desktop: check-in/out date inputs overflowed the booking panel | Enquiry grid uses `minmax(0, 1fr)` columns, inputs `min-width: 0` |
| 3 | Mobile action bar: price wrapped onto 3 cramped lines | Two lines: "R15,000 / night" over "From · excl. VAT" |
| 4 | Collection rail on the home page started flush at the screen edge, ignoring the gutter: a list reset overrode the track padding | Track rule specificity raised |
| 5 | Enquiry form: a 1–2 night request gave no feedback about the 3-night minimum | Non-blocking heads-up in the hint ("That's 1 night. The usual minimum is 3, but you can still ask.") The host decides, so the enquiry is not blocked |

## 4. Design critique (Impeccable + design-taste-frontend)

> ⚠️ DEGRADED: single-context. Impeccable's critique normally runs two isolated sub-agent assessments. Sub-agents were not requested for this project, so the design review and detector pass ran in one context.

**Detector** (`impeccable detect` on home, collection, a property page, the stylesheet): no slop-category findings except one advisory ("hairline border + wide shadow" on the mobile action bar, now fixed by removing the shadow). Remaining warnings are false positives for this layout: "cramped padding" on sections whose top hairline is a deliberate divider with spacing above the heading, and "clipped positioned child" for the intentional `overflow-x: clip` on `body`.

**Verdict: does it feel like Durban Luxe, or a generic luxury Airbnb template?** It reads as Durban Luxe. The UI palette is the logo's own white, ink and bronze. The type echoes the wordmark. The square photography is shown at its native ratio with no overlays, and colour only ever comes from the homes. There are no card boxes, pills, glass, gold gradients or stock images. The collection feels curated (31 homes, editorial type) rather than a search engine.

| Area | Assessment |
|---|---|
| Brand authenticity | Strong. Every visual element traces to the logo or the feed (see `brand-audit.md`) |
| Typography | (Superseded by the later typography pass: Cormorant Garamond + Hanken Grotesk, see DESIGN.md §3) |
| Palette | Disciplined. Bronze is kept to hairlines, the diamond motif and feature tags |
| Image treatment | Photography leads every page; square native crops; hand-picked heroes |
| Cards / boxes | Cards are image + text on the page ground, with no borders. The only boxed element is the booking panel, which earns it |
| Filters | Generated from the data; the location hierarchy (region → area) works without knowing estate names |
| Price treatment | Honest: "From R… per night, excl. VAT", the publication date on the detail page, and "confirmed on enquiry" everywhere |
| CTAs | One label per intent: Check availability / WhatsApp / Explore stays |
| Mobile | Photo-first order, swipe gallery with counter, compact sticky action bar |

**Changed after critique:**
- "Why stay with Durban Luxe" used the stock *hero-metric* template (giant bronze numbers, small labels). It is now editorial hairline rows: a serif claim beside its verified fact.
- Removed the "FEATURED STAY" eyebrow label above the featured home; the heading carries itself.
- Footer logo was offset 12 px outside the content edge; it now aligns.
- About page said rates are "currently published"; now "published", because 12 are over a year old.

**Known, not changed:**
- The collection page is long on mobile (31 single-column cards). That is fine for 31 homes, and filters are one tap away.
- Property names are descriptive placeholders until Durban Luxe supplies real ones.
- Nine listings only say "Dolphin Coast". Better location data would sharpen the location filters.

## 5. Performance notes

- Home HTML 48 KB, CSS 36 KB, JS 20 KB (no framework, no third-party scripts, no analytics), 2 self-hosted WOFF2 fonts (49 KB total).
- Only the LCP hero loads eagerly (`fetchpriority="high"`). All other images are lazy with `srcset` 640/1024/1440 and explicit dimensions (no layout shift).
- The collection page loads one card image per listing. Galleries only load on property pages.

## 6. Not tested

- Real iOS Safari / Android Chrome devices (Chromium emulation only).
- Screen readers (structure, labels, live region and focus were tested programmatically, not with VoiceOver/NVDA).
- Dark mode was not visually reviewed.
- A real WhatsApp send. The test intercepts the `wa.me` URL and never sends.

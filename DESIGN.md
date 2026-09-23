# DESIGN.md — Durban Luxe

> A carefully curated Durban stay. The photography is the hero; the brand is the frame around it.

This system is derived from Durban Luxe's **actual** Instagram identity (see `reports/brand-audit.md`).
Everything marked *Existing* is observed on @durban_luxe; everything marked *Interpretation* is a new
website decision built on top of it.

---

## 1. Design read & dials

**Premium consumer hospitality, Instagram-first audience, calm editorial-coastal language.**

| Dial | Value | Why |
|---|---|---|
| Design variance | 6 | Editorial asymmetry in the homepage, disciplined grids in the catalogue |
| Motion intensity | 3 | Quiet reveals, image easing, lightbox transitions. The views do the moving |
| Visual density | 3 | Airy. One idea per section, photography given room |

## 2. Colour

*Existing:* the logo is black flared-serif capitals inside a thin **bronze** diamond frame on pure white.
*Existing:* the feed contains no text graphics or colour blocks. It is 100% bright, daylight architectural
photography: white walls, stone floors, timber decks, pool turquoise, Indian Ocean blue, coastal greens.

*Interpretation:* white/ink/bronze are the whole UI palette; blue and green are only ever supplied by photos.

| Token | Light | Dark | Role / source |
|---|---|---|---|
| `--paper` (background) | `#FCFCFB` | `#121211` | Logo ground (pure white, softened 1%) |
| `--surface` | `#F2F2F0` | `#1B1B19` | Cool stone. Sampled from the photos' tiles/walls (`#d3d0ca`), neutralised. **Not cream.** |
| `--ink` (primary / text) | `#141413` | `#EDEDEA` | Logo letterforms (`#0A0A0A` sampled) |
| `--muted` | `#5E5E5A` | `#A3A39E` | Secondary text. 6.4:1 on paper |
| `--bronze` (accent) | `#6C5424` | `#C9A96E` | Logo diamond frame (sampled `#685024`–`#705828`). 7.1:1 on paper |
| `--line` (border) | `#DAD9D4` | `#2E2E2B` | Hairlines |
| `--line-strong` | `#141413` | `#EDEDEA` | Active filters, focused inputs |
| `--whatsapp` | — | — | Not used. WhatsApp actions stay in brand ink; the icon identifies them |

Rules:
- **One accent.** Bronze is used for hairline ornaments, the diamond motif, prices and focus rings. Never for large fills, gradients or text blocks.
- **No gold gradients, no black-page luxury.** The page is light (dark mode follows the OS only).
- **Photos over flat colour.** A section that needs colour gets a photograph, not a tint.

## 3. Typography

*Existing:* the wordmark is classical capitals with flared, glyphic terminals (Trajan/Cinzel family feel).
*Interpretation:* **Cormorant Garamond** (variable 300–700, self-hosted WOFF2) for the editorial voice: it shares the
wordmark's classical, glyphic lineage and has a real weight range, so each serif role differs in weight as well as size.
**Hanken Grotesk** (quiet humanist grotesk) for everything functional. Instrument Serif was tested and rejected:
condensed and fashion-led, it fights the wide classical wordmark and gets cramped at card size.

Fluid scale (tokens in `:root`, all `clamp()`):

| Role | Token | Font | Size (≈375 → 1440px) | Weight | Line-height / tracking |
|---|---|---|---|---|---|
| Display (home hero only) | `--t-display` | Cormorant | 3.1 → 5.9rem | 400 | .94 / -0.028em, one `display__line` per phrase, never re-wrapped |
| Statement (brand line, enquiry close, footer) | `--t-statement` | Cormorant | 2.4 → 4.6rem | 400 | 1 / -0.022em |
| H1 (page / property title) | `--t-h1` | Cormorant | 2.6 → 4.5rem | 400 | 1 / -0.022em |
| Feature title (lead + featured property) | `--t-feature` | Cormorant | 2.3 → 3.9rem | 400 | 1 / -0.02em |
| H2 (section heading) | `--t-h2` | Cormorant | 2.1 → 3.5rem | 400 | 1.02 / -0.018em |
| H3 (sub-section, coast name, why-claim) | `--t-h3` | Cormorant | 1.6 → 2.1rem | 500 (claims 400) | 1.1 |
| Card title | `--t-card` | Cormorant | 1.35 → 1.55rem | **600** | 1.12 |
| Lede | `--t-lede` | Hanken | 1.06 → 1.25rem | 400 | 1.55, ≤ 42ch |
| Body | `--t-body` | Hanken | 1 → 1.0625rem | 400 | 1.65, ≤ 64ch |
| Specs / small | `--t-small` | Hanken | .875rem | 400 | "10 guests · 5 bedrooms · 6 baths" |
| Meta / label (location · type) | `--t-meta` | Hanken | .75rem | 500 | UPPERCASE, 0.1–0.12em, muted |
| Price | — | Hanken | .9375–1.125rem | 600 figure, 400 "From … / night" | tabular lining nums |

- Serif steps down in size and **up** in weight: small Cormorant is never thin.
- `text-wrap: balance` on all serif headings; `max-width` in `ch` on titles (property H1 16ch, statement 24ch, enquiry close 9ch).
- No eyebrow labels above headings. The meta label on cards and features is location/type data, not a kicker.
- No italics for decoration, no giant quote marks, no em-dashes in UI copy.

## 4. Grid & spacing

- Container: `min(100% - 2*gutter, 1320px)`; gutter `clamp(1rem, 4vw, 2.5rem)`; column gap `--col-gap` `clamp(1rem, 2.2vw, 2rem)`.
- 12-column editorial grid on desktop. Section compositions use it deliberately:
  hero copy 5 / photo 7 bleeding to the viewport edge (6/6 at 1024–1279); signature lead 7 + companions 5;
  statement title 10, body offset to cols 7–12; coasts 7 | gap | 4 staggered down; featured photo 7 | gap | text 4;
  why heading 4 (sticky) | claims 7; views mosaic 8 + 4 stacked, then 4/4/4; enquiry close 5 | form 6; footer line 8 + logo.
- Section heads: plain (`.section-head`) or split (`.section-head--split`: heading cols 1–7, context sentence/action cols 9–12, baseline-aligned).
- Vertical rhythm: `--section-lg` (5.5 → 11rem) for editorial transitions (statement, featured, enquiry close);
  `--section` (4.5 → 8.5rem) default; `--section-sm` (3.5 → 5.5rem) for catalogue/utility (collection rail, related, footer top);
  `--head-gap` (1.75 → 3.25rem) between a heading and its content. Card and control spacing stays in rem steps under 1.25rem.

## 5. Shape, elevation, ornament

- **Radius: 0 everywhere.** Square photos, square buttons, square inputs. (Echoes the diamond/line geometry; one shape system.)
- **Shadows: none** on content. Only floating layers (filter drawer, gallery "View all" button) get a tinted shadow `0 -8px 32px rgb(20 20 19 / .08)`. The mobile action bar uses a hairline top border only, never border + shadow together.
- **Ornament:** the logo's nested-diamond, drawn as a 45° rotated square outline in bronze. Used as list bullets in Highlights and as a section divider. Nowhere else.
- Cards are not boxes: an image, then text on the page ground. No card borders or backgrounds.

## 6. Photography rules

*Existing:* every source image is a 1440×1440 square carousel frame, bright, HDR-ish real-estate style.
- **Square is native.** Default frames are 1:1. The only non-square crops are the home hero (4:5 on desktop) and gallery lead (3:2), both with a per-image `object-position` focal point.
- Never upscale beyond 1440px. Full-bleed edge-to-edge photos are avoided on wide screens because they would upscale.
- Derivatives: WebP 640 / 1024 / 1440 with `srcset` + `sizes`, explicit width/height, `loading="lazy"` except the LCP image (`fetchpriority="high"` + preload).
- No filters, no overlays, no text on top of photos. Captions sit below.
- Hero per property is hand-picked (see `reports/media-reconciliation.md`).

## 7. Components

**Buttons** — rectangular, 48px min height.
- Primary: ink fill, paper text. Hover: bronze fill.
- Secondary: 1px ink outline, ink text. Hover: ink fill.
- Text link: underline offset 0.25em, bronze underline on hover.
- One label per intent sitewide: **"Check availability"** (enquiry), **"WhatsApp"** (direct chat), **"Explore stays"** (catalogue).

**Navigation** — 72px bar, logo wordmark left, 3 links + WhatsApp right. Mobile: wordmark + menu button → full-height sheet. Sticky with hairline bottom after scroll. `aria-current="page"` on active.

**Property card** — square image → LOCATION · TYPE meta → name (Cormorant 600) → "8 guests · 4 bedrooms · 4 baths" (small, muted) → up to 2 bronze differentiators → price on its own hairline at the card foot. Whole card is one link. `card--compact` (home companions) drops the differentiators so the lead stay keeps the hierarchy.

**Filters** — desktop: search + sort row, then Location (region → area), Guests, Bedrooms, Nightly rate (a min–max range: two typed boxes that accept "6,500" / "R6500" and apply on Enter or blur, over a two-handle slider in R100 steps with square ink handles on a hairline track; bounds come from the data; URL `pmin`/`pmax`, legacy `price` = max), Type, and feature chips (Private pool, Sea view, Beach access, Beachfront), each generated from the dataset; mobile: "Filters (n)" button opens a bottom drawer (dialog) with the same controls and a "Show n stays" button. All state is in the URL query.

**Forms** — label above input; 48px inputs; 1px `--line` border, ink on focus, 2px bronze focus ring offset 2px. Helper text below. Enquiry forms never say "available"; submit label is "Check availability" and the helper says it opens WhatsApp.

**Gallery** — desktop: lead image (2/3 width) + 4 tiles and a "View all n photos" button; mobile: swipeable scroll-snap strip with "3 / 20" counter. Fullscreen lightbox: `<dialog>`, arrows, Esc, swipe, focus trap, focus return, body scroll lock.

**Mobile action bar** — fixed bottom on property pages < 1024px: two-line price left ("R15,000 / night" over "From · excl. VAT"), WhatsApp icon button, "Check availability". Content gets matching bottom padding.

**Claim rows** (home "Why stay") — never big-number stat tiles. Each row: a Cormorant claim at H3 size beside its verified fact in small muted text, hairline-separated, ink rule on top.

**Destination index** (home coasts) — areas are a typographic list, not chips: name left, "n stays" right, hairlines between, ink rule on top.

**Footer** — an editorial endpoint: the bio line set at H2 size with the diamond logo, an ink rule, then the Stay / Contact index, then the small print.

**No eyebrow labels** above headings. The heading carries the section.

## 8. Motion

- Easing `cubic-bezier(.2,.7,.2,1)`, 240–600ms.
- Sections fade/rise 16px once when entering the viewport (IntersectionObserver).
- Card images scale to 1.03 over 900ms on hover.
- Everything is disabled under `prefers-reduced-motion: reduce`.

## 9. Voice

*Existing:* captions open with "Located in …", use hospitality clichés ("epitome of coastal luxury"), a list of
Airbnb-style amenities, and "From R… p/n · Minimum stay of 3 nights · Rate excl VAT".
*Interpretation:* keep the plainness and the facts, drop the superlatives. Short sentences, local nouns (braai,
Dolphin Coast, Zimbali), prices written "From R6,500 per night, excl. VAT".

## 10. Responsive checkpoints

375 · 390 · 430 · 768 · 1024 · 1440 · 1920. Mobile priority order on property pages: photos → name → area → price →
guests/beds/baths → Check availability → gallery → amenities.

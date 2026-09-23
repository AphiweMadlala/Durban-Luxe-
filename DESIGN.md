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
*Interpretation:* **Marcellus** (flared glyphic serif, closest open-licence match to the wordmark's terminals)
for display; **Hanken Grotesk** (quiet humanist grotesk) for everything functional.

| Role | Font | Size (clamp) | Case / tracking | Weight |
|---|---|---|---|---|
| Display XL (home hero) | Marcellus | 2.5 → 4.25rem | Sentence case, -0.01em | 400 |
| H1 (property name) | Marcellus | 2.1 → 3.25rem | Sentence case | 400 |
| H2 (section) | Marcellus | 1.6 → 2.4rem | Sentence case | 400 |
| H3 / card name | Marcellus | 1.2 → 1.4rem | Sentence case | 400 |
| Label | Hanken Grotesk | 0.75rem | UPPERCASE, 0.14em | 500 |
| Body | Hanken Grotesk | 1rem / 1.065rem | 1.65 line-height, ≤ 64ch | 400 |
| Small / meta | Hanken Grotesk | 0.875rem | — | 400/500 |
| Price | Hanken Grotesk | 1rem–1.35rem | tabular nums | 600 |

- Marcellus has one weight: hierarchy comes from size and space, never bold serif.
- Uppercase labels are rationed (≤ 1 per 3 sections on the homepage). The logo already owns the capitals voice.
- No italics for decoration, no giant quote marks, no em-dashes in UI copy.

## 4. Grid & spacing

- Container: `min(100% - 2*gutter, 1320px)`; gutter `clamp(1rem, 4vw, 2.5rem)`.
- 12-column grid on ≥ 1024px, 6 on tablet, single column < 768px.
- Space scale (rem): 0.25 · 0.5 · 0.75 · 1 · 1.5 · 2 · 3 · 4 · 6 · 8.
- Section rhythm: `clamp(4rem, 9vw, 8rem)` vertical padding.

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

**Property card** — square image → area / type label → name (Marcellus) → "8 guests · 4 bedrooms · 4 baths" → up to 2 differentiators → price line. Whole card is one link.

**Filters** — desktop: search + sort row, then Location (region → area), Guests, Bedrooms, Nightly rate, Type, and feature chips (Private pool, Sea view, Beach access, Beachfront), each generated from the dataset; mobile: "Filters (n)" button opens a bottom drawer (dialog) with the same controls and a "Show n stays" button. All state is in the URL query.

**Forms** — label above input; 48px inputs; 1px `--line` border, ink on focus, 2px bronze focus ring offset 2px. Helper text below. Enquiry forms never say "available"; submit label is "Check availability" and the helper says it opens WhatsApp.

**Gallery** — desktop: lead image (2/3 width) + 4 tiles and a "View all n photos" button; mobile: swipeable scroll-snap strip with "3 / 20" counter. Fullscreen lightbox: `<dialog>`, arrows, Esc, swipe, focus trap, focus return, body scroll lock.

**Mobile action bar** — fixed bottom on property pages < 1024px: two-line price left ("R15,000 / night" over "From · excl. VAT"), WhatsApp icon button, "Check availability". Content gets matching bottom padding.

**Claim rows** (home "Why stay") — never big-number stat tiles. Each row: a Marcellus claim beside its verified fact in muted body text, hairline-separated, ink rule on top.

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

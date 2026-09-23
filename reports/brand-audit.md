# Brand audit

Source: the @durban_luxe profile image (1080 px), the 31-post grid and all 479 carousel frames (reviewed on contact sheets in `data/raw/sheets/`). Colour values were sampled with Pillow.

Every point is marked **EXISTING** (observed on Instagram) or **INTERPRETATION** (a new website decision).

## 1. Logo — EXISTING

- Wordmark "DURBAN / LUXE" on two lines in **black, classical capitals with flared, glyphic terminals** (Trajan/Cinzel family feel). The "X" of LUXE has a calligraphic swash.
- Set inside a **thin bronze diamond frame**, with a small nested-diamond ornament at the top.
- Pure white ground.
- Sampled colours: letterforms `#0A0A0A`; diamond frame `#685024` to `#705828` (a dark, desaturated bronze, **not** yellow gold).

## 2. Feed and graphics — EXISTING

- **No text graphics at all:** no quote cards, rate cards, promo tiles, story templates or branded overlays. The feed is 100% photography.
- So there is **no brand typography or colour system beyond the logo** to extract. Recurring colours come from the homes themselves.
- Grid rhythm: every post is a square 1440 × 1440 carousel with 9 to 20 frames. It opens with an exterior or view shot and moves through living, kitchen, bedrooms and bathrooms.

## 3. Photography — EXISTING

- Professional real-estate style: bright daylight, lifted shadows, slightly HDR, verticals mostly corrected, wide lens.
- Palette in the photos: white render and walls, pale stone and tile (sampled around `#d3d0ca`), timber decks, pool turquoise, Indian Ocean blue, subtropical greens (palms, strelitzia, milkwood), and the occasional sunset orange.
- Architecture: contemporary coastal villas (flat roofs, glass sliders, timber screens), estate homes in Zimbali, beachfront apartments.
- Lifestyle cues are staged, not people-led: set tables, sun loungers, pool floats. People are never the subject.

## 4. Voice — EXISTING

- Captions open with **"Located in <place>"**. They are factual and list-heavy, closer to an Airbnb listing than an editorial voice.
- Some stock hospitality phrases ("true gem", "epitome of coastal luxury").
- The bio positions the business as **"Luxury Holiday Homes · Beachfront Villas • Family Getaways • Event Stays · Personal Concierge Service"**.
- Local nouns: braai, Dolphin Coast, Zimbali, Umhlanga, King Shaka International Airport.
- Emojis in 1 caption out of 31, and no hashtags at all. The pricing line is always **"From R… p/n · Minimum stay of 3 nights · Rate excl VAT"** (one listing says "Rate includes VAT").

## 5. Luxury and local cues — EXISTING

- Luxury comes from **the homes** (views, private pools, architecture) and the words "Luxe" and "Concierge", not from graphic styling.
- Local identity is **the KZN north coast**: Dolphin Coast estates plus Umhlanga and Durban.

---

## Website interpretation — INTERPRETATION

| Decision | Derived from |
|---|---|
| UI palette = white `#FCFCFB` / ink `#141413` / bronze `#6C5424`; blue and green only ever come from photos | Logo colours; feed has no other brand colours |
| Bronze is used only for hairlines, the diamond motif, feature tags, focus rings and the primary button's hover state; never large fills or gradients | Logo uses bronze as a thin frame only |
| Display font **Cormorant Garamond** (classical glyphic serif, variable weight; replaced Marcellus in the typography pass) | Shares the wordmark's classical lineage; its weight range gives each serif role its own voice |
| Body font **Hanken Grotesk** | Quiet, legible support that doesn't compete with the serif |
| Radius 0, square photos, square buttons | Square Instagram frames + diamond/line geometry of the logo |
| Diamond ornament as list bullets and one divider | The nested-diamond ornament in the logo |
| Photography uncropped where possible (1:1 native), no overlays or text on photos | Feed is square and text-free |
| Copy: keep the facts and "From R… per night, excl. VAT" plainness; drop superlatives | Caption voice |
| Light theme only by default; dark mode follows the OS | White logo ground; no dark imagery in the feed |

**Avoided on purpose:** black-and-gold luxury, beige/cream templates, Playfair + Montserrat, glassmorphism, pill buttons, stock imagery, invented testimonials or awards.

Full token and component spec: `DESIGN.md`.

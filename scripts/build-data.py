#!/usr/bin/env python3
"""Build the canonical Durban Luxe dataset from raw Apify Instagram output.

Inputs  : data/raw/posts.json, data/raw/profile.json (Apify apify/instagram-scraper)
          data/raw/media/<shortcode>/NN.jpg (downloaded carousel images, 1-based order)
          data/curation.json (human curation: names, location hierarchy, hero, copy)
Outputs : data/instagram-posts.json, data/properties.json, data/amenities.json,
          data/business.json, data/media-manifest.json,
          public/images/properties/<slug>/NN-<w>.webp, public/images/brand/*

Facts (beds/baths/guests/rates/amenities) are parsed from captions, never typed by hand.
Run: python3 scripts/build-data.py [--skip-images]
"""
import hashlib, json, re, sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT_IMG = ROOT / "public" / "images" / "properties"
WIDTHS = [640, 1024, 1440]
SKIP_IMAGES = "--skip-images" in sys.argv
EXTRACTED_AT = "2026-09-23"

# ---------------------------------------------------------------- taxonomy
# (id, label, category, priority 1=headline 2=notable 3=standard, [regex on normalised amenity line])
TAXONOMY = [
    ("private-pool", "Private pool", "water", 1, [r"^private (outdoor )?pool"]),
    ("saltwater-pool", "Saltwater pool", "water", 2, [r"saltwater"]),
    ("shared-pool", "Shared pool", "water", 2, [r"^shared pool"]),
    ("pool", "Pool", "water", 2, [r"^pool$"]),
    ("private-beach-access", "Private beach access", "water", 1, [r"^private beach access"]),
    ("beach-access", "Beach access", "water", 1, [r"^beach access", r"^shared beach access"]),
    ("lake-access", "Lake access", "water", 3, [r"^lake access"]),
    ("waterfront", "Waterfront", "views", 1, [r"^waterfront"]),
    ("sea-view", "Sea view", "views", 1, [r"^sea views?", r"^beach view"]),
    ("golf-view", "Golf course view", "views", 2, [r"golf course view"]),
    ("garden-view", "Garden view", "views", 3, [r"^garden view"]),
    ("valley-view", "Valley view", "views", 3, [r"^valley view"]),
    ("pool-view", "Pool view", "views", 3, [r"^pool view"]),
    ("wifi", "Wi-Fi", "essentials", 2, [r"wifi", r"wi-fi"]),
    ("ethernet", "Ethernet connection", "essentials", 3, [r"ethernet"]),
    ("air-conditioning", "Air conditioning", "essentials", 1, [r"air conditioning", r"central cooling"]),
    ("heating", "Heating", "essentials", 3, [r"^heating", r"central heating"]),
    ("ceiling-fans", "Ceiling fans", "essentials", 3, [r"ceiling fan", r"portable fan"]),
    ("washer-dryer", "Washer & dryer", "essentials", 2, [r"washer", r"dryer & washer"]),
    ("drying-rack", "Drying rack", "essentials", 3, [r"drying rack"]),
    ("full-kitchen", "Fully equipped kitchen", "kitchen", 2, [r"fully equipped kitchen"]),
    ("cooking-basics", "Cooking basics", "kitchen", 3, [r"cooking basics", r"dishes & silverware"]),
    ("dishwasher", "Dishwasher", "kitchen", 2, [r"dishwasher"]),
    ("coffee-maker", "Coffee maker", "kitchen", 3, [r"coffee maker"]),
    ("essentials", "Essentials (towels, linen, toiletries)", "essentials", 3, [r"^essentials$", r"bed linens", r"extra pillows"]),
    ("room-darkening", "Room-darkening shades", "comfort", 3, [r"room darkening"]),
    ("walk-in-closet", "Walk-in closet", "comfort", 3, [r"walk in closet"]),
    ("indoor-fireplace", "Indoor fireplace", "comfort", 2, [r"indoor fireplace"]),
    ("workspace", "Dedicated workspace", "comfort", 2, [r"dedicated workspace"]),
    ("safe", "In-unit safe", "security", 3, [r"^safe$"]),
    ("smart-tv", "TV with streaming", "entertainment", 2, [r"netflix", r"premium cable", r"standard cable"]),
    ("netflix", "Netflix", "entertainment", 3, [r"netflix"]),
    ("amazon-prime", "Amazon Prime", "entertainment", 3, [r"amazon prime"]),
    ("dstv", "DStv", "entertainment", 3, [r"dstv"]),
    ("sound-system", "Sound system", "entertainment", 3, [r"sound ?system", r"soundbar", r"marshall"]),
    ("pool-table", "Pool table", "entertainment", 2, [r"^pool table"]),
    ("ping-pong", "Ping-pong table", "entertainment", 3, [r"ping pong"]),
    ("mini-golf", "Mini golf", "entertainment", 3, [r"mini golf"]),
    ("board-games", "Board games", "entertainment", 3, [r"board games"]),
    ("books", "Books & reading material", "entertainment", 3, [r"reading material"]),
    ("exercise-equipment", "Exercise equipment", "building", 3, [r"exercise equipment"]),
    ("gym", "Gym", "building", 2, [r"^gym$", r"shared gym"]),
    ("lift", "Lift", "building", 2, [r"elevator"]),
    ("resort-access", "Resort access", "building", 2, [r"resort access"]),
    ("private-entrance", "Private entrance", "building", 3, [r"private entrance"]),
    ("balcony", "Balcony", "outdoor", 2, [r"balcony"]),
    ("patio", "Patio", "outdoor", 2, [r"patio"]),
    ("garden", "Garden / backyard", "outdoor", 2, [r"backyard"]),
    ("braai", "Braai / BBQ", "outdoor", 1, [r"bbq grill", r"^private bbq"]),
    ("outdoor-dining", "Outdoor dining area", "outdoor", 3, [r"outdoor dining"]),
    ("outdoor-furniture", "Outdoor furniture", "outdoor", 3, [r"outdoor furniture"]),
    ("sun-loungers", "Sun loungers", "outdoor", 3, [r"sun loungers"]),
    ("outdoor-kitchen", "Outdoor kitchen", "outdoor", 2, [r"outdoor kitchen"]),
    ("outdoor-shower", "Outdoor shower", "outdoor", 3, [r"outdoor shower"]),
    ("fire-pit", "Fire pit", "outdoor", 2, [r"fire ?pit"]),
    ("hammock", "Hammock", "outdoor", 3, [r"hammock"]),
    ("beach-essentials", "Beach essentials", "outdoor", 3, [r"beach essentials"]),
    ("parking", "Parking on premises", "parking", 1, [r"parking on premises", r"^parking$", r"parking spaces"]),
    ("secure-parking", "Secure parking", "parking", 1, [r"safe parking"]),
    ("street-parking", "Free street parking", "parking", 3, [r"street parking"]),
    ("cot", "Cot / crib", "family", 2, [r"crib"]),
    ("high-chair", "High chair", "family", 3, [r"high chair"]),
    ("childrens-books-toys", "Children's books & toys", "family", 3, [r"children'?s? books"]),
    ("window-guards", "Window guards", "family", 3, [r"window guards", r"fireplace guards"]),
    ("smoke-alarm", "Smoke alarm", "safety", 3, [r"smoke alarm"]),
    ("co-alarm", "Carbon monoxide alarm", "safety", 3, [r"carbon monoxide"]),
    ("fire-extinguisher", "Fire extinguisher", "safety", 3, [r"fire extinguisher"]),
    ("first-aid", "First aid kit", "safety", 3, [r"first aid"]),
    ("laundromat-nearby", "Laundromat nearby", "nearby", 3, [r"laundromat"]),
]
IGNORED = [r"utensils$"]  # folded into braai
CATEGORIES = [
    ("water", "Pool & beach"), ("views", "Views"), ("outdoor", "Outdoor living"),
    ("essentials", "Essentials"), ("kitchen", "Kitchen"), ("comfort", "Comfort"),
    ("entertainment", "Entertainment"), ("family", "Family"), ("building", "Building & estate"),
    ("parking", "Parking"), ("security", "Security"), ("safety", "Safety"), ("nearby", "Nearby"),
]
# Prose-derived amenities: (id, regex on caption prose). Recorded with source "description".
PROSE = [
    ("sea-view", r"sea views?|sea and golf course views|ocean views?|views of the (indian )?ocean|oceanic views|view of the ocean|ocean-facing|180° sea view|breaker sea"),
    ("beachfront", r"beachfront|right on the beach|villa on the beach|on the pristine sands"),
    ("beach-access", r"direct access to the beach|direct beach access|direct entry to the beach"),
    ("private-pool", r"private pool|private swimming pool"),
    ("backup-power", r"solar-powered"),
    ("security-24h", r"24-hour security"),
    ("lift", r"lift access"),
    ("braai", r"gas braai|braai area"),
    ("dishwasher", r"dishwasher"),
    ("indoor-fireplace", r"fireplace"),
    ("parking", r"parking bays|garages?\b"),
]
EXTRA_DEFS = {
    "beachfront": ("Beachfront", "water", 1),
    "backup-power": ("Solar power (backup)", "essentials", 1),
    "security-24h": ("24-hour security", "security", 1),
}
SERVICES = [
    ("host-greets", "Host greets you", r"host'?s? greets"),
    ("self-check-in", "Self check-in", r"self[- ]check[- ]?in"),
    ("lockbox", "Lockbox", r"lockbox"),
    ("luggage-dropoff", "Luggage drop-off", r"luggage drop ?off"),
    ("housekeeping", "Housekeeping available", r"housekeeping|cleaning available"),
    ("long-stays", "Long stays welcome", r"long term stay"),
    ("pets-allowed", "Pets allowed", r"pets allowed"),
    ("building-staff", "Building staff", r"building staff"),
]


def norm(s):
    return re.sub(r"\s+", " ", s.strip().lstrip("-").strip().lower())


def split_caption(cap):
    head, _, rest = cap.partition("Amenities & Facilities")
    m = re.search(r"\n\s*Services:?\s*\n", rest, re.I)
    amen, services = (rest[: m.start()], rest[m.end():]) if m else (rest, "")
    return head, amen, services


def parse_counts(amen):
    line = next(l for l in amen.split("\n") if "|" in l)
    out = {}
    for label, key in [("bedroom", "bedrooms"), ("bath", "bathrooms"), ("bed", "beds"), ("guest", "guests")]:
        m = re.search(r"([\d.]+)\+?\s*" + label + r"s?\b", line, re.I)
        if m and key not in out:
            out[key] = float(m.group(1)) if "." in m.group(1) else int(m.group(1))
    out["guestsPlus"] = bool(re.search(r"\d\+\s*guests", line, re.I))
    out["_line"] = line.strip().lstrip("-").strip()
    return out


def parse_rate(head):
    m = re.search(r"From\s+R\s?([\d,]+)\s*p/n", head, re.I)
    vat = "incl" if re.search(r"rate includes vat", head, re.I) else ("excl" if re.search(r"excl\.? ?vat", head, re.I) else None)
    ms = re.search(r"Minimum stay of (\d+)", head, re.I)
    return (int(m.group(1).replace(",", "")) if m else None), vat, (int(ms.group(1)) if ms else None), (m.group(0) if m else None)


def location_line(head):
    return head.strip().split("\n")[0].strip()


def map_amenities(amen_text):
    found, unmapped = {}, []
    for raw in amen_text.split("\n"):
        l = norm(raw)
        if not l or "|" in l:
            continue
        hit = False
        for aid, label, cat, pri, pats in TAXONOMY:
            if any(re.search(p, l) for p in pats):
                found.setdefault(aid, raw.strip().lstrip("-").strip())
                hit = True
        if not hit and not any(re.search(p, l) for p in IGNORED):
            unmapped.append(l)
    # a private pool implies "pool"; do not keep generic duplicates
    if "private-pool" in found:
        found.pop("pool", None)
    if "private-beach-access" in found:
        found.pop("beach-access", None)
    return found, unmapped


def main():
    posts = json.load(open(RAW / "posts.json"))
    profile = json.load(open(RAW / "profile.json"))[0]
    cur = json.load(open(ROOT / "data" / "curation.json"))["properties"]
    posts.sort(key=lambda p: p["timestamp"])
    tax = {t[0]: {"label": t[1], "category": t[2], "priority": t[3]} for t in TAXONOMY}
    for k, (label, cat, pri) in EXTRA_DEFS.items():
        tax[k] = {"label": label, "category": cat, "priority": pri}

    ig_posts, props, manifest, all_unmapped, usage = [], [], [], {}, {}
    for p in posts:
        sc = p["shortCode"]
        c = cur[sc]
        head, amen, services_txt = split_caption(p["caption"])
        counts = parse_counts(amen)
        rate, vat, min_stay, rate_raw = parse_rate(head)
        amap, unmapped = map_amenities(amen)
        if unmapped:
            all_unmapped[sc] = unmapped
        prose = head.lower()
        amen_sources = {k: "amenity-list" for k in amap}
        for aid, rx in PROSE:
            if aid not in amap and re.search(rx, prose):
                amap[aid] = re.search(rx, prose).group(0)
                amen_sources[aid] = "description"
        if "private-pool" in amap:
            amap.pop("pool", None); amen_sources.pop("pool", None)
        if "private-beach-access" in amap:
            amap.pop("beach-access", None); amen_sources.pop("beach-access", None)
        services = [{"id": sid, "label": lab, "source": re.search(rx, services_txt, re.I) and
                     re.search(r"[^\n]*" + rx + r"[^\n]*", services_txt, re.I).group(0).strip().lstrip("-").strip()}
                    for sid, lab, rx in SERVICES if re.search(rx, services_txt, re.I)]
        ls = re.search(r"long term stays? allowed\s*\(?\s*(\d+)\s*days", services_txt, re.I)

        bathrooms = counts.get("bathrooms")
        baths_src = "caption amenity line"
        if bathrooms is None and c.get("bathroomsFromDescription"):
            bathrooms, baths_src = c["bathroomsFromDescription"], "caption description"
        slug = c["slug"]

        # -------- media
        exclude = set(c.get("exclude", []))
        n = len(p["childPosts"])
        gallery = []
        for i in range(1, n + 1):
            src = RAW / "media" / sc / f"{i:02d}.jpg"
            entry = {
                "property": slug, "post": sc, "carouselIndex": i,
                "sourceFile": str(src.relative_to(ROOT)),
                "sourcePermalink": p["url"],
                "bytes": src.stat().st_size,
                "sha1": hashlib.sha1(src.read_bytes()).hexdigest(),
                "included": i not in exclude,
                "excludedReason": "near-duplicate of previous frame" if i in exclude else None,
            }
            manifest.append(entry)
            if i in exclude:
                continue
            gallery.append(i)
        images = []
        for order, i in enumerate(gallery, 1):
            images.append({
                "src": f"images/properties/{slug}/{order:02d}",
                "width": 1440, "height": 1440, "carouselIndex": i,
                "hero": i == c["heroIndex"],
            })
            for m in manifest:
                if m["post"] == sc and m["carouselIndex"] == i:
                    m["output"] = [f"public/images/properties/{slug}/{order:02d}-{w}.webp" for w in WIDTHS]
                    m["hero"] = i == c["heroIndex"]
        hero = next(im for im in images if im["hero"])

        posted = p["timestamp"][:10]
        features = {
            "seaView": ("sea-view" in amap) or None,
            "waterfront": ("waterfront" in amap) or None,
            "beachfront": ("beachfront" in amap) or None,
            "beachAccess": any(k in amap for k in ("beach-access", "private-beach-access")) or None,
            "pool": any(k in amap for k in ("pool", "private-pool", "shared-pool")) or None,
            "privatePool": ("private-pool" in amap) or None,
            "jacuzzi": None,
            "balcony": ("balcony" in amap) or None,
            "airConditioning": ("air-conditioning" in amap) or None,
            "wifi": ("wifi" in amap) or None,
            "backupPower": ("backup-power" in amap) or None,
            "kitchen": any(k in amap for k in ("full-kitchen", "cooking-basics")) or None,
            "braai": ("braai" in amap) or None,
            "security": ("security-24h" in amap) or None,
            "parking": any(k in amap for k in ("parking", "secure-parking", "street-parking")) or None,
            "petsAllowed": any(s["id"] == "pets-allowed" for s in services) or None,
        }
        for k in amap:
            usage[k] = usage.get(k, 0) + 1
        amen_list = sorted(
            [{"id": k, "label": tax[k]["label"], "category": tax[k]["category"], "priority": tax[k]["priority"],
              "source": amen_sources[k], "raw": amap[k]} for k in amap],
            key=lambda a: (a["priority"], a["label"]))
        prop = {
            "id": f"dl-{sc}",
            "slug": slug,
            "name": c["name"],
            "nameSource": "descriptive label assigned for this proposal (Durban Luxe publishes no property names)",
            "shortName": c["name"],
            # Curation may override status (e.g. "archived" once Durban Luxe confirms a home has left).
            "status": c.get("status", "active"),
            "statusBasis": c.get("statusBasis") or f"Currently published on the live @durban_luxe feed (checked {EXTRACTED_AT}); no retirement, sold-out or unavailable signals found. Availability is NOT verified.",
            "propertyType": c["propertyType"],
            "location": location_line(head),
            "region": c["region"], "area": c["area"], "suburb": c["suburb"],
            "developmentOrBuilding": c["development"],
            "latitude": None, "longitude": None,
            "locationPrivacy": "Area-level only. Durban Luxe publishes no street addresses.",
            "nearby": [x for x in [c.get("airportNote")] if x],
            "priceFromZAR": rate,
            "priceUnit": "night",
            "priceType": "from-rate",
            "priceVat": vat,
            "priceOnRequest": rate is None,
            "pricePublishedAt": posted,
            "priceNotes": f"Published as '{rate_raw}' on {posted}, {'incl.' if vat == 'incl' else 'excl.'} VAT, minimum {min_stay} nights. A 'from' rate — seasonal/date pricing is confirmed on enquiry.",
            "bedrooms": counts.get("bedrooms"),
            "bathrooms": bathrooms,
            "bathroomsSource": baths_src if bathrooms is not None else None,
            "beds": counts.get("beds"),
            "guests": counts.get("guests"),
            "guestsPlus": counts["guestsPlus"],
            "guestsNote": c.get("guestsNote"),
            "parking": 3 if re.search(r"3 parking spaces", amen, re.I) else None,
            "summary": c["summary"],
            "description": c["description"],
            "highlights": c["highlights"],
            "amenities": amen_list,
            "services": services,
            "features": features,
            "checkIn": "", "checkOut": "",
            "minimumStay": min_stay,
            "longStayFromNights": int(ls.group(1)) if ls else None,
            "houseRules": [],
            "images": images,
            "hero": hero["src"],
            "video": None,
            "instagramPosts": [sc],
            "bookingUrl": "",
            "whatsappUrl": "https://wa.me/27837062601",
            "sourceUrls": [p["url"]],
            "sourceCaptionCounts": counts["_line"],
            "curationNotes": c.get("notes", []),
            "lastVerifiedAt": EXTRACTED_AT,
            "confidence": "high" if all(counts.get(k) for k in ("bedrooms", "guests")) and rate else "medium",
        }
        props.append(prop)
        ig_posts.append({
            "id": p["id"], "shortcode": sc, "url": p["url"], "date": p["timestamp"],
            "caption": p["caption"], "mediaType": p["type"],
            "imageUrls": [ch["displayUrl"] for ch in p["childPosts"]],
            "carouselCount": n, "dimensions": [p.get("dimensionsWidth"), p.get("dimensionsHeight")],
            "reelCover": None, "videoUrl": None,
            "taggedLocation": p.get("locationName"),
            "hashtags": p.get("hashtags", []), "mentions": p.get("mentions", []),
            "alt": [ch.get("alt") for ch in p["childPosts"]],
            "likes": p.get("likesCount"), "comments": p.get("commentsCount"),
            "classification": "PROPERTY",
            "propertyId": prop["id"],
            "latestComments": [{"user": cm.get("ownerUsername"), "text": cm.get("text")} for cm in p.get("latestComments") or []],
        })

    # --------- validate uniqueness early
    assert len({x["slug"] for x in props}) == len(props), "duplicate slug"

    amen_out = {
        "categories": [{"id": cid, "label": lab} for cid, lab in CATEGORIES],
        "amenities": [{"id": k, **v, "listings": usage.get(k, 0)} for k, v in sorted(tax.items(), key=lambda kv: (kv[1]["priority"], kv[0])) if usage.get(k)],
        "services": [{"id": s[0], "label": s[1]} for s in SERVICES],
        "normalisationNotes": "Raw caption lines (e.g. 'Wifi', 'Unlimited WiFi', 'Tv with standard cable & WiFi') map to one canonical id via regex (scripts/build-data.py TAXONOMY). Prose-derived amenities carry source='description'.",
        "unmappedRawLines": all_unmapped,
    }
    business = {
        "officialName": profile["fullName"],
        "instagram": {"handle": "@durban_luxe", "url": "https://www.instagram.com/durban_luxe/", "followers": profile["followersCount"], "posts": profile["postsCount"], "igUserId": profile["id"]},
        "bio": profile["biography"],
        "positioning": ["Luxury Holiday Homes in Durban, South Africa", "Beachfront Villas • Family Getaways • Event Stays", "Personal Concierge Service"],
        "whatsapp": {
            "display": "+27 83 706 2601",
            "e164": "+27837062601",
            "url": "https://wa.me/27837062601",
            "source": "Instagram bio link",
            "sourceRawUrl": profile["externalUrl"],
            "note": "The bio link is wa.me/270837062601 (country code + trunk 0). Its own query string states countryCode=27, phoneNumber=0837062601; the site uses the standard international form wa.me/27837062601 for the same number.",
        },
        "phone": {"display": "+27 83 706 2601", "tel": "tel:+27837062601", "source": "Same number as the WhatsApp bio link; voice use not separately confirmed."},
        "email": None,
        "website": None,
        "bookingPlatforms": [],
        "bookingMethod": "Direct enquiry via WhatsApp (bio link) and Instagram DM. No public booking engine, OTA listing or availability calendar was found.",
        "serviceArea": sorted({x["region"] for x in props}),
        "address": None,
        "ratesPolicy": "All listings publish a 'From R… p/n' rate, a 3-night minimum stay, and (30 of 31) 'Rate excl VAT'.",
        "cancellationPolicy": None,
        "paymentPolicy": None,
        "logo": "public/images/brand/logo-full.png",
        "extractedAt": EXTRACTED_AT,
    }
    D = ROOT / "data"
    json.dump(ig_posts, open(D / "instagram-posts.json", "w"), indent=2, ensure_ascii=False)
    json.dump(props, open(D / "properties.json", "w"), indent=2, ensure_ascii=False)
    json.dump(amen_out, open(D / "amenities.json", "w"), indent=2, ensure_ascii=False)
    json.dump(business, open(D / "business.json", "w"), indent=2, ensure_ascii=False)
    json.dump({"generatedAt": EXTRACTED_AT, "widths": WIDTHS, "format": "webp", "items": manifest},
              open(D / "media-manifest.json", "w"), indent=2)
    print(f"{len(props)} properties, {sum(len(x['images']) for x in props)} gallery images, unmapped: {all_unmapped}")

    if not SKIP_IMAGES:
        build_images(props)
        build_brand()


def build_images(props):
    from PIL import Image
    from concurrent.futures import ProcessPoolExecutor
    jobs = []
    for pr in props:
        sc = pr["instagramPosts"][0]
        for order, im in enumerate(pr["images"], 1):
            jobs.append((str(RAW / "media" / sc / f"{im['carouselIndex']:02d}.jpg"), str(OUT_IMG / pr["slug"]), f"{order:02d}"))
    with ProcessPoolExecutor() as ex:
        list(ex.map(_derive, jobs, chunksize=8))
    print("images:", len(jobs))


def _derive(job):
    from PIL import Image
    src, outdir, stem = job
    Path(outdir).mkdir(parents=True, exist_ok=True)
    im = Image.open(src).convert("RGB")
    for w in WIDTHS:
        out = Path(outdir) / f"{stem}-{w}.webp"
        if out.exists() and out.stat().st_size > 0:
            continue
        r = im if im.width == w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(out, "WEBP", quality=84 if w < 1440 else 88, method=6)


def build_brand():
    """Logo from the Instagram profile picture: white knocked out to transparency, trimmed."""
    from PIL import Image, ImageChops
    out = ROOT / "public" / "images" / "brand"
    out.mkdir(parents=True, exist_ok=True)
    im = Image.open(RAW / "media" / "_profile.jpg").convert("RGB")
    # alpha from darkness: pure white -> 0, ink -> 255 (keeps anti-aliasing)
    gray = im.convert("L")
    alpha = gray.point(lambda v: 0 if v > 244 else min(255, int((244 - v) * 255 / 200)))
    rgba = im.copy(); rgba.putalpha(alpha)
    bbox = alpha.getbbox(); rgba = rgba.crop(bbox)
    rgba.save(out / "logo-full.png", optimize=True)
    # wordmark only: crop the "DURBAN LUXE" letters (rows with black ink, not bronze)
    px = im.load(); W, H = im.size
    ink_rows = [y for y in range(H) if sum(1 for x in range(0, W, 3) if sum(px[x, y]) < 150) > 4]
    ink_cols = [x for x in range(W) if sum(1 for y in range(0, H, 3) if sum(px[x, y]) < 150) > 4]
    box = (min(ink_cols) - 6, min(ink_rows) - 6, max(ink_cols) + 6, max(ink_rows) + 6)
    wm = im.crop(box).convert("L")
    # recolour to pure ink with alpha so it can sit on any light ground; also a light version
    a = wm.point(lambda v: 0 if v > 200 else min(255, int((200 - v) * 255 / 170)))
    for name, col in (("wordmark-ink.png", (17, 17, 16)), ("wordmark-light.png", (255, 255, 255))):
        layer = Image.new("RGBA", wm.size, col + (0,)); layer.putalpha(a); layer.save(out / name, optimize=True)
    # favicon: the nested diamond motif rendered as SVG in public/ (vector, not traced)
    print("brand assets:", box)


if __name__ == "__main__":
    main()

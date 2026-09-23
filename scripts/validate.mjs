#!/usr/bin/env node
// Data validation for the Durban Luxe dataset. Fails (exit 1) on integrity errors,
// warns on genuinely optional absent data. Never fills anything in.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (f) => JSON.parse(readFileSync(path.join(ROOT, f), 'utf8'));
const P = read('data/properties.json');
const B = read('data/business.json');
const A = read('data/amenities.json');
const M = read('data/media-manifest.json');

const errors = [];
const warnings = [];
const fail = (id, msg) => errors.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

const STATUSES = new Set(['active', 'unavailable', 'archived', 'unknown']);
const amenityIds = new Set(A.amenities.map((a) => a.id));
const categoryIds = new Set(A.categories.map((c) => c.id));
const isCount = (v, { half = false, max = 40 } = {}) => v == null || (typeof v === 'number' && v > 0 && v <= max && (Number.isInteger(v) || (half && Number.isInteger(v * 2))));
const WA_RE = /^https:\/\/wa\.me\/27\d{9}$/;
const IG_POST_RE = /^https:\/\/www\.instagram\.com\/p\/[\w-]+\/$/;

// ---------- business
if (!WA_RE.test(B.whatsapp?.url || '')) fail('business', `malformed WhatsApp URL "${B.whatsapp?.url}"`);
if (B.phone && !/^tel:\+27\d{9}$/.test(B.phone.tel)) fail('business', `malformed tel: link "${B.phone.tel}"`);
if (B.email && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(B.email)) fail('business', `malformed email "${B.email}"`);
if (!B.email) warn('business', 'no public email address (none published by Durban Luxe)');

// ---------- properties
const seenIds = new Set();
const seenSlugs = new Set();
const seenPosts = new Map();
const allImageHashes = new Map();
let imageCount = 0;

for (const p of P) {
  const id = p.slug || p.id || '(no id)';
  if (!p.id) fail(id, 'missing id');
  if (seenIds.has(p.id)) fail(id, `duplicate id ${p.id}`);
  seenIds.add(p.id);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug || '')) fail(id, `invalid slug "${p.slug}"`);
  if (seenSlugs.has(p.slug)) fail(id, 'duplicate slug');
  seenSlugs.add(p.slug);
  if (!STATUSES.has(p.status)) fail(id, `invalid status "${p.status}"`);

  // Provenance
  if (!p.instagramPosts?.length) fail(id, 'no Instagram source posts');
  if (!p.sourceUrls?.length) fail(id, 'missing source provenance (sourceUrls)');
  for (const u of p.sourceUrls || []) if (!IG_POST_RE.test(u) && !/^https:\/\//.test(u)) fail(id, `bad source URL "${u}"`);
  for (const sc of p.instagramPosts || []) {
    if (seenPosts.has(sc)) fail(id, `post ${sc} is also assigned to ${seenPosts.get(sc)} (merge or split explicitly)`);
    seenPosts.set(sc, p.slug);
  }
  if (!p.lastVerifiedAt) fail(id, 'missing lastVerifiedAt');

  // Identification for active listings
  if (p.status === 'active') {
    if (!p.name?.trim()) fail(id, 'active listing without a name');
    if (!p.area) fail(id, 'active listing without an area');
    if (!p.images?.length) fail(id, 'active listing without images');
    if (p.bedrooms == null && p.guests == null) fail(id, 'active listing without bedrooms or guest count');
  }

  // Numbers
  if (!isCount(p.bedrooms, { max: 20 })) fail(id, `invalid bedrooms ${p.bedrooms}`);
  if (!isCount(p.bathrooms, { half: true, max: 20 })) fail(id, `invalid bathrooms ${p.bathrooms}`);
  if (!isCount(p.guests, { max: 40 })) fail(id, `invalid guests ${p.guests}`);
  if (!isCount(p.beds, { max: 40 })) fail(id, `invalid beds ${p.beds}`);
  if (p.guests != null && p.bedrooms != null && p.guests < p.bedrooms) fail(id, `guests (${p.guests}) fewer than bedrooms (${p.bedrooms})`);
  if (p.bathrooms == null) warn(id, 'bathroom count not published');
  if (p.guests == null) warn(id, 'guest capacity not published');

  // Prices
  if (p.priceFromZAR != null) {
    if (!Number.isInteger(p.priceFromZAR) || p.priceFromZAR < 500 || p.priceFromZAR > 200000) fail(id, `implausible price ${p.priceFromZAR}`);
    if (p.priceOnRequest) fail(id, 'has a price AND priceOnRequest=true');
    if (!p.pricePublishedAt) fail(id, 'price without a published date (cannot judge staleness)');
    if (!['incl', 'excl'].includes(p.priceVat)) fail(id, `price VAT basis unknown "${p.priceVat}"`);
    if (p.priceUnit !== 'night') fail(id, `unexpected price unit "${p.priceUnit}"`);
    const ageDays = (Date.now() - Date.parse(p.pricePublishedAt)) / 864e5;
    if (ageDays > 365) warn(id, `published rate is ${Math.round(ageDays / 30)} months old; shown as "from", confirmed on enquiry`);
  } else if (!p.priceOnRequest) fail(id, 'no price and not marked price-on-request');

  // Contact links
  if (p.whatsappUrl && !WA_RE.test(p.whatsappUrl)) fail(id, `malformed WhatsApp URL "${p.whatsappUrl}"`);
  if (p.bookingUrl && !/^https:\/\//.test(p.bookingUrl)) fail(id, `malformed booking URL "${p.bookingUrl}"`);

  // Amenities
  for (const a of p.amenities || []) {
    if (!amenityIds.has(a.id)) fail(id, `amenity "${a.id}" not in amenities.json`);
    if (!categoryIds.has(a.category)) fail(id, `amenity "${a.id}" has unknown category "${a.category}"`);
    if (!a.raw && a.source !== 'derived') fail(id, `amenity "${a.id}" has no source text`);
  }
  const amenityDupes = (p.amenities || []).map((a) => a.id).filter((x, i, arr) => arr.indexOf(x) !== i);
  if (amenityDupes.length) fail(id, `duplicate amenities ${amenityDupes.join(', ')}`);
  if (!p.highlights?.length) warn(id, 'no highlights');

  // Images
  const srcs = new Set();
  let heroes = 0;
  for (const img of p.images || []) {
    imageCount++;
    if (!img.src?.startsWith(`images/properties/${p.slug}/`)) fail(id, `image path outside property folder: ${img.src}`);
    if (srcs.has(img.src)) fail(id, `image listed twice: ${img.src}`);
    srcs.add(img.src);
    if (img.hero) heroes++;
    for (const w of M.widths) {
      const f = path.join(ROOT, 'public', `${img.src}-${w}.${M.format}`);
      if (!existsSync(f)) { fail(id, `missing file ${path.relative(ROOT, f)}`); continue; }
      const size = statSync(f).size;
      if (size === 0) fail(id, `zero-byte file ${path.relative(ROOT, f)}`);
      if (w === M.widths.at(-1) && size > 0) {
        const h = createHash('sha1').update(readFileSync(f)).digest('hex');
        if (allImageHashes.has(h)) fail(id, `duplicate gallery image ${img.src} = ${allImageHashes.get(h)}`);
        allImageHashes.set(h, img.src);
      }
    }
    if (img.width < 1000) warn(id, `low-resolution source (${img.width}px): ${img.src}`);
  }
  if (heroes !== 1) fail(id, `expected exactly one hero image, found ${heroes}`);
  if (p.hero && !srcs.has(p.hero)) fail(id, `hero ${p.hero} is not in its gallery`);
  if ((p.images || []).length < 6) warn(id, `only ${p.images.length} images`);
}

// ---------- media manifest consistency
const included = M.items.filter((i) => i.included);
if (included.length !== imageCount) fail('media-manifest', `${included.length} included items but ${imageCount} images referenced by properties`);
for (const i of M.items) if (!i.included && !i.excludedReason) fail('media-manifest', `${i.sourceFile} excluded without a reason`);

// ---------- report
const pad = (s) => `  - ${s}`;
if (warnings.length) console.log(`Warnings (${warnings.length}):\n${warnings.map(pad).join('\n')}\n`);
if (errors.length) {
  console.error(`Errors (${errors.length}):\n${errors.map(pad).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`OK: ${P.length} properties, ${imageCount} images x ${M.widths.length} sizes, ${amenityIds.size} amenities. ${warnings.length} warnings.`);
}

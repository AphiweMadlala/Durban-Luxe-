#!/usr/bin/env node
// Static site generator: data/*.json + templates/*.mjs -> dist/
// Env: BASE (default "/"; use "/Durban-Luxe-/" for a GitHub Pages project site)
//      SITE_URL (absolute origin + base, for canonical/sitemap; default http://localhost:4173/)
//      PROPOSAL_MODE ("false" to disable; default true -> noindex + robots Disallow)
//      OUT_DIR (default "dist"; "docs" for the GitHub Pages branch deploy, see npm run deploy)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { home } from '../templates/home.mjs';
import { stays } from '../templates/stays.mjs';
import { property } from '../templates/property.mjs';
import { about, enquire, notFound } from '../templates/pages.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, process.env.OUT_DIR || 'dist');
const read = (f) => JSON.parse(readFileSync(path.join(ROOT, 'data', f), 'utf8'));

export const PROPOSAL_MODE = process.env.PROPOSAL_MODE !== 'false';
const base = process.env.BASE || '/';
const siteUrl = process.env.SITE_URL || `http://localhost:4173${base}`;

const properties = read('properties.json').filter((p) => p.status === 'active');
const amenities = read('amenities.json');
const business = read('business.json');

const slugify = (s) => s.toLowerCase().replace(/&/g, '').replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const regionId = (r) => slugify(r);
const areaId = (a) => slugify(a);

// Region -> area hierarchy, built from structured fields (never substring matching).
const REGION_META = {
  'Dolphin Coast': { blurb: 'North of Durban: the estates of Zimbali, Ballito, Salt Rock and Christmas Bay, where most of the collection sits.', image: ['ballito-dual-level-sea-view-home', 2] },
  'Durban & Umhlanga': { blurb: 'Umhlanga Rocks, Umdloti, Westbrook and Durban itself, including homes on the beach and a loft a short walk from Umhlanga Pier and Oceans Mall.', image: ['umhlanga-beach-duplex', 3] },
};
const AREA_ORDER = ['Zimbali', 'Ballito', 'Salt Rock', 'Christmas Bay', 'Dolphin Coast', 'Umhlanga', 'Umdloti', 'Westbrook', 'Durban'];
const regions = Object.entries(REGION_META).map(([label, meta]) => {
  const inRegion = properties.filter((p) => p.region === label);
  const areas = [...new Set(inRegion.map((p) => p.area))]
    .sort((a, b) => AREA_ORDER.indexOf(a) - AREA_ORDER.indexOf(b))
    .map((a) => ({ id: areaId(a), label: a === 'Dolphin Coast' ? 'Other Dolphin Coast' : a, count: inRegion.filter((p) => p.area === a).length }));
  const ip = properties.find((p) => p.slug === meta.image[0]);
  return { id: regionId(label), label, count: inRegion.length, areas, blurb: meta.blurb, image: ip.images.find((i) => i.carouselIndex === meta.image[1]) };
});

// "Recommended" order: editor's picks first, then newest listings.
const PICKS = ['christmas-bay-beachfront-villa', 'salt-rock-beach-villa', 'ballito-tropical-coastal-villa', 'dolphin-coast-architectural-villa', 'umdloti-ocean-view-villa', 'westbrook-beach-house'];
const featuredOrder = [
  ...PICKS.map((s) => properties.find((p) => p.slug === s)),
  ...properties.filter((p) => !PICKS.includes(p.slug)).sort((a, b) => b.pricePublishedAt.localeCompare(a.pricePublishedAt)),
];

const ctx = {
  base, business, properties, regions, featuredOrder, regionId, areaId,
  categories: amenities.categories,
  config: { proposalMode: PROPOSAL_MODE, siteUrl },
  version: Date.now().toString(36),
};

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });

const out = (rel, html) => {
  const f = path.join(DIST, rel);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, html);
};
out('index.html', home(ctx));
out('stays/index.html', stays(ctx));
for (const p of properties) out(`stays/${p.slug}/index.html`, property(ctx, p));
out('about/index.html', about(ctx));
out('enquire/index.html', enquire(ctx));
out('404.html', notFound(ctx));

// Favicon: the logo's nested-diamond motif (simple geometric mark).
out('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#FCFCFB"/><g fill="none" stroke="#6C5424" stroke-width="1.6"><path d="M16 3 29 16 16 29 3 16Z"/><path d="M16 9.5 22.5 16 16 22.5 9.5 16Z"/><path d="M16 14 18 16 16 18 14 16Z"/></g></svg>`);

// Sitemap is built for eventual production; robots blocks everything in proposal mode.
const urls = ['', 'stays/', 'about/', 'enquire/', ...properties.map((p) => `stays/${p.slug}/`)];
const lastmod = (u) => properties.find((p) => u === `stays/${p.slug}/`)?.lastVerifiedAt || business.extractedAt;
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${siteUrl}${u}</loc><lastmod>${lastmod(u)}</lastmod></url>`).join('\n')}\n</urlset>\n`);
out('robots.txt', PROPOSAL_MODE ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`);
out('.nojekyll', '');

console.log(`Built ${urls.length + 1} pages into ${path.relative(ROOT, DIST)}/ (base=${base}, proposalMode=${PROPOSAL_MODE})`);

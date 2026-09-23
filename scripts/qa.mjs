#!/usr/bin/env node
// Browser QA: screenshots + automated checks across breakpoints.
// Usage: npm run serve (in another shell), then node scripts/qa.mjs [--shots]
// Writes screenshots and qa-results.json into .qa/
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const globalRoot = execSync('npm root -g').toString().trim();
const { chromium } = require(path.join(globalRoot, '@playwright/cli/node_modules/playwright-core'));

const BASE = process.env.QA_URL || 'http://localhost:4173/';
const OUT = '.qa';
const SHOTS = process.argv.includes('--shots');
mkdirSync(OUT, { recursive: true });

const slugs = readdirSync('dist/stays', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const PAGES = ['', 'stays/', 'about/', 'enquire/', '404.html', ...slugs.map((s) => `stays/${s}/`)];
const WIDTHS = [375, 390, 430, 768, 1024, 1440];
const SHOT_PAGES = new Set(['', 'stays/', 'about/', 'enquire/', '404.html', 'stays/christmas-bay-beachfront-villa/', 'stays/shakas-rock-group-house/']);

const results = [];
const browser = await chromium.launch();
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  // Visit every page at the smallest and largest widths; a representative subset elsewhere.
  const list = w === 375 || w === 1440 ? PAGES : [...SHOT_PAGES];
  for (const p of list) {
    errors.length = 0;
    const res = await page.goto(BASE + p, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in')));
    // Force lazy images to load so broken ones are detected.
    await page.evaluate(async () => {
      document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; i.decoding = 'sync'; });
      await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    });
    const r = await page.evaluate(() => {
      const doc = document.documentElement;
      const overflow = doc.scrollWidth > doc.clientWidth + 1;
      const wide = overflow ? [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > doc.clientWidth + 1).slice(0, 5).map((e) => e.tagName + '.' + [...e.classList].join('.')) : [];
      const broken = [...document.images].filter((i) => !i.naturalWidth).map((i) => i.currentSrc || i.src);
      const noAlt = [...document.images].filter((i) => !i.hasAttribute('alt')).length;
      const smallTargets = [...document.querySelectorAll('a,button,input,select,summary')].filter((e) => {
        const b = e.getBoundingClientRect();
        return b.width && b.height && (b.height < 24 || b.width < 24) && getComputedStyle(e).visibility !== 'hidden';
      }).map((e) => `${e.tagName.toLowerCase()}.${e.className} "${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24)}"`);
      const h1 = document.querySelectorAll('h1').length;
      const robots = document.querySelector('meta[name=robots]')?.content;
      const links = [...document.querySelectorAll('a[href]')].map((a) => a.href);
      return { overflow, wide, broken, noAlt, smallTargets, h1, robots, links };
    });
    const entry = { width: w, page: '/' + p, status: res.status(), errors: [...errors], ...r };
    delete entry.links;
    results.push(entry);
    if (w === 1440) results.linkSet = new Set([...(results.linkSet || []), ...r.links]);
    if (SHOTS && SHOT_PAGES.has(p)) {
      const name = (p.replace(/\/$/, '').replace('.html', '').replace(/\//g, '_') || 'home') + `-${w}.png`;
      await page.screenshot({ path: path.join(OUT, name), fullPage: true });
    }
  }
  await ctx.close();
}

// Internal link check
const internal = [...results.linkSet].filter((h) => h.startsWith(BASE));
const badLinks = [];
const req = (await browser.newContext()).request;
for (const h of internal) {
  const res = await req.get(h.split('#')[0]);
  if (res.status() !== 200) badLinks.push(`${res.status()} ${h}`);
}
await browser.close();

const problems = results.filter((r) => r.overflow || r.broken.length || r.errors.length || r.noAlt || r.h1 !== 1 || (r.status !== 200));
const summary = {
  pagesChecked: results.length,
  internalLinksChecked: internal.length,
  badLinks,
  problems,
  smallTargets: [...new Set(results.flatMap((r) => r.smallTargets))],
  robots: [...new Set(results.map((r) => r.robots))],
};
writeFileSync(path.join(OUT, 'qa-results.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ ...summary, problems: summary.problems.length }, null, 2));
if (problems.length) console.log(JSON.stringify(problems.slice(0, 10), null, 2));
process.exitCode = problems.length || badLinks.length ? 1 : 0;

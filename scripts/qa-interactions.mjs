#!/usr/bin/env node
// Interaction QA: filters + URL state, back/forward, lightbox keyboard/focus/scroll-lock,
// WhatsApp enquiry drafting, mobile nav + filter drawer. Usage: node scripts/qa-interactions.mjs
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), '@playwright/cli/node_modules/playwright-core'));
const BASE = process.env.QA_URL || 'http://localhost:4173/';
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); };
const visibleCards = (page) => page.$$eval('[data-card]', (els) => els.filter((e) => !e.hidden && e.offsetParent !== null).length);

const browser = await chromium.launch();
const errors = [];

// ---------- Desktop collection: filters, URL state, back/forward
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(BASE + 'stays/');
  check('collection shows all 31 stays', (await visibleCards(page)) === 31, String(await visibleCards(page)));
  await page.selectOption('#f-where', 'area:zimbali');
  await page.waitForTimeout(200);
  check('location filter: Zimbali = 8', (await visibleCards(page)) === 8, String(await visibleCards(page)));
  check('URL reflects location', page.url().includes('where=area%3Azimbali') || page.url().includes('where=area:zimbali'), page.url());
  await page.selectOption('#f-guests', '8');
  await page.check('input[name=feature][value=private-pool]', { force: true });
  await page.waitForTimeout(200);
  check('combined filters: Zimbali + 8 guests + private pool = 6', (await visibleCards(page)) === 6, String(await visibleCards(page)));
  const status = await page.textContent('[data-results-status]');
  check('results status announces count', /6/.test(status || ''), (status || '').trim());
  await page.selectOption('#f-where', 'region:dolphin-coast');
  await page.waitForTimeout(200);
  const regionCount = await visibleCards(page);
  check('region selection includes its areas', regionCount >= 6, String(regionCount));
  await page.goBack();
  await page.waitForTimeout(300);
  check('back button restores previous filter state', (await page.inputValue('#f-where')) === 'area:zimbali' && (await visibleCards(page)) === 6, `${await page.inputValue('#f-where')} / ${await visibleCards(page)}`);
  // Deep link
  await page.goto(BASE + 'stays/?where=area%3Aballito&sort=price-asc');
  const prices = await page.$$eval('[data-card]', (els) => els.filter((e) => !e.hidden).map((e) => Number(e.dataset.price)));
  check('deep link filters Ballito', prices.length === 6, String(prices.length));
  check('sort price ascending', prices.every((v, i) => i === 0 || v >= prices[i - 1]), prices.join(','));
  // Search
  await page.goto(BASE + 'stays/');
  await page.fill('#f-q', 'umdloti');
  await page.waitForTimeout(300);
  check('search "umdloti" finds 1', (await visibleCards(page)) === 1, String(await visibleCards(page)));
  await page.fill('#f-q', 'zzzz');
  await page.waitForTimeout(300);
  check('empty state appears for no matches', await page.isVisible('[data-empty]'));
  await ctx.close();
}

// ---------- Desktop property: lightbox + enquiry
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(BASE + 'stays/christmas-bay-beachfront-villa/');
  const opener = page.locator('[data-open-lightbox]').first();
  await opener.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  check('lightbox opens from keyboard', await page.isVisible('[data-lightbox][open]'));
  check('body scroll locked while open', await page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden' || document.body.classList.contains('is-locked')));
  const idx0 = await page.textContent('[data-lb-index]');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  const idx1 = await page.textContent('[data-lb-index]');
  check('ArrowRight advances image', idx0 !== idx1, `${idx0?.trim()} -> ${idx1?.trim()}`);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(400);
  check('ArrowLeft goes back', (await page.textContent('[data-lb-index]')) === idx0);
  // Focus trap: tab many times, focus should stay inside the dialog
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
  check('focus trapped in lightbox', await page.evaluate(() => !!document.activeElement.closest('[data-lightbox]')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check('Escape closes lightbox', !(await page.isVisible('[data-lightbox][open]')));
  check('focus restored to opener', await page.evaluate(() => document.activeElement.matches('[data-open-lightbox]')));
  check('scroll unlocked after close', await page.evaluate(() => getComputedStyle(document.body).overflow !== 'hidden'));

  // Enquiry → WhatsApp draft (intercept the popup, send nothing)
  const form = page.locator('.booking [data-enquiry]');
  const d = new Date(); d.setDate(d.getDate() + 30);
  const iso = (x) => x.toISOString().slice(0, 10);
  const out = new Date(d); out.setDate(out.getDate() + 1);
  await form.locator('input[name=checkin]').fill(iso(d));
  await form.locator('input[name=checkout]').fill(iso(out));
  await page.waitForTimeout(100);
  const hint = await form.locator('.field__hint').textContent();
  check('1-night stay shows minimum-stay heads-up (non-blocking)', /usual minimum is 3/.test(hint), hint.trim());
  out.setDate(d.getDate() + 4);
  await form.locator('input[name=checkout]').fill(iso(out));
  await form.locator('select[name=guests]').selectOption('6');
  const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null), form.locator('button[type=submit]').click()]);
  const url = popup ? popup.url() : '';
  const text = decodeURIComponent((url.split('text=')[1] || '').replace(/\+/g, ' '));
  check('submit opens wa.me with real number', /wa\.me\/27837062601|api\.whatsapp\.com.*27837062601/.test(url), url.slice(0, 60));
  check('draft names the property and guests', /Christmas Bay Beachfront Villa/.test(text) && /6/.test(text), text.replace(/\n/g, ' | ').slice(0, 160));
  check('draft asks to confirm (no availability claim)', /confirm/i.test(text) && !/is available/i.test(text));
  if (popup) await popup.close();
  await ctx.close();
}

// ---------- Mobile: nav, filter drawer, gallery strip, action bar
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(BASE);
  await page.click('[data-menu-toggle]');
  await page.waitForTimeout(200);
  check('mobile menu opens', await page.isVisible('[data-mobile-menu]'));
  check('menu toggle aria-expanded=true', (await page.getAttribute('[data-menu-toggle]', 'aria-expanded')) === 'true');
  // Regression: backdrop-filter on the header made it the fixed menu's containing block, collapsing the
  // open menu to a 56px strip with the links clipped. It must fill the screen below the header.
  await page.evaluate(() => scrollTo(0, 600));
  const menuBox = await page.evaluate(() => {
    const m = document.querySelector('[data-mobile-menu]').getBoundingClientRect();
    const links = [...document.querySelectorAll('[data-mobile-menu] a')].map((a) => a.getBoundingClientRect());
    return { bottom: Math.round(m.bottom), height: Math.round(m.height), linksInside: links.every((r) => r.top >= m.top && r.bottom <= m.bottom) };
  });
  check('open menu fills the viewport below the header', menuBox.bottom === 844 && menuBox.height >= 700 && menuBox.linksInside, `${menuBox.height}px tall, bottom ${menuBox.bottom}`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  check('Escape closes mobile menu', !(await page.isVisible('[data-mobile-menu]')));

  await page.goto(BASE + 'stays/');
  await page.click('[data-filters-open]');
  await page.waitForTimeout(250);
  check('filter drawer opens', await page.isVisible('[data-filters-form]'));
  check('drawer locks scroll', await page.evaluate(() => document.body.classList.contains('is-locked') || getComputedStyle(document.body).overflow === 'hidden'));
  await page.selectOption('#f-where', 'area:ballito');
  const label = await page.textContent('[data-apply-label]').catch(() => '');
  check('drawer apply button shows live count', /6/.test(label || ''), (label || '').trim());
  await page.click('[data-filters-close]');
  await page.waitForTimeout(250);
  check('drawer closes, results filtered', (await visibleCards(page)) === 6, String(await visibleCards(page)));
  check('filter count badge', /1/.test((await page.textContent('[data-filter-count]').catch(() => '')) || ''));

  // Regression: on short phones the drawer's action bar used to sit over the Type select
  // (the last left-column field), so tapping Type hit "Clear all" and wiped every filter.
  {
    const short = await browser.newContext({ viewport: { width: 390, height: 600 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    const sp = await short.newPage();
    sp.on('pageerror', (e) => errors.push(String(e)));
    await sp.goto(BASE + 'stays/?where=area%3Azimbali');
    await sp.tap('[data-filters-open]');
    await sp.waitForTimeout(200);
    const overlap = await sp.evaluate(() => document.querySelector('.filters__actions').getBoundingClientRect().top < document.querySelector('.filters__form').getBoundingClientRect().bottom - 0.5);
    check('drawer action bar sits below the scrolling fields', !overlap);
    // Scroll Type to the bottom edge of the drawer (what focus / a user scroll does), then tap it.
    await sp.$eval('#f-type', (el) => el.scrollIntoView({ block: 'end' }));
    const box = await sp.locator('#f-type').boundingBox();
    await sp.touchscreen.tap(box.x + 20, box.y + box.height / 2);
    await sp.waitForTimeout(100);
    const hit = await sp.evaluate(() => document.activeElement.id);
    check('tapping Type in the drawer focuses Type (not "Clear all")', hit === 'f-type', hit || 'nothing');
    check('tapping Type keeps existing filters', new URL(sp.url()).searchParams.get('where') === 'area:zimbali', new URL(sp.url()).search || '(cleared)');
    await sp.selectOption('#f-type', 'Villa');
    await sp.waitForTimeout(150);
    const p = new URL(sp.url()).searchParams;
    check('Type selection filters and updates URL', p.get('type') === 'Villa' && p.get('where') === 'area:zimbali' && (await visibleCards(sp)) < 8, `${new URL(sp.url()).search} / ${await visibleCards(sp)}`);
    await short.close();
  }

  await page.goto(BASE + 'stays/christmas-bay-beachfront-villa/');
  check('mobile gallery counter present', (await page.textContent('[data-strip-index]').catch(() => ''))?.trim() === '1');
  await page.evaluate(() => { const s = document.querySelector('[data-strip]'); s.scrollTo({ left: s.clientWidth * 2 }); });
  await page.waitForTimeout(500);
  check('swiping strip updates counter', (await page.textContent('[data-strip-index]'))?.trim() === '3', (await page.textContent('[data-strip-index]'))?.trim());
  check('action bar visible', await page.isVisible('[data-action-bar]'));
  const bar = await page.$eval('[data-action-bar]', (e) => e.getBoundingClientRect().height);
  check('action bar compact (<= 80px)', bar <= 80, `${Math.round(bar)}px`);
  await page.screenshot({ path: '.qa/mobile-property-viewport.png' });
  await ctx.close();
}

await browser.close();
check('no uncaught page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exitCode = failed.length ? 1 : 0;

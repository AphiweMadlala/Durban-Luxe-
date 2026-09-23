// Shared render helpers. Pure functions: data in, HTML string out.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ICON_DIR = path.join(ROOT_DIR, 'node_modules', '@phosphor-icons', 'core', 'assets');

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const iconCache = new Map();
/** Inline a Phosphor icon (light weight by default). Decorative unless a label is given. */
export function icon(name, { weight = 'light', label = '', cls = '' } = {}) {
  const key = `${name}-${weight}`;
  if (!iconCache.has(key)) {
    const file = weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`;
    iconCache.set(key, readFileSync(path.join(ICON_DIR, weight, file), 'utf8').replace(/<svg /, '<svg width="1em" height="1em" '));
  }
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true" focusable="false"';
  return iconCache.get(key).replace('<svg ', `<svg class="icon ${cls}" ${a11y} `);
}

export const rand = (n) => `R${Number(n).toLocaleString('en-US')}`;

export function priceLine(p, { short = false } = {}) {
  if (p.priceOnRequest || !p.priceFromZAR) return `<span class="price">Price on request</span>`;
  const vat = p.priceVat === 'incl' ? 'incl. VAT' : 'excl. VAT';
  return short
    ? `<span class="price"><span class="price__from">From</span> ${rand(p.priceFromZAR)}<span class="price__unit"> / night</span></span>`
    : `<span class="price"><span class="price__from">From</span> ${rand(p.priceFromZAR)}<span class="price__unit"> per night, ${vat}</span></span>`;
}

const fmtNum = (n) => (Number.isInteger(n) ? String(n) : String(n).replace('.5', '½'));
export function specs(p, { withIcons = false } = {}) {
  const items = [
    p.guests != null && [`users-three`, `${p.guests}${p.guestsPlus ? '+' : ''} guests`],
    p.bedrooms != null && [`bed`, `${p.bedrooms} bedroom${p.bedrooms === 1 ? '' : 's'}`],
    p.bathrooms != null && [`bathtub`, `${fmtNum(p.bathrooms)} bath${p.bathrooms === 1 ? '' : 's'}`],
  ].filter(Boolean);
  return `<ul class="specs" role="list">${items
    .map(([ic, t]) => `<li>${withIcons ? icon(ic) : ''}${esc(t)}</li>`)
    .join('')}</ul>`;
}

export const placeName = (p) => [p.suburb && p.suburb !== p.area ? p.suburb : null, p.area].filter(Boolean).join(', ');

/** Responsive <img> for a property image record ({src,width,height}). */
export function img(base, image, { alt, sizes, eager = false, cls = '', pos = '' } = {}) {
  const set = [640, 1024, 1440].map((w) => `${base}${image.src}-${w}.webp ${w}w`).join(', ');
  return `<img class="${cls}" src="${base}${image.src}-1024.webp" srcset="${set}" sizes="${esc(sizes)}" width="${image.width}" height="${image.height}" alt="${esc(alt)}" ${
    eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'
  }${pos ? ` style="object-position:${pos}"` : ''}>`;
}

export const heroImage = (p) => p.images.find((i) => i.hero) || p.images[0];

/** Short differentiators for cards, most distinctive first, max n. Only verified features. */
export function differentiators(p, n = 2) {
  const f = p.features;
  const out = [];
  if (f.beachfront) out.push('Beachfront');
  else if (p.amenities.some((a) => a.id === 'private-beach-access')) out.push('Private beach access');
  if (f.seaView) out.push('Sea view');
  if (f.privatePool) out.push('Private pool');
  if (f.backupPower) out.push('Solar powered');
  if (f.petsAllowed) out.push('Pets allowed');
  if (!f.beachfront && f.beachAccess && !out.includes('Private beach access')) out.push('Beach access');
  return out.slice(0, n);
}

export function card(base, p, { sizes = '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw', eager = false, headingLevel = 3 } = {}) {
  const h = heroImage(p);
  const diffs = differentiators(p);
  return `<article class="card">
  <a class="card__link" href="${base}stays/${p.slug}/">
    <div class="card__media">${img(base, h, { alt: `${p.name}, ${placeName(p)}`, sizes, eager })}</div>
    <p class="card__place">${esc(placeName(p))}<span aria-hidden="true"> · </span><span class="visually-hidden">, </span>${esc(p.propertyType)}</p>
    <h${headingLevel} class="card__name">${esc(p.name)}</h${headingLevel}>
    ${specs(p)}
    ${diffs.length ? `<p class="card__diffs">${diffs.map(esc).join('<span aria-hidden="true"> / </span><span class="visually-hidden">, </span>')}</p>` : ''}
    <p class="card__price">${priceLine(p, { short: true })}</p>
  </a>
</article>`;
}

export function waLink(business, text) {
  return `${business.whatsapp.url}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export const diamond = (cls = '') => `<span class="diamond ${cls}" aria-hidden="true"></span>`;

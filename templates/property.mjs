import { esc, icon, img, card, heroImage, placeName, priceLine, specs, waLink, diamond, rand } from './components.mjs';
import { enquiryForm } from './enquiry.mjs';
import { layout } from './layout.mjs';

const AMENITY_ICONS = {
  'private-pool': 'swimming-pool', pool: 'swimming-pool', 'shared-pool': 'swimming-pool', 'saltwater-pool': 'drop',
  'private-beach-access': 'umbrella-simple', 'beach-access': 'umbrella-simple', beachfront: 'waves', waterfront: 'waves',
  'sea-view': 'sun-horizon', 'golf-view': 'flag-pennant', 'air-conditioning': 'snowflake', wifi: 'wifi-high',
  braai: 'fire', parking: 'car', 'secure-parking': 'garage', 'backup-power': 'solar-panel', 'security-24h': 'shield-check',
  lift: 'elevator', 'smart-tv': 'television-simple', 'washer-dryer': 'washing-machine', 'full-kitchen': 'cooking-pot',
  dishwasher: 'cooking-pot', workspace: 'desk', 'indoor-fireplace': 'flame', 'fire-pit': 'flame', 'pool-table': 'game-controller',
  gym: 'barbell', 'resort-access': 'tree-palm', balcony: 'house', patio: 'house', garden: 'plant', 'outdoor-kitchen': 'fork-knife',
  cot: 'baby', 'lake-access': 'drop',
};
const SERVICE_ICONS = { 'host-greets': 'hand-waving', 'self-check-in': 'key', lockbox: 'lock-key', 'luggage-dropoff': 'suitcase-rolling', housekeeping: 'broom', 'long-stays': 'calendar-blank', 'pets-allowed': 'paw-print', 'building-staff': 'users-three' };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthYear = (iso) => { const [y, m] = iso.split('-').map(Number); return `${MONTHS[m - 1]} ${y}`; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const cleanService = (s) => cap(s.replace(/\s*\(\s*/g, ' (').replace(/\(\s*/g, '(').replace(/\s+/g, ' ').replace(/^-/, '').trim());

export function related(P, p, n = 3) {
  const others = P.filter((o) => o.slug !== p.slug);
  const score = (o) =>
    (o.area === p.area ? 100 : 0) + (o.region === p.region ? 30 : 0) - Math.abs(o.guests - p.guests) * 3 - Math.abs(o.bedrooms - p.bedrooms) * 4 +
    (o.features.privatePool && p.features.privatePool ? 4 : 0) + (o.features.seaView && p.features.seaView ? 4 : 0) -
    Math.abs((o.priceFromZAR || 0) - (p.priceFromZAR || 0)) / 1000;
  const picks = others.sort((a, b) => score(b) - score(a)).slice(0, n);
  const sameArea = picks.every((o) => o.area === p.area);
  const sameRegion = picks.every((o) => o.region === p.region);
  const title = sameArea && p.area !== 'Dolphin Coast' ? `More stays in ${p.area}` : sameRegion ? `More on the ${p.region === 'Dolphin Coast' ? 'Dolphin Coast' : 'Durban & Umhlanga coast'}` : 'You may also like';
  return { picks, title };
}

export function property(ctx, p) {
  const { base, business, properties: P, config, categories } = ctx;
  const imgs = p.images;
  const hero = heroImage(p);
  const ordered = [hero, ...imgs.filter((i) => i !== hero)];
  const n = imgs.length;
  const place = placeName(p);
  const altFor = (im, i) => `${p.name}, photo ${i + 1} of ${n}`;

  const key = p.amenities.filter((a) => a.priority <= 2 && !['netflix', 'private-entrance', 'pool-view'].includes(a.id)).slice(0, 10);
  const grouped = categories
    .map((c) => ({ ...c, items: p.amenities.filter((a) => a.category === c.id) }))
    .filter((g) => g.items.length);
  const { picks, title: relTitle } = related(P, p);

  const svc = (id) => p.services.find((s) => s.id === id);
  const checkIn = [svc('self-check-in') && 'Self check-in', svc('lockbox') && 'lockbox', svc('host-greets') && 'the host greets you'].filter(Boolean);
  const facts = [
    ['Rate', p.priceFromZAR ? `From ${rand(p.priceFromZAR)} per night, ${p.priceVat === 'incl' ? 'including' : 'excluding'} VAT. Published ${monthYear(p.pricePublishedAt)}; seasonal and date-specific rates are confirmed on enquiry.` : 'Price on request.'],
    ['Minimum stay', p.minimumStay ? `${p.minimumStay} nights` : null],
    ['Longer stays', p.longStayFromNights ? `Welcome, from ${p.longStayFromNights} nights` : svc('long-stays') ? 'Welcome' : null],
    ['Arrival', checkIn.length ? cap(checkIn.join(', ').replace(/, ([^,]*)$/, ' and $1')) : null],
    ['Housekeeping', svc('housekeeping') ? cleanService(svc('housekeeping').source) : null],
    ['Pets', svc('pets-allowed') ? 'Pets allowed' : null],
    ['Luggage', svc('luggage-dropoff') ? 'Luggage drop-off available' : null],
    ['Guests', p.guestsNote && !/^Published/.test(p.guestsNote) ? p.guestsNote.replace(/, as stated.*$/, '') : null],
    ['Check-in times and house rules', 'Ask us when you enquire.'],
  ].filter(([, v]) => v);

  const waText = `Hi Durban Luxe, I'm interested in ${p.name} (${p.area}).\n\nCheck-in:\nCheck-out:\nGuests:\n\nCould you please confirm availability and pricing?`;
  const lightboxData = ordered.map((im, i) => ({ s: `${base}${im.src}`, a: altFor(im, i) }));

  const galleryTiles = ordered.slice(1, 5);
  const body = `
<article class="property" data-property>
  <div class="container crumbs"><nav aria-label="Breadcrumb"><ol role="list">
    <li><a href="${base}stays/">Stays</a></li>
    <li><a href="${base}stays/?area=${ctx.areaId(p.area)}">${esc(p.area)}</a></li>
    <li><span aria-current="page">${esc(p.name)}</span></li>
  </ol></nav></div>

  <section class="gallery container" aria-label="Photos of ${esc(p.name)}">
    <div class="gallery__strip" data-strip tabindex="0" role="region" aria-label="Photo gallery, swipe for more">
      ${ordered.map((im, i) => `<button class="gallery__item${i === 0 ? ' gallery__item--lead' : ''}${i > 4 ? ' gallery__item--more' : ''}" type="button" data-open-lightbox="${i}" aria-label="Open photo ${i + 1} of ${n} full screen">
        ${img(base, im, { alt: altFor(im, i), sizes: i === 0 ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 20vw, 100vw', eager: i === 0 })}
      </button>`).join('')}
    </div>
    <p class="gallery__count" aria-hidden="true"><span data-strip-index>1</span> / ${n}</p>
    <button class="btn btn--light gallery__all" type="button" data-open-lightbox="0">${icon('images')}<span>View all ${n} photos</span></button>
  </section>

  <div class="container property__layout">
    <div class="property__main">
      <header class="property__head">
        <p class="property__place">${icon('map-pin')}${esc(place)}${p.developmentOrBuilding && !place.includes(p.developmentOrBuilding) ? `, ${esc(p.developmentOrBuilding)}` : ''}</p>
        <h1 class="h1">${esc(p.name)}</h1>
        ${specs(p, { withIcons: true })}
        <p class="property__price">${priceLine(p)}</p>
        <p class="property__pricenote">Minimum ${p.minimumStay} nights. Rate published ${monthYear(p.pricePublishedAt)}, confirmed on enquiry.</p>
      </header>

      <section class="property__intro" aria-label="About this stay">
        <p class="lede">${esc(p.summary)}</p>
        ${p.description.map((d) => `<p>${esc(d)}</p>`).join('')}
      </section>

      <section class="property__block" aria-labelledby="hl-title">
        <h2 id="hl-title" class="h3">Highlights</h2>
        <ul class="highlights" role="list">${p.highlights.map((h) => `<li>${diamond()}${esc(h)}</li>`).join('')}</ul>
      </section>

      <section class="property__block" aria-labelledby="am-title">
        <h2 id="am-title" class="h3">What this home offers</h2>
        <ul class="key-amenities" role="list">${key.map((a) => `<li>${icon(AMENITY_ICONS[a.id] || 'check')}<span>${esc(a.label)}</span></li>`).join('')}</ul>
        <details class="all-amenities">
          <summary><span>Show all ${p.amenities.length} amenities</span>${icon('caret-down')}</summary>
          <div class="all-amenities__groups">
            ${grouped.map((g) => `<div><h3 class="label">${esc(g.label)}</h3><ul role="list">${g.items.map((a) => `<li>${esc(a.label)}</li>`).join('')}</ul></div>`).join('')}
          </div>
        </details>
      </section>

      <section class="property__block" aria-labelledby="gtk-title">
        <h2 id="gtk-title" class="h3">Good to know</h2>
        <dl class="facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      </section>

      <section class="property__block" aria-labelledby="loc-title">
        <h2 id="loc-title" class="h3">Location</h2>
        <dl class="facts facts--loc">
          <div><dt>Area</dt><dd><a class="text-link" href="${base}stays/?area=${ctx.areaId(p.area)}">${esc(p.area)}</a>${p.suburb && p.suburb !== p.area ? `, ${esc(p.suburb)}` : ''}</dd></div>
          ${p.developmentOrBuilding ? `<div><dt>Estate / building</dt><dd>${esc(p.developmentOrBuilding)}</dd></div>` : ''}
          <div><dt>Coast</dt><dd><a class="text-link" href="${base}stays/?region=${ctx.regionId(p.region)}">${esc(p.region)}</a>, KwaZulu-Natal</dd></div>
          ${p.nearby.map((x) => `<div><dt>Getting there</dt><dd>${esc(x.replace(/\s*\(as stated by Durban Luxe\)/, ''))}</dd></div>`).join('')}
        </dl>
        <p class="muted small">We don't publish street addresses. Ask us for the exact location when you enquire.</p>
      </section>
    </div>

    <aside class="property__aside" aria-labelledby="enquiry-title">
      <div class="booking" id="check-availability">
        <p class="booking__price">${priceLine(p, { short: true })}</p>
        <p class="booking__sub">${p.priceVat === 'incl' ? 'Incl.' : 'Excl.'} VAT, minimum ${p.minimumStay} nights</p>
        ${enquiryForm(ctx, { property: p, id: 'enquiry', compact: true, heading: '<span id="enquiry-title">Check availability</span>' })}
        <a class="btn btn--ghost btn--block" href="${waLink(business, waText)}" rel="noopener" target="_blank">${icon('whatsapp-logo')}<span>Chat on WhatsApp</span></a>
      </div>
    </aside>
  </div>

  <section class="section-sm container" aria-labelledby="rel-title">
    <h2 id="rel-title" class="h2">${esc(relTitle)}</h2>
    <ul class="related" role="list">${picks.map((o) => `<li>${card(base, o)}</li>`).join('')}</ul>
  </section>

  <section class="section-sm container final-cta" aria-labelledby="final-title">
    ${diamond('diamond--lg')}
    <h2 id="final-title" class="h2">Planning a stay at ${esc(p.name)}?</h2>
    <p>Send us your dates and group size and we'll confirm availability and the current rate on WhatsApp.</p>
    <div class="btn-row btn-row--center">
      <a class="btn btn--primary" href="#check-availability" data-jump-enquiry>Check availability</a>
      <a class="btn btn--ghost" href="${waLink(business, waText)}" rel="noopener" target="_blank">${icon('whatsapp-logo')}<span>WhatsApp</span></a>
    </div>
  </section>
</article>

<div class="action-bar" data-action-bar>
  <div class="action-bar__price">${p.priceOnRequest || !p.priceFromZAR
    ? `<span class="price">Price on request</span><span>Rates confirmed on WhatsApp</span>`
    : `<span class="price">${rand(p.priceFromZAR)}<span class="price__unit"> / night</span></span><span>From · ${p.priceVat === 'incl' ? 'incl.' : 'excl.'} VAT</span>`}</div>
  <a class="icon-btn icon-btn--outline" href="${waLink(business, waText)}" rel="noopener" target="_blank" aria-label="WhatsApp Durban Luxe about ${esc(p.name)}">${icon('whatsapp-logo')}</a>
  <a class="btn btn--primary" href="#check-availability" data-jump-enquiry>Check availability</a>
</div>

<dialog class="lightbox" data-lightbox aria-label="${esc(p.name)} photos">
  <div class="lightbox__bar">
    <p class="lightbox__count" aria-live="polite"><span data-lb-index>1</span> / ${n}</p>
    <button class="icon-btn icon-btn--light" type="button" data-lb-close aria-label="Close gallery">${icon('x')}</button>
  </div>
  <div class="lightbox__track" data-lb-track tabindex="-1"></div>
  <button class="icon-btn icon-btn--light lightbox__nav lightbox__nav--prev" type="button" data-lb-prev aria-label="Previous photo">${icon('caret-left')}</button>
  <button class="icon-btn icon-btn--light lightbox__nav lightbox__nav--next" type="button" data-lb-next aria-label="Next photo">${icon('caret-right')}</button>
  <script type="application/json" data-lb-images>${JSON.stringify(lightboxData).replace(/</g, '\\u003c')}</script>
</dialog>`;

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'VacationRental',
    name: p.name, description: `${p.summary} ${p.description.join(' ')}`,
    identifier: p.id, url: `${config.siteUrl}stays/${p.slug}/`,
    image: ordered.slice(0, 8).map((im) => `${config.siteUrl}${im.src}-1440.webp`),
    address: { '@type': 'PostalAddress', addressLocality: p.suburb || p.area, addressRegion: 'KwaZulu-Natal', addressCountry: 'ZA' },
    containsPlace: { '@type': 'Accommodation', additionalType: p.propertyType, numberOfBedrooms: p.bedrooms, ...(p.bathrooms != null ? { numberOfBathroomsTotal: p.bathrooms } : {}), occupancy: { '@type': 'QuantitativeValue', maxValue: p.guests } },
    amenityFeature: p.amenities.filter((a) => a.priority <= 2).map((a) => ({ '@type': 'LocationFeatureSpecification', name: a.label, value: true })),
    brand: { '@type': 'Brand', name: 'Durban Luxe' },
  };

  return layout(ctx, {
    title: `${p.name}, ${p.area}`,
    description: `${p.summary} Sleeps ${p.guests}${p.guestsPlus ? '+' : ''}, ${p.bedrooms} bedrooms. From ${rand(p.priceFromZAR)} per night.`,
    path: `stays/${p.slug}/`,
    current: 'stays',
    body,
    ogImage: `${hero.src}-1440.webp`,
    preload: `<link rel="preload" as="image" href="${base}${hero.src}-1024.webp" imagesrcset="${[640, 1024, 1440].map((w) => `${base}${hero.src}-${w}.webp ${w}w`).join(', ')}" imagesizes="(min-width: 1024px) 60vw, 100vw" fetchpriority="high">`,
    jsonLd: [jsonLd],
    bodyClass: 'page-property',
  });
}

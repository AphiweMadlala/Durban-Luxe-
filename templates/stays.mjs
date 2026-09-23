import { esc, icon, card } from './components.mjs';
import { layout } from './layout.mjs';

export const FEATURE_FILTERS = [
  { id: 'private-pool', label: 'Private pool', test: (p) => p.features.privatePool },
  { id: 'sea-view', label: 'Sea view', test: (p) => p.features.seaView },
  { id: 'beach-access', label: 'Beach access', test: (p) => p.features.beachAccess || p.features.beachfront },
  { id: 'beachfront', label: 'Beachfront', test: (p) => p.features.beachfront },
];

export function stays(ctx) {
  const { base, properties: P, regions, config } = ctx;
  // Only offer thresholds that actually split the dataset.
  const guestSteps = [6, 8, 10, 12, 14].filter((g) => P.some((p) => p.guests >= g));
  const bedSteps = [2, 3, 4, 5, 6].filter((b) => P.some((p) => p.bedrooms >= b));
  const priceSteps = [4000, 5000, 7000, 10000].filter((v) => P.some((p) => p.priceFromZAR <= v));
  const types = [...new Set(P.map((p) => p.propertyType))].sort();
  const features = FEATURE_FILTERS.map((f) => ({ ...f, count: P.filter(f.test).length })).filter((f) => f.count >= 3);
  const order = ctx.featuredOrder;

  const locationOptions = regions
    .map((r) => `<optgroup label="${esc(r.label)}">
      <option value="region:${r.id}">All of ${esc(r.label)} (${r.count})</option>
      ${r.areas.map((a) => `<option value="area:${a.id}">${esc(a.label)} (${a.count})</option>`).join('')}
    </optgroup>`)
    .join('');

  const sel = (name, label, opts, anyLabel = 'Any') => `<div class="field">
      <label for="f-${name}">${label}</label>
      <select id="f-${name}" name="${name}"><option value="">${anyLabel}</option>${opts}</select>
    </div>`;

  const cards = order
    .map((p, i) => {
      const feats = FEATURE_FILTERS.filter((f) => f.test(p)).map((f) => f.id).join(' ');
      const search = [p.name, p.area, p.suburb, p.region, p.developmentOrBuilding, p.propertyType].filter(Boolean).join(' ').toLowerCase();
      return `<li class="results__item" data-card data-order="${i}" data-region="${ctx.regionId(p.region)}" data-area="${ctx.areaId(p.area)}" data-guests="${p.guests}" data-bedrooms="${p.bedrooms}" data-price="${p.priceFromZAR ?? ''}" data-type="${esc(p.propertyType)}" data-features="${feats}" data-search="${esc(search)}">${card(base, p, { eager: i < 3, headingLevel: 2 })}</li>`;
    })
    .join('');

  const body = `
<section class="page-head container">
  <h1 class="h1">Stays</h1>
  <p class="lede">${P.length} holiday homes between Umhlanga and Christmas Bay. Every rate is a published "from" price per night; we confirm dates and the current rate on WhatsApp.</p>
</section>

<div class="container collection" data-collection>
  <div class="toolbar">
    <div class="field search">
      <label for="f-q" class="visually-hidden">Search stays</label>
      ${icon('magnifying-glass')}
      <input id="f-q" name="q" type="search" placeholder="Search by name, area or estate" autocomplete="off" form="filters-form">
    </div>
    <button class="btn btn--ghost filters-open" type="button" aria-haspopup="dialog" aria-controls="filters" data-filters-open>${icon('sliders-horizontal')}<span>Filters</span><span class="filters-open__count" data-filter-count hidden></span></button>
    <div class="field sort">
      <label for="f-sort">Sort</label>
      <select id="f-sort" name="sort" form="filters-form">
        <option value="">Recommended</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="guests-desc">Most guests</option>
      </select>
    </div>
  </div>

  <div class="filters" id="filters" data-filters aria-labelledby="filters-title">
    <div class="filters__head">
      <h2 id="filters-title" class="filters__title">Filters</h2>
      <button class="icon-btn" type="button" data-filters-close aria-label="Close filters">${icon('x')}</button>
    </div>
    <form id="filters-form" class="filters__form" data-filters-form>
      <div class="field field--location">
        <label for="f-where">Location</label>
        <select id="f-where" name="where"><option value="">All locations (${P.length})</option>${locationOptions}</select>
      </div>
      ${sel('guests', 'Guests', guestSteps.map((g) => `<option value="${g}">${g}+ guests</option>`).join(''))}
      ${sel('bedrooms', 'Bedrooms', bedSteps.map((b) => `<option value="${b}">${b}+ bedrooms</option>`).join(''))}
      ${sel('price', 'Nightly rate', priceSteps.map((v) => `<option value="${v}">Up to R${v.toLocaleString('en-US')}</option>`).join(''), 'Any rate')}
      ${sel('type', 'Type', types.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join(''), 'Any type')}
      <fieldset class="field field--features">
        <legend>Features</legend>
        <div class="chips">
          ${features.map((f) => `<label class="chip"><input type="checkbox" name="feature" value="${f.id}"><span>${esc(f.label)}</span></label>`).join('')}
        </div>
      </fieldset>
      <div class="filters__actions">
        <button class="btn btn--ghost" type="reset" data-filters-reset>Clear all</button>
        <button class="btn btn--primary filters__apply" type="button" data-filters-close><span data-apply-label>Show ${P.length} stays</span></button>
      </div>
    </form>
  </div>

  <p class="results__status" role="status" aria-live="polite" data-results-status>Showing all ${P.length} stays</p>
  <ul class="results" role="list" data-results>${cards}</ul>
  <div class="empty" data-empty hidden>
    <h2 class="h3">No stays match those filters</h2>
    <p>Try a different area or fewer features. Or tell us what you need and we'll suggest something.</p>
    <div class="btn-row"><button class="btn btn--primary" type="button" data-filters-reset>Clear filters</button><a class="btn btn--ghost" href="${base}enquire/">Enquire</a></div>
  </div>
</div>`;

  return layout(ctx, {
    title: 'Stays',
    description: `Browse ${P.length} Durban Luxe holiday homes in Umhlanga, Zimbali, Ballito, Salt Rock and the Dolphin Coast. Filter by guests, bedrooms, sea view and private pool.`,
    path: 'stays/',
    current: 'stays',
    body,
    ogImage: `${P[0].hero}-1440.webp`,
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'Durban Luxe stays',
      itemListElement: order.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${config.siteUrl}stays/${p.slug}/`, name: p.name })),
    }],
    bodyClass: 'page-stays',
  });
}

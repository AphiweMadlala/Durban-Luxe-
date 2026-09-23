import { esc, icon, img, card, heroImage, placeName, priceLine, specs, waLink, diamond } from './components.mjs';
import { enquiryForm } from './enquiry.mjs';
import { layout } from './layout.mjs';

const bySlug = (P, s) => P.find((p) => p.slug === s);
const byIdx = (p, i) => p.images.find((im) => im.carouselIndex === i) || heroImage(p);

export function home(ctx) {
  const { base, properties: P, business, regions } = ctx;
  const heroP = bySlug(P, 'christmas-bay-beachfront-villa');
  const heroImg = heroImage(heroP);
  const signature = ['salt-rock-beach-villa', 'ballito-tropical-coastal-villa', 'dolphin-coast-architectural-villa', 'westbrook-beach-house', 'port-zimbali-milkwood-house'].map((s) => bySlug(P, s));
  const featured = bySlug(P, 'umdloti-ocean-view-villa');
  const used = new Set([heroP, ...signature, featured].map((p) => p.slug));
  const preview = P.filter((p) => !used.has(p.slug)).sort((a, b) => b.pricePublishedAt.localeCompare(a.pricePublishedAt)).slice(0, 8);
  const views = [
    ['forty-seconds-beach-terrace', 13], ['ballito-beachfront-apartment', 13], ['ballito-penthouse', 10],
    ['dolphin-coast-ocean-deck', 7], ['umhlanga-beach-duplex', 2], ['dolphin-coast-architectural-villa', 8],
  ].map(([s, i]) => ({ p: bySlug(P, s), im: byIdx(bySlug(P, s), i) }));

  const n = P.length;
  const count = (fn) => P.filter(fn).length;
  const beach = count((p) => p.features.beachAccess || p.features.beachfront);
  const pools = count((p) => p.features.privatePool);
  const seaView = count((p) => p.features.seaView);
  const maxGuests = Math.max(...P.map((p) => p.guests));

  const [lead, ...rest] = signature;
  const body = `
<section class="home-hero">
  <div class="container home-hero__grid">
    <div class="home-hero__copy reveal">
      <h1 class="display"><span class="display__line">Holiday homes</span> <span class="display__line">on the</span> <span class="display__line">Durban coast</span></h1>
      <p class="lede">Beachfront villas, family getaways and event stays from Umhlanga to Christmas Bay, with our personal concierge service.</p>
      <div class="btn-row">
        <a class="btn btn--primary" href="${base}stays/">Explore stays</a>
        <a class="btn btn--ghost" href="${waLink(business, 'Hi Durban Luxe, I would like to enquire about a stay.')}" rel="noopener" target="_blank">${icon('whatsapp-logo')}<span>WhatsApp</span></a>
      </div>
    </div>
    <figure class="home-hero__media">
      <a href="${base}stays/${heroP.slug}/" class="home-hero__imglink">${img(base, heroImg, { alt: `Pool deck facing the ocean at ${heroP.name}`, sizes: '(min-width: 1024px) 60vw, 100vw', eager: true })}</a>
      <figcaption><a href="${base}stays/${heroP.slug}/">${esc(heroP.name)}</a>, sleeps ${heroP.guests}</figcaption>
    </figure>
  </div>
</section>

<section class="section signature" aria-labelledby="sig-title">
  <div class="container">
    <div class="section-head section-head--split reveal">
      <h2 id="sig-title" class="h2">Signature stays</h2>
      <div class="section-head__aside">
        <p>Five of the ${n} homes, each with a private pool.</p>
        <a class="text-link" href="${base}stays/">View all stays ${icon('arrow-right')}</a>
      </div>
    </div>
    <div class="signature__grid">
      <a class="signature__lead reveal" href="${base}stays/${lead.slug}/">
        <div class="signature__media">${img(base, heroImage(lead), { alt: `${lead.name}, ${placeName(lead)}`, sizes: '(min-width: 1024px) 56vw, 100vw' })}</div>
        <div class="signature__text">
          <p class="card__place">${esc(placeName(lead))}</p>
          <h3 class="t-feature">${esc(lead.name)}</h3>
          <p class="signature__summary">${esc(lead.summary)}</p>
          ${specs(lead)}
          <p class="card__price">${priceLine(lead, { short: true })}</p>
        </div>
      </a>
      <div class="signature__companions">
        ${rest.map((p) => `<div class="signature__item reveal">${card(base, p, { compact: true, sizes: '(min-width: 1024px) 19vw, (min-width: 600px) 45vw, 92vw' })}</div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="section section--lg statement" aria-labelledby="statement-title">
  <div class="container statement__inner reveal">
    ${diamond('diamond--lg')}
    <h2 id="statement-title" class="statement__title">A small collection of homes, chosen for the coast.</h2>
    <p class="statement__sig">Personal concierge service, and a direct line to us on WhatsApp.</p>
    <p class="statement__body">We offer ${n} holiday homes along the KwaZulu-Natal coast, from a two-bedroom beach bungalow to villas for fourteen and more.</p>
  </div>
</section>

<section class="section coasts" aria-labelledby="coasts-title">
  <div class="container">
    <div class="section-head reveal"><h2 id="coasts-title" class="h2">Where you'll stay</h2></div>
    <div class="coasts__grid">
      ${regions.map((r) => `<div class="coast reveal">
        <a class="coast__media" href="${base}stays/?region=${r.id}" tabindex="-1" aria-hidden="true">${img(base, r.image, { alt: '', sizes: '(min-width: 768px) 55vw, 100vw' })}</a>
        <h3 class="h3"><a href="${base}stays/?region=${r.id}">${esc(r.label)}</a> <span class="coast__count">${r.count} stays</span></h3>
        <p>${esc(r.blurb)}</p>
        <ul class="coast__areas" role="list">${r.areas.map((a) => `<li><a href="${base}stays/?area=${a.id}"><span class="coast__area-name">${esc(a.label)}</span> <span class="coast__area-count">${a.count} ${a.count === 1 ? 'stay' : 'stays'}</span></a></li>`).join('')}</ul>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section section--lg featured" aria-labelledby="featured-title">
  <div class="container featured__grid">
    <div class="featured__main reveal">${img(base, byIdx(featured, 17), { alt: `Timber pool deck with ocean view at ${featured.name}`, sizes: '(min-width: 1024px) 56vw, 100vw' })}</div>
    <div class="featured__side">
      <div class="featured__text reveal">
        <p class="card__place">${esc(placeName(featured))}<span aria-hidden="true"> · </span><span class="visually-hidden">, </span>${esc(featured.propertyType)}</p>
        <h2 id="featured-title" class="t-feature">${esc(featured.name)}</h2>
        <p>${esc(featured.description[0])}</p>
        ${specs(featured, { withIcons: true })}
        <p class="featured__price">${priceLine(featured)}</p>
        <a class="btn btn--ghost" href="${base}stays/${featured.slug}/">View this stay</a>
      </div>
      <div class="featured__pair reveal">
        ${img(base, byIdx(featured, 3), { alt: `Living room at ${featured.name}`, sizes: '(min-width: 1024px) 20vw, 50vw' })}
        ${img(base, byIdx(featured, 16), { alt: `Freestanding bath by the window at ${featured.name}`, sizes: '(min-width: 1024px) 14vw, 50vw' })}
      </div>
    </div>
  </div>
</section>

<section class="section why" aria-labelledby="why-title">
  <div class="container why__grid">
    <h2 id="why-title" class="h2 reveal">Why stay with Durban Luxe</h2>
    <ul class="why__list" role="list">
      <li class="reveal"><h3 class="why__claim">On the sand, or close to it</h3><p>${beach} of the ${n} homes have beach access or sit right on the beach.</p></li>
      <li class="reveal"><h3 class="why__claim">A pool of your own</h3><p>${pools} homes come with a private pool.</p></li>
      <li class="reveal"><h3 class="why__claim">The Indian Ocean in view</h3><p>${seaView} homes look out to sea.</p></li>
      <li class="reveal"><h3 class="why__claim">Room for the whole group</h3><p>The largest home sleeps ${maxGuests} or more, for reunions and event stays.</p></li>
      <li class="reveal"><h3 class="why__claim">Personal concierge service</h3><p>Our own service. Every enquiry comes straight to us on WhatsApp.</p></li>
    </ul>
  </div>
</section>

<section class="section-sm preview" aria-labelledby="preview-title">
  <div class="container preview__head">
    <h2 id="preview-title" class="h2 reveal">More from the collection</h2>
    <a class="text-link" href="${base}stays/">View all ${n} stays ${icon('arrow-right')}</a>
  </div>
  <div class="rail" tabindex="0" role="region" aria-label="More stays, scroll sideways">
    <ul class="rail__track" role="list">
      ${preview.map((p) => `<li class="rail__item">${card(base, p, { sizes: '(min-width: 1024px) 22vw, 72vw' })}</li>`).join('')}
    </ul>
  </div>
</section>

<section class="section views" aria-labelledby="views-title">
  <div class="container">
    <div class="section-head section-head--split reveal">
      <h2 id="views-title" class="h2">The view from here</h2>
      <p class="section-head__aside">Straight from the homes, as posted on <a class="text-link" href="${business.instagram.url}" rel="noopener" target="_blank">${esc(business.instagram.handle)}</a>.</p>
    </div>
    <ul class="views__grid" role="list">
      ${views.map(({ p, im }, i) => `<li class="reveal"><a href="${base}stays/${p.slug}/">${img(base, im, { alt: `View from ${p.name}`, sizes: i === 0 ? '(min-width: 768px) 62vw, 100vw' : '(min-width: 768px) 31vw, 50vw' })}<span class="views__cap">${esc(p.name)}</span></a></li>`).join('')}
    </ul>
  </div>
</section>

<section class="section section--lg cta" aria-labelledby="cta-title">
  <div class="container cta__grid">
    <div class="cta__copy reveal">
      <h2 id="cta-title" class="h2">Tell us your dates</h2>
      <p>Share when you're coming and how many of you there are. We'll confirm availability and current rates on WhatsApp.</p>
      <p class="cta__direct">Or message directly: <a class="text-link" href="${waLink(business)}" rel="noopener" target="_blank">${esc(business.whatsapp.display)}</a></p>
    </div>
    <div class="cta__form reveal">${enquiryForm(ctx, { properties: P, id: 'home-enquiry' })}</div>
  </div>
</section>`;

  return layout(ctx, {
    title: '',
    description: `Luxury holiday homes in Durban, Umhlanga, Zimbali and Ballito. ${n} beachfront villas, family getaways and event stays with personal concierge service.`,
    path: '',
    current: 'home',
    body,
    ogImage: `${heroImg.src}-1440.webp`,
    preload: `<link rel="preload" as="image" href="${base}${heroImg.src}-1024.webp" imagesrcset="${[640, 1024, 1440].map((w) => `${base}${heroImg.src}-${w}.webp ${w}w`).join(', ')}" imagesizes="(min-width: 1024px) 60vw, 100vw" fetchpriority="high">`,
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'LodgingBusiness', name: business.officialName,
      description: business.bio.replace(/\s*\n\s*/g, '. '), url: ctx.config.siteUrl, telephone: business.whatsapp.e164,
      sameAs: [business.instagram.url], areaServed: ['Durban', 'Umhlanga', 'Dolphin Coast', 'Ballito', 'Zimbali'],
      logo: `${ctx.config.siteUrl}images/brand/logo-full.png`,
    }],
    bodyClass: 'page-home',
  });
}

import { esc, icon, img, heroImage, waLink, diamond } from './components.mjs';
import { enquiryForm } from './enquiry.mjs';
import { layout } from './layout.mjs';

const bySlug = (P, s) => P.find((p) => p.slug === s);

export function about(ctx) {
  const { base, properties: P, business, regions } = ctx;
  const a = bySlug(P, 'ballito-penthouse');
  const b = bySlug(P, 'salt-rock-beach-villa');
  const imA = a.images.find((i) => i.carouselIndex === 4);
  const imB = b.images.find((i) => i.carouselIndex === 16);
  const body = `
<section class="page-head container">
  <h1 class="h1">About Durban Luxe</h1>
  <p class="lede">Luxury holiday homes in Durban, South Africa. Beachfront villas, family getaways and event stays, with personal concierge service.</p>
</section>

<section class="section-sm container about">
  <div class="about__text">
    <h2 class="h2">A coastal collection</h2>
    <p>We offer ${P.length} holiday homes along the KwaZulu-Natal coast. ${regions.map((r) => `${r.count} are on ${r.label === 'Dolphin Coast' ? 'the Dolphin Coast' : `the ${r.label} side`}`).join(' and ')}, from Umhlanga Rocks and Umdloti up to Zimbali, Ballito, Salt Rock and Christmas Bay.</p>
    <p>The homes range from a two-bedroom beach bungalow to a seven-bedroom house with a separate granny flat, and most are made for groups: families, friends travelling together, and celebrations.</p>

    <h2 class="h2">How booking works</h2>
    <ol class="steps" role="list">
      <li><h3 class="h3">Choose a stay, or ask for ideas</h3><p>Browse the homes here or on <a class="text-link" href="${business.instagram.url}" rel="noopener" target="_blank">${esc(business.instagram.handle)}</a>.</p></li>
      <li><h3 class="h3">Send your dates on WhatsApp</h3><p>Every enquiry form on this site drafts a WhatsApp message to us with your dates and group size. You review it and press send.</p></li>
      <li><h3 class="h3">We confirm</h3><p>We reply with availability and the current rate for your dates. Published prices are "from" rates per night, and most exclude VAT.</p></li>
    </ol>

    <h2 class="h2">Rates at a glance</h2>
    <ul class="plain-list" role="list">
      <li>${diamond()}Nightly "from" rates, published between R${Math.min(...P.map((p) => p.priceFromZAR)).toLocaleString('en-US')} and R${Math.max(...P.map((p) => p.priceFromZAR)).toLocaleString('en-US')}</li>
      <li>${diamond()}Minimum stay of 3 nights at every home</li>
      <li>${diamond()}Longer stays are welcome at most homes</li>
    </ul>
  </div>
  <div class="about__media">
    ${img(base, imA, { alt: `Sunset over the living room at ${a.name}`, sizes: '(min-width: 1024px) 36vw, 100vw' })}
    ${img(base, imB, { alt: `Balcony with ocean view at ${b.name}`, sizes: '(min-width: 1024px) 28vw, 70vw' })}
  </div>
</section>`;
  return layout(ctx, {
    title: 'About',
    description: 'Durban Luxe offers luxury holiday homes in Durban and on the Dolphin Coast, with personal concierge service and enquiries by WhatsApp.',
    path: 'about/', current: 'about', body, bodyClass: 'page-about',
  });
}

export function enquire(ctx) {
  const { base, properties: P, business } = ctx;
  const body = `
<section class="page-head container">
  <h1 class="h1">Enquire</h1>
  <p class="lede">Tell us your dates and group size. We'll confirm availability and the current rate on WhatsApp.</p>
</section>
<section class="section-sm container enquire">
  <div class="enquire__form">${enquiryForm(ctx, { properties: P, id: 'page-enquiry' })}</div>
  <aside class="enquire__direct" aria-labelledby="direct-title">
    <h2 id="direct-title" class="h3">Contact us directly</h2>
    <dl class="facts">
      <div><dt>WhatsApp</dt><dd><a class="text-link" href="${waLink(business)}" rel="noopener" target="_blank">${esc(business.whatsapp.display)}</a></dd></div>
      <div><dt>Instagram</dt><dd><a class="text-link" href="${business.instagram.url}" rel="noopener" target="_blank">${esc(business.instagram.handle)}</a> (direct messages)</dd></div>
    </dl>
    <p class="muted small">This site doesn't take payments or bookings, and it can't see live availability. Every enquiry comes to us, and we confirm dates and rates personally.</p>
  </aside>
</section>`;
  return layout(ctx, {
    title: 'Enquire',
    description: 'Send Durban Luxe your dates and group size on WhatsApp to check availability and current rates.',
    path: 'enquire/', current: 'enquire', body, bodyClass: 'page-enquire',
  });
}

export function notFound(ctx) {
  const { base, properties: P } = ctx;
  const p = bySlug(P, 'dolphin-coast-beach-bungalow');
  const body = `
<section class="container notfound">
  <div>
    <h1 class="h1">This page has drifted off</h1>
    <p class="lede">The page you're looking for isn't here. The stays are.</p>
    <div class="btn-row"><a class="btn btn--primary" href="${base}stays/">Explore stays</a><a class="btn btn--ghost" href="${base}">Home</a></div>
  </div>
  ${img(base, heroImage(p), { alt: `Deck with ocean view at ${p.name}`, sizes: '(min-width: 768px) 40vw, 100vw' })}
</section>`;
  return layout(ctx, { title: 'Page not found', description: 'Page not found.', path: '404.html', body, bodyClass: 'page-404' });
}

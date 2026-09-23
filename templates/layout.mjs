import { esc, icon, waLink } from './components.mjs';

const NAV = [
  { href: 'stays/', label: 'Stays', key: 'stays' },
  { href: 'about/', label: 'About', key: 'about' },
  { href: 'enquire/', label: 'Enquire', key: 'enquire' },
];

export function layout(ctx, { title, description, path = '', current = '', body, jsonLd = [], preload = '', ogImage = '', bodyClass = '' }) {
  const { base, config, business } = ctx;
  const canonical = `${config.siteUrl}${path}`;
  const fullTitle = title ? `${title} | Durban Luxe` : 'Durban Luxe | Luxury holiday homes in Durban & the Dolphin Coast';
  const nav = NAV.map(
    (n) => `<li><a href="${base}${n.href}"${current === n.key ? ' aria-current="page"' : ''}>${n.label}</a></li>`
  ).join('');
  return `<!doctype html>
<html lang="en-ZA">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${config.proposalMode ? '<meta name="robots" content="noindex, nofollow">' : ''}
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Durban Luxe">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
${ogImage ? `<meta property="og:image" content="${esc(config.siteUrl + ogImage)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FCFCFB" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121211" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
<link rel="preload" href="${base}fonts/marcellus-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${base}fonts/hanken-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
${preload}
<link rel="stylesheet" href="${base}css/site.css?v=${ctx.version}">
${jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body class="${bodyClass}">
<a class="skip-link" href="#main">Skip to content</a>
${config.proposalMode ? `<div class="proposal-bar" role="note">Website proposal for Durban Luxe. Content is drawn from <a href="${business.instagram.url}" rel="noopener">@durban_luxe</a>; enquiries go to their real WhatsApp.</div>` : ''}
<header class="site-header" data-header>
  <div class="container site-header__inner">
    <a class="brand" href="${base}" aria-label="Durban Luxe, home">
      <img class="brand__mark brand__mark--ink" src="${base}images/brand/wordmark-ink.png" alt="" width="651" height="221">
      <img class="brand__mark brand__mark--light" src="${base}images/brand/wordmark-light.png" alt="" width="651" height="221">
    </a>
    <nav class="site-nav" aria-label="Main">
      <ul role="list">${nav}</ul>
    </nav>
    <a class="btn btn--ghost btn--sm site-header__wa" href="${waLink(business, 'Hi Durban Luxe, I would like to enquire about a stay.')}" rel="noopener" target="_blank">${icon('whatsapp-logo')}<span>WhatsApp</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>
      <span class="visually-hidden">Menu</span>${icon('list', { cls: 'menu-toggle__open' })}${icon('x', { cls: 'menu-toggle__close' })}
    </button>
  </div>
  <div class="mobile-menu" id="mobile-menu" hidden data-mobile-menu>
    <nav aria-label="Mobile">
      <ul role="list">${nav}</ul>
    </nav>
    <div class="mobile-menu__foot">
      <a class="btn btn--primary btn--block" href="${waLink(business, 'Hi Durban Luxe, I would like to enquire about a stay.')}" rel="noopener" target="_blank">${icon('whatsapp-logo')}<span>WhatsApp ${esc(business.whatsapp.display)}</span></a>
      <a class="text-link" href="${business.instagram.url}" rel="noopener" target="_blank">Instagram ${esc(business.instagram.handle)}</a>
    </div>
  </div>
</header>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="site-footer">
  <div class="container site-footer__grid">
    <div class="site-footer__brand">
      <img src="${base}images/brand/logo-full.png" alt="Durban Luxe" width="140" height="140" loading="lazy" class="site-footer__logo">
      <p>Luxury holiday homes in Durban, South Africa.<br>Beachfront villas, family getaways and event stays.</p>
    </div>
    <div>
      <h2 class="label">Stay</h2>
      <ul role="list" class="site-footer__links">
        <li><a href="${base}stays/">All stays</a></li>
        <li><a href="${base}stays/?region=dolphin-coast">Dolphin Coast</a></li>
        <li><a href="${base}stays/?region=durban-umhlanga">Durban &amp; Umhlanga</a></li>
      </ul>
    </div>
    <div>
      <h2 class="label">Contact</h2>
      <ul role="list" class="site-footer__links">
        <li><a href="${waLink(business)}" rel="noopener" target="_blank">WhatsApp ${esc(business.whatsapp.display)}</a></li>
        <li><a href="${business.instagram.url}" rel="noopener" target="_blank">Instagram ${esc(business.instagram.handle)}</a></li>
        <li><a href="${base}about/">About Durban Luxe</a></li>
      </ul>
    </div>
  </div>
  <div class="container site-footer__base">
    <p>Rates are published "from" prices per night and are confirmed with Durban Luxe on enquiry. This site does not take bookings or show live availability.</p>
    ${config.proposalMode ? '<p>Proposal preview. Not indexed by search engines.</p>' : ''}
  </div>
</footer>
<script src="${base}js/site.js?v=${ctx.version}" defer></script>
</body>
</html>`;
}

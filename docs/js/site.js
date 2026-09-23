/* Durban Luxe proposal: progressive enhancement only. Every page works without JS. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /* ---------- scroll lock shared by menu, drawer, lightbox */
  let locks = 0;
  const lock = () => { if (locks++ === 0) document.body.classList.add('is-locked'); };
  const unlock = () => { if (--locks <= 0) { locks = 0; document.body.classList.remove('is-locked'); } };

  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    const els = $$(FOCUSABLE, container).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- header */
  const header = $('[data-header]');
  if (header) {
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px';
    document.body.prepend(sentinel);
    new IntersectionObserver(([e]) => header.classList.toggle('is-scrolled', !e.isIntersecting)).observe(sentinel);
  }

  /* ---------- mobile menu */
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-mobile-menu]');
  if (toggle && menu) {
    const close = (restore = true) => {
      if (menu.hidden) return;
      menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); unlock();
      if (restore) toggle.focus();
    };
    const open = () => { menu.hidden = false; toggle.setAttribute('aria-expanded', 'true'); lock(); $('a', menu)?.focus(); };
    toggle.addEventListener('click', () => (menu.hidden ? open() : close()));
    document.addEventListener('keydown', (e) => {
      if (menu.hidden) return;
      if (e.key === 'Escape') close();
      else trapFocus(header, e);
    });
    matchMedia('(min-width: 861px)').addEventListener('change', (m) => m.matches && close(false));
  }

  /* ---------- reveal on scroll */
  const reveals = $$('.reveal');
  if (reveals.length && !reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('is-in'));

  /* ---------- enquiry -> WhatsApp draft (never sends, never claims availability) */
  const WA = 'https://wa.me/27837062601';
  const fmt = (v) => (v ? new Date(v + 'T12:00:00').toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  $$('[data-enquiry]').forEach((form) => {
    const inEl = form.elements.checkin, outEl = form.elements.checkout;
    inEl.min = iso(today);
    const setErr = (el, msg) => {
      const err = document.getElementById(el.id + '-err');
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) { err.textContent = msg || ''; err.hidden = !msg; }
    };
    inEl.addEventListener('change', () => {
      setErr(inEl, '');
      if (inEl.value) {
        const d = new Date(inEl.value + 'T12:00:00'); d.setDate(d.getDate() + 1);
        outEl.min = iso(d);
        if (!outEl.value || outEl.value <= inEl.value) { const m = new Date(inEl.value + 'T12:00:00'); m.setDate(m.getDate() + 3); outEl.value = iso(m); }
      }
    });
    // The 3-night minimum is Durban Luxe's published policy. Shorter requests are still allowed
    // (the host decides), but the hint turns into a visible heads-up.
    const hint = document.getElementById(outEl.id + '-hint');
    const checkShort = () => {
      const n = inEl.value && outEl.value ? Math.round((new Date(outEl.value) - new Date(inEl.value)) / 864e5) : 0;
      const short = n > 0 && n < 3;
      if (hint) { hint.textContent = short ? `That's ${n} night${n === 1 ? '' : 's'}. The usual minimum is 3, but you can still ask.` : 'Minimum stay is 3 nights.'; hint.classList.toggle('field__hint--warn', short); }
    };
    inEl.addEventListener('change', checkShort);
    outEl.addEventListener('change', () => { setErr(outEl, ''); checkShort(); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let bad = null;
      if (!inEl.value) { setErr(inEl, 'Choose a check-in date.'); bad = bad || inEl; }
      else if (inEl.value < iso(today)) { setErr(inEl, 'Check-in can’t be in the past.'); bad = bad || inEl; }
      if (!outEl.value) { setErr(outEl, 'Choose a check-out date.'); bad = bad || outEl; }
      else if (inEl.value && outEl.value <= inEl.value) { setErr(outEl, 'Check-out must be after check-in.'); bad = bad || outEl; }
      if (bad) { bad.focus(); return; }
      const nights = Math.round((new Date(outEl.value) - new Date(inEl.value)) / 864e5);
      const f = form.elements;
      const prop = f.property?.value;
      const lines = [
        `Hi Durban Luxe, I'm interested in ${prop || 'a stay'}.`,
        f.url?.value ? f.url.value : null,
        '',
        `Check-in: ${fmt(inEl.value)}`,
        `Check-out: ${fmt(outEl.value)} (${nights} night${nights === 1 ? '' : 's'})`,
        `Guests: ${f.guests.value}`,
        f.name?.value.trim() ? `Name: ${f.name.value.trim()}` : null,
        f.message?.value.trim() ? `\n${f.message.value.trim()}` : null,
        '',
        prop ? 'Could you please confirm availability and pricing?' : 'Could you please suggest homes that are available, with pricing?',
      ].filter((l) => l !== null);
      window.open(`${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    });
  });

  /* jump links to the enquiry panel focus the first date field */
  $$('[data-jump-enquiry]').forEach((a) => a.addEventListener('click', (e) => {
    const target = document.getElementById('check-availability');
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => $('input[type="date"]', target)?.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
  }));

  /* ---------- mobile action bar: hide while the booking panel itself is visible */
  const bar = $('[data-action-bar]');
  const booking = document.getElementById('check-availability');
  if (bar && booking) new IntersectionObserver(([e]) => bar.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.15 }).observe(booking);

  /* ---------- gallery strip counter (mobile swipe) */
  const strip = $('[data-strip]');
  const idxEl = $('[data-strip-index]');
  if (strip && idxEl) {
    const items = $$('.gallery__item', strip);
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting && e.intersectionRatio > 0.6) idxEl.textContent = items.indexOf(e.target) + 1;
    }), { root: strip, threshold: [0.6] });
    items.forEach((i) => io.observe(i));
  }

  /* ---------- lightbox */
  const lb = $('[data-lightbox]');
  if (lb) {
    const data = JSON.parse($('[data-lb-images]', lb).textContent);
    const track = $('[data-lb-track]', lb);
    const count = $('[data-lb-index]', lb);
    let current = 0, opener = null, built = false;
    const build = () => {
      track.innerHTML = data.map((d, i) => `<figure class="lightbox__slide" data-i="${i}"><img src="${d.s}-1440.webp" srcset="${d.s}-1024.webp 1024w, ${d.s}-1440.webp 1440w" sizes="100vw" alt="${d.a.replace(/"/g, '&quot;')}" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async" width="1440" height="1440"></figure>`).join('');
      const slides = $$('.lightbox__slide', track);
      const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio > 0.55) { current = Number(e.target.dataset.i); count.textContent = current + 1; }
      }), { root: track, threshold: [0.55] });
      slides.forEach((s) => io.observe(s));
      built = true;
    };
    const go = (i, smooth = true) => {
      current = (i + data.length) % data.length;
      const slide = track.children[current];
      track.scrollTo({ left: slide.offsetLeft, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
      count.textContent = current + 1;
    };
    const open = (i, from) => {
      if (!built) build();
      opener = from || document.activeElement;
      lb.showModal(); lock();
      requestAnimationFrame(() => go(i, false));
      $('[data-lb-close]', lb).focus();
    };
    const close = () => { if (lb.open) lb.close(); };
    lb.addEventListener('close', () => { unlock(); opener?.focus(); });
    $$('[data-open-lightbox]').forEach((b) => b.addEventListener('click', () => open(Number(b.dataset.openLightbox), b)));
    $('[data-lb-close]', lb).addEventListener('click', close);
    $('[data-lb-prev]', lb).addEventListener('click', () => go(current - 1));
    $('[data-lb-next]', lb).addEventListener('click', () => go(current + 1));
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
      else trapFocus(lb, e);
    });
    lb.addEventListener('click', (e) => { if (e.target.classList.contains('lightbox__slide')) close(); });
  }

  /* ---------- collection filters (URL is the source of truth) */
  const col = $('[data-collection]');
  if (col) {
    const form = $('[data-filters-form]', col);
    const drawer = $('[data-filters]', col);
    const q = $('#f-q'), sort = $('#f-sort');
    const list = $('[data-results]', col);
    const cards = $$('[data-card]', list);
    const status = $('[data-results-status]', col);
    const empty = $('[data-empty]', col);
    const countBadge = $('[data-filter-count]', col);
    const applyLabel = $('[data-apply-label]', col);
    const total = cards.length;

    const read = () => {
      const p = new URLSearchParams(location.search);
      // accept friendly links: ?region=… or ?area=…
      if (p.get('region')) { p.set('where', 'region:' + p.get('region')); p.delete('region'); }
      if (p.get('area')) { p.set('where', 'area:' + p.get('area')); p.delete('area'); }
      return p;
    };
    const toForm = (p) => {
      form.elements.where.value = p.get('where') || '';
      if (form.elements.where.value !== (p.get('where') || '')) form.elements.where.value = '';
      ['guests', 'bedrooms', 'price', 'type'].forEach((k) => (form.elements[k].value = p.get(k) || ''));
      const feats = p.getAll('feature');
      $$('input[name="feature"]', form).forEach((c) => (c.checked = feats.includes(c.value)));
      q.value = p.get('q') || '';
      sort.value = p.get('sort') || '';
    };
    const fromForm = () => {
      const p = new URLSearchParams();
      const f = form.elements;
      ['where', 'guests', 'bedrooms', 'price', 'type'].forEach((k) => f[k].value && p.set(k, f[k].value));
      $$('input[name="feature"]:checked', form).forEach((c) => p.append('feature', c.value));
      if (q.value.trim()) p.set('q', q.value.trim());
      if (sort.value) p.set('sort', sort.value);
      return p;
    };
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '');

    const apply = (p) => {
      const where = p.get('where') || '';
      const [wk, wv] = where.split(':');
      const g = +p.get('guests') || 0, b = +p.get('bedrooms') || 0, pr = +p.get('price') || 0, t = p.get('type') || '';
      const feats = p.getAll('feature');
      const terms = norm(p.get('q') || '').split(/\s+/).filter(Boolean);
      let shown = 0;
      cards.forEach((c) => {
        const d = c.dataset;
        const ok =
          (!wk || (wk === 'region' ? d.region === wv : d.area === wv)) &&
          (+d.guests >= g) && (+d.bedrooms >= b) && (!pr || (d.price && +d.price <= pr)) && (!t || d.type === t) &&
          feats.every((f) => d.features.split(' ').includes(f)) &&
          terms.every((term) => norm(d.search).includes(term));
        c.hidden = !ok;
        if (ok) shown++;
      });
      const s = p.get('sort');
      const key = { 'price-asc': (c) => +c.dataset.price, 'price-desc': (c) => -c.dataset.price, 'guests-desc': (c) => -c.dataset.guests }[s] || ((c) => +c.dataset.order);
      [...cards].sort((a, z) => key(a) - key(z) || a.dataset.order - z.dataset.order).forEach((c) => list.append(c));

      const active = [...p.keys()].filter((k) => !['sort', 'q'].includes(k)).length + (p.getAll('feature').length > 1 ? p.getAll('feature').length - 1 : 0);
      countBadge.hidden = !active; countBadge.textContent = active;
      const whereLabel = where ? form.elements.where.selectedOptions[0]?.textContent.replace(/\s*\(\d+\)$/, '').replace(/^All of /, '') : '';
      status.textContent = shown === total ? `Showing all ${total} stays` : `Showing ${shown} of ${total} stays${whereLabel ? ` in ${whereLabel}` : ''}`;
      applyLabel.textContent = shown ? `Show ${shown} stay${shown === 1 ? '' : 's'}` : 'No matches';
      empty.hidden = shown > 0;
      list.hidden = shown === 0;
    };
    const commit = (push = true) => {
      const p = fromForm();
      const url = `${location.pathname}${p.toString() ? '?' + p : ''}`;
      if (url !== location.pathname + location.search) history[push ? 'pushState' : 'replaceState'](null, '', url);
      apply(p);
    };

    toForm(read());
    apply(read());
    history.replaceState(null, '', `${location.pathname}${fromForm().toString() ? '?' + fromForm() : ''}`);

    form.addEventListener('change', () => commit());
    sort.addEventListener('change', () => commit());
    let tId;
    q.addEventListener('input', () => { clearTimeout(tId); tId = setTimeout(() => commit(false), 180); });
    form.addEventListener('submit', (e) => e.preventDefault());
    q.form?.addEventListener?.('submit', (e) => e.preventDefault());
    $$('[data-filters-reset]', col).forEach((btn) => btn.addEventListener('click', (e) => {
      e.preventDefault(); form.reset(); q.value = ''; sort.value = ''; commit();
    }));
    addEventListener('popstate', () => { toForm(read()); apply(read()); });

    // mobile drawer
    const openBtn = $('[data-filters-open]', col);
    let backdrop = null;
    const isDrawer = () => matchMedia('(max-width: 1023px)').matches;
    const openDrawer = () => {
      drawer.classList.add('is-open');
      drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true');
      backdrop = document.createElement('div'); backdrop.className = 'filters-backdrop';
      backdrop.addEventListener('click', closeDrawer);
      drawer.before(backdrop);
      openBtn.setAttribute('aria-expanded', 'true');
      lock();
      $('select, input', drawer)?.focus();
    };
    const closeDrawer = () => {
      if (!drawer.classList.contains('is-open')) return;
      drawer.classList.remove('is-open'); drawer.removeAttribute('role'); drawer.removeAttribute('aria-modal');
      backdrop?.remove(); backdrop = null; openBtn.setAttribute('aria-expanded', 'false');
      unlock(); openBtn.focus();
    };
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.addEventListener('click', openDrawer);
    $$('[data-filters-close]', drawer).forEach((b) => b.addEventListener('click', () => {
      closeDrawer();
      if (b.classList.contains('filters__apply')) $('[data-results-status]', col).scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }));
    drawer.addEventListener('keydown', (e) => {
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeDrawer(); else trapFocus(drawer, e);
    });
    matchMedia('(max-width: 1023px)').addEventListener('change', () => !isDrawer() && closeDrawer());
  }
})();

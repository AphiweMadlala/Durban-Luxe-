import { esc, icon, waLink } from './components.mjs';

/**
 * Date + guest enquiry. It never checks or claims availability: on submit, site.js drafts a
 * WhatsApp message and opens the visitor's WhatsApp. Nothing is sent automatically.
 */
export function enquiryForm(ctx, { property = null, properties = [], id = 'enquiry', compact = false, heading = '' } = {}) {
  const { business } = ctx;
  const maxGuests = property ? property.guests + (property.guestsPlus ? 4 : 0) : 20;
  const guestOpts = Array.from({ length: maxGuests }, (_, i) => i + 1)
    .map((n) => `<option value="${n}"${n === Math.min(2, maxGuests) ? ' selected' : ''}>${n} guest${n > 1 ? 's' : ''}</option>`)
    .join('');
  const propField = property
    ? `<input type="hidden" name="property" value="${esc(property.name)}"><input type="hidden" name="url" value="${esc(ctx.config.siteUrl)}stays/${property.slug}/">`
    : `<div class="field field--full">
        <label for="${id}-property">Stay</label>
        <select id="${id}-property" name="property">
          <option value="">Not sure yet, please suggest</option>
          ${properties.map((p) => `<option value="${esc(p.name)}">${esc(p.name)} (${esc(p.area)}, sleeps ${p.guests}${p.guestsPlus ? '+' : ''})</option>`).join('')}
        </select>
      </div>`;
  return `<form class="enquiry${compact ? ' enquiry--compact' : ''}" id="${id}" data-enquiry novalidate aria-describedby="${id}-note">
  ${heading ? `<h2 class="enquiry__title">${heading}</h2>` : ''}
  <div class="enquiry__fields">
    ${propField}
    <div class="field">
      <label for="${id}-in">Check-in</label>
      <input id="${id}-in" name="checkin" type="date" required aria-describedby="${id}-in-err">
      <p class="field__error" id="${id}-in-err" hidden></p>
    </div>
    <div class="field">
      <label for="${id}-out">Check-out</label>
      <input id="${id}-out" name="checkout" type="date" required aria-describedby="${id}-out-err ${id}-out-hint">
      <p class="field__hint" id="${id}-out-hint">Minimum stay is 3 nights.</p>
      <p class="field__error" id="${id}-out-err" hidden></p>
    </div>
    <div class="field${compact ? ' field--full' : ''}">
      <label for="${id}-guests">Guests</label>
      <select id="${id}-guests" name="guests">${guestOpts}</select>
    </div>
    ${compact ? '' : `<div class="field">
      <label for="${id}-name">Your name <span class="field__opt">(optional)</span></label>
      <input id="${id}-name" name="name" type="text" autocomplete="name">
    </div>
    <div class="field field--full">
      <label for="${id}-msg">Anything else? <span class="field__opt">(optional)</span></label>
      <textarea id="${id}-msg" name="message" rows="3" placeholder="Occasion, children, arrival time…"></textarea>
    </div>`}
  </div>
  <button class="btn btn--primary btn--block" type="submit">Check availability</button>
  <p class="enquiry__note" id="${id}-note">${icon('whatsapp-logo')} Opens WhatsApp with your dates filled in, ready to send to us. We'll confirm availability and the current rate. Nothing is booked or sent until you press send.</p>
  <noscript><p class="enquiry__note"><a href="${waLink(business, property ? `Hi Durban Luxe, I'm interested in ${property.name}.` : 'Hi Durban Luxe, I would like to enquire about a stay.')}">Message us on WhatsApp</a></p></noscript>
</form>`;
}

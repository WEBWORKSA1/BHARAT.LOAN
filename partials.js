/* BHARAT.LOAN runtime — one file powers every page.
   Header/footer HTML is baked into each page daily by scripts/build.mjs; this file adds the behaviour:
   analytics, lead capture (inbox hidden), ads, search, languages, mobile menu, sharing, donations,
   cookie notice and exit-intent. Edit only the CONFIG block below. */
(function () {
  'use strict';

  // ============================================================
  // CONFIG — Web, these are the only values you ever need to edit.
  // Anything still containing 'X' (or left empty) stays switched off.
  // ============================================================
  var CONFIG = {
    GA4_ID: 'G-XXXXXXXXXX',            // analytics.google.com → Admin → Data streams → Measurement ID
    CLARITY_ID: 'XXXXXXXXXX',          // clarity.microsoft.com → project ID
    WHATSAPP_NUMBER: '91XXXXXXXXXX',   // country code + number, digits only
    WHATSAPP_MESSAGE: 'Hi BHARAT.LOAN, I want to check which government schemes my business qualifies for.',
    ADSENSE_CLIENT: 'ca-pub-6620975821265271',
    // Optional manual ad units (AdSense → Ads → By ad unit). Auto Ads works without these.
    AD_SLOTS: { 'in-article': '', 'display': '' },
    // Optional: the random form alias FormSubmit emails you after activation (e.g. 'a1b2c3d4e5...').
    FORM_ALIAS: '',
    // Donations / support — buttons appear on /support only when filled.
    DONATE: { upi: '', upiName: 'BHARAT.LOAN', paypal: '', buymeacoffee: '', razorpay: '' },
    // Social / community links — shown in Support & Updates pages when filled.
    SOCIAL: { youtube: '', x: '', linkedin: '', instagram: '', telegram: '', whatsappChannel: '' },
    SPONSOR_URL: 'https://web.works/contact'
  };

  var BL = window.BL = window.BL || {};
  BL.config = CONFIG;
  var d = document, w = window;
  var real = function (v) { return v && String(v).indexOf('X') === -1; };
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  // ---------------- analytics ----------------
  if (real(CONFIG.GA4_ID)) {
    var g = d.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.GA4_ID; d.head.appendChild(g);
    w.dataLayer = w.dataLayer || []; w.gtag = function () { w.dataLayer.push(arguments); };
    w.gtag('js', new Date()); w.gtag('config', CONFIG.GA4_ID, { anonymize_ip: true });
  }
  if (real(CONFIG.CLARITY_ID)) {
    (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(w, d, 'clarity', 'script', CONFIG.CLARITY_ID);
  }
  var track = BL.track = function (name, params) { try { if (w.gtag) w.gtag('event', name, params || {}); } catch (e) {} };

  // ---------------- attribution (first touch) ----------------
  (function () {
    if (ls.get('bl_src')) return;
    var q = new URLSearchParams(location.search), src = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'ref'].forEach(function (k) { if (q.get(k)) src[k] = q.get(k); });
    src.landing = location.pathname; src.referrer = d.referrer || '(direct)';
    ls.set('bl_src', JSON.stringify(src));
  })();

  // ---------------- lead engine ----------------
  // The inbox address is never written in page source; it is assembled only when a form is sent.
  var _r = [109, 111, 99, 46, 108, 105, 97, 109, 103, 64, 49, 97, 115, 107, 114, 111, 119, 98, 101, 119];
  function endpoint() { return 'https://formsubmit.co/ajax/' + (CONFIG.FORM_ALIAS || String.fromCharCode.apply(null, _r.slice().reverse())); }
  function istNow() { try { return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }); } catch (e) { return new Date().toISOString(); } }
  function score(f) {
    var s = 0, amt = String(f.amount || f.loan_size || '');
    if (/1 ?Cr|10 ?Cr|crore/i.test(amt)) s += 3; else if (/10 ?L|25 ?L|50 ?L|lakh/i.test(amt)) s += 2; else if (amt) s += 1;
    if (f.email) s += 1; if (f.stage && /growing|established/i.test(f.stage)) s += 1; if (f.timeline && /now|30|immediately/i.test(f.timeline)) s += 2;
    return s >= 5 ? 'HOT' : s >= 3 ? 'WARM' : 'NEW';
  }
  BL.phoneOk = function (p) { var x = String(p || '').replace(/[\s()-]/g, ''); return /^(\+?91)?0?[6-9]\d{9}$/.test(x); };
  BL.send = function (fields, type) {
    type = type || 'lead';
    if (fields._honey) return Promise.resolve({ ok: true, spam: true });
    var key = type + '|' + (fields.phone || fields.email || fields.name || '');
    var lastRaw = (ls.get('bl_last') || '').split('#');
    if (lastRaw[0] === key && Date.now() - (+lastRaw[1] || 0) < 15000) return Promise.resolve({ ok: true, dup: true });
    var src = {}; try { src = JSON.parse(ls.get('bl_src') || '{}'); } catch (e) {}
    var data = {};
    Object.keys(fields).forEach(function (k) { if (k !== '_honey' && fields[k] !== '' && fields[k] != null) data[k] = fields[k]; });
    var tag = type === 'lead' || type === 'funding' ? score(data) : type.toUpperCase();
    data._subject = '[BHARAT.LOAN] ' + tag + ' · ' + (data.scheme || data.subject || type) + (data.state ? ' · ' + data.state : '') + (data.name ? ' · ' + data.name : '');
    data._template = 'table'; data._captcha = 'false';
    data.lead_type = type; data.page = location.href; data.page_title = d.title; data.submitted_ist = istNow();
    data.first_touch = [src.utm_source, src.utm_medium, src.utm_campaign, src.ref].filter(Boolean).join(' / ') || src.referrer || '';
    data.landing_page = src.landing || '';
    return fetch(endpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        ls.set('bl_last', key + '#' + Date.now());
        track('generate_lead', { lead_type: type, scheme: data.scheme || '', state: data.state || '', quality: tag });
        return { ok: true };
      })
      .catch(function (e) {
        var q = []; try { q = JSON.parse(ls.get('bl_q') || '[]'); } catch (x) {}
        q.push({ f: fields, t: type, at: Date.now() }); ls.set('bl_q', JSON.stringify(q.slice(-5)));
        return { ok: false, error: String(e && e.message || e) };
      });
  };
  // retry anything that failed to send on a previous visit
  setTimeout(function () {
    var q = []; try { q = JSON.parse(ls.get('bl_q') || '[]'); } catch (e) {}
    if (!q.length || !navigator.onLine) return;
    ls.set('bl_q', '[]');
    q.forEach(function (it, i) { setTimeout(function () { BL.send(it.f, it.t); }, i * 3000); });
  }, 4000);

  var STATES = ['Uttar Pradesh', 'Gujarat', 'Maharashtra', 'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttarakhand', 'West Bengal', 'North-East state', 'Other state / UT'];
  BL.STATES = STATES;
  var AMOUNTS = ['Under ₹10 lakh', '₹10 lakh – ₹50 lakh', '₹50 lakh – ₹1 Cr', '₹1 Cr – ₹10 Cr', 'Above ₹10 Cr', 'Not sure yet'];
  BL.AMOUNTS = AMOUNTS;
  var opt = function (a, ph) { return '<option value="">' + ph + '</option>' + a.map(function (x) { return '<option>' + x + '</option>'; }).join(''); };
  var esc = BL.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  function thanks(name, phone, extra) {
    return '<div class="thanks"><div class="t-ic">✓</div><p class="t-h">Thank you' + (name ? ', ' + esc(name) : '') + '.</p><p>Our advisory desk will contact you' + (phone ? ' on <b>' + esc(phone) + '</b>' : '') + ' within one business day. First assessment is free.</p>' + (extra || '') + '<p class="t-next"><a href="/get-funding">See every scheme you qualify for →</a></p></div>';
  }
  BL.thanks = thanks;

  // Upgrade the sidebar consultation card on scheme / district pages
  function enhanceCards() {
    $$('.cta-card').forEach(function (card) {
      var btn = $('#leadBtn', card) || $('button', card);
      var body = $('.cc-body', card);
      if (!btn || !body || card.getAttribute('data-bl')) return;
      card.setAttribute('data-bl', '1');
      var h1 = $('h1');
      var scheme = card.getAttribute('data-scheme') || (h1 ? h1.textContent.trim() : d.title);
      var guessState = /Gujarat/.test(scheme) ? 'Gujarat' : /Maharashtra|CMEGP|Annasaheb/.test(scheme) ? 'Maharashtra' : (/ODOP|UP\b|Uttar|CM-YUVA|CMYSY|UPIEPP/.test(scheme + location.pathname) ? 'Uttar Pradesh' : '');
      var wrap = d.createElement('div');
      wrap.innerHTML = '<select class="field" id="bl-st" aria-label="Your state">' + opt(STATES, 'Your state') + '</select>' +
        '<select class="field" id="bl-am" aria-label="Funding needed">' + opt(AMOUNTS, 'Funding needed') + '</select>' +
        '<input type="text" class="hp" id="bl-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<label class="consent"><input type="checkbox" id="bl-ok"> I agree to be contacted about my enquiry and accept the <a href="/privacy">Privacy Policy</a>.</label>' +
        '<div class="form-msg" role="status" aria-live="polite"></div>';
      body.insertBefore(wrap, btn);
      if (guessState) $('#bl-st', card).value = guessState;
      var nb = btn.cloneNode(true); btn.parentNode.replaceChild(nb, btn);
      nb.type = 'button';
      nb.addEventListener('click', function () {
        var n = ($('#cn', card) || {}).value || '', p = ($('#cp', card) || {}).value || '', e = ($('#ce', card) || {}).value || '';
        var msg = $('.form-msg', card);
        n = n.trim(); p = p.trim();
        if (n.length < 2) { msg.textContent = 'Please add your name.'; return; }
        if (!BL.phoneOk(p)) { msg.textContent = 'Please enter a valid 10-digit Indian mobile number.'; return; }
        if (!$('#bl-ok', card).checked) { msg.textContent = 'Please tick the consent box so we can contact you.'; return; }
        nb.disabled = true; nb.textContent = 'Sending…'; msg.textContent = '';
        BL.send({ name: n, phone: p, email: e.trim(), scheme: scheme, state: $('#bl-st', card).value, amount: $('#bl-am', card).value, _honey: $('#bl-hp', card).value, consent: 'yes' }, 'lead').then(function (r) {
          if (r.ok) body.innerHTML = thanks(n, p);
          else { nb.disabled = false; nb.textContent = 'Try again →'; msg.textContent = 'We could not send your request (connection problem). Your details are saved and will retry automatically — or press “Try again”.'; }
        });
      });
    });
  }

  // Any <form data-bl-form="type"> on the site
  function bindForms() {
    $$('form[data-bl-form]').forEach(function (f) {
      if (f.getAttribute('data-bound')) return; f.setAttribute('data-bound', '1');
      f.setAttribute('novalidate', '');
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var msg = $('.form-msg', f), btn = $('button[type="submit"]', f) || $('button', f);
        var fields = {}, bad = null;
        $$('input,select,textarea', f).forEach(function (el) {
          if (!el.name) return;
          if (el.type === 'checkbox') { if (el.checked) fields[el.name] = fields[el.name] ? fields[el.name] + ', ' + el.value : el.value; }
          else if (el.type === 'radio') { if (el.checked) fields[el.name] = el.value; }
          else fields[el.name] = (el.value || '').trim();
          if (!bad && el.required && ((el.type === 'checkbox' && !el.checked) || (el.type !== 'checkbox' && !(el.value || '').trim()))) bad = el;
          if (!bad && el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) bad = el;
          if (!bad && el.type === 'tel' && el.value && !BL.phoneOk(el.value)) bad = el;
        });
        if (bad) { if (msg) msg.textContent = bad.getAttribute('data-err') || (bad.type === 'checkbox' ? 'Please tick the consent box.' : bad.type === 'tel' ? 'Please enter a valid 10-digit mobile number.' : 'Please complete: ' + (bad.getAttribute('aria-label') || bad.placeholder || bad.name)); bad.focus(); return; }
        var type = f.getAttribute('data-bl-form');
        fields.subject = f.getAttribute('data-subject') || type;
        if (btn) { btn.disabled = true; btn.setAttribute('data-t', btn.textContent); btn.textContent = 'Sending…'; }
        BL.send(fields, type).then(function (r) {
          if (btn) { btn.disabled = false; btn.textContent = btn.getAttribute('data-t'); }
          if (r.ok) {
            var ok = f.getAttribute('data-success');
            if (ok === 'replace') f.innerHTML = thanks(fields.name, fields.phone);
            else { if (msg) { msg.className = 'form-msg ok'; msg.textContent = ok || 'Thank you — received. We will be in touch shortly.'; } f.reset(); }
          } else if (msg) { msg.className = 'form-msg err'; msg.textContent = 'Could not send (connection problem). Your details are saved and will retry automatically — or try again.'; }
        });
      });
    });
  }

  // ---------------- ads ----------------
  function ads() {
    $$('.ad-slot[data-ad]').forEach(function (el) {
      var slot = CONFIG.AD_SLOTS[el.getAttribute('data-ad')];
      if (!slot) { el.parentNode && el.parentNode.removeChild(el); return; }
      var fmt = el.getAttribute('data-ad') === 'in-article' ? ' data-ad-format="fluid" data-ad-layout="in-article"' : ' data-ad-format="auto" data-full-width-responsive="true"';
      el.innerHTML = '<ins class="adsbygoogle" style="display:block;text-align:center" data-ad-client="' + CONFIG.ADSENSE_CLIENT + '" data-ad-slot="' + slot + '"' + fmt + '></ins>';
      el.classList.add('filled');
      try { (w.adsbygoogle = w.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  // ---------------- mobile menu ----------------
  function menu() {
    var b = $('[data-bl-menu]'), m = $('#mnav'); if (!b || !m) return;
    b.addEventListener('click', function () { var open = m.hasAttribute('hidden'); if (open) m.removeAttribute('hidden'); else m.setAttribute('hidden', ''); b.setAttribute('aria-expanded', open ? 'true' : 'false'); d.body.classList.toggle('nav-open', open); });
  }

  // ---------------- search ----------------
  var IDX = null;
  function loadIdx() { return IDX ? Promise.resolve(IDX) : fetch('/data/search-index.json').then(function (r) { return r.json(); }).then(function (j) { IDX = j; return j; }).catch(function () { IDX = []; return IDX; }); }
  BL.search = function (q, n) {
    q = String(q || '').toLowerCase().trim(); if (!q) return [];
    var terms = q.split(/\s+/);
    return (IDX || []).map(function (x) {
      var hay = (x.t + ' ' + x.d + ' ' + x.k + ' ' + x.u).toLowerCase(), s = 0;
      for (var i = 0; i < terms.length; i++) { if (hay.indexOf(terms[i]) === -1) return null; s += (x.t.toLowerCase().indexOf(terms[i]) > -1 ? 3 : 1); }
      if (x.k === 'Scheme') s += 2; return { x: x, s: s };
    }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, n || 8).map(function (r) { return r.x; });
  };
  BL.loadIdx = loadIdx;
  function searchUI() {
    var b = $('[data-bl-search]'); if (!b) return;
    var o = d.createElement('div'); o.className = 'srch'; o.setAttribute('hidden', ''); o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Search');
    o.innerHTML = '<div class="srch-box"><input type="search" placeholder="Search schemes, districts, guides… (e.g. PMEGP, Varanasi, women loan)" aria-label="Search"><div class="srch-res"></div><p class="srch-hint">Enter to see all results · Esc to close</p></div>';
    d.body.appendChild(o);
    var inp = $('input', o), res = $('.srch-res', o);
    var close = function () { o.setAttribute('hidden', ''); d.body.classList.remove('noscroll'); };
    b.addEventListener('click', function () { o.removeAttribute('hidden'); d.body.classList.add('noscroll'); inp.focus(); loadIdx(); });
    o.addEventListener('click', function (e) { if (e.target === o) close(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); if (e.key === '/' && !/input|textarea|select/i.test((d.activeElement || {}).tagName || '')) { e.preventDefault(); b.click(); } });
    inp.addEventListener('input', function () { loadIdx().then(function () { var r = BL.search(inp.value, 8); res.innerHTML = r.map(function (x) { return '<a href="' + x.u + '"><span class="k">' + esc(x.k) + '</span><b>' + esc(x.t) + '</b><small>' + esc(x.d) + '</small></a>'; }).join('') || (inp.value ? '<p class="muted">No match — try a scheme name or district.</p>' : ''); }); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { track('search', { search_term: inp.value }); location.href = '/search?q=' + encodeURIComponent(inp.value); } });
  }

  // ---------------- languages (Google Translate) ----------------
  var LANGS = [['en', 'English'], ['hi', 'हिंदी'], ['gu', 'ગુજરાતી'], ['mr', 'मराठी'], ['bn', 'বাংলা'], ['ta', 'தமிழ்'], ['te', 'తెలుగు'], ['kn', 'ಕನ್ನಡ'], ['pa', 'ਪੰਜਾਬੀ'], ['ur', 'اردو']];
  function curLang() { var m = d.cookie.match(/googtrans=\/en\/([a-z-]+)/); return m ? m[1] : 'en'; }
  function setLang(l) {
    var host = location.hostname, v = l === 'en' ? '' : '/en/' + l, exp = l === 'en' ? ';expires=Thu, 01 Jan 1970 00:00:00 GMT' : '';
    d.cookie = 'googtrans=' + v + ';path=/' + exp; d.cookie = 'googtrans=' + v + ';path=/;domain=' + host + exp; d.cookie = 'googtrans=' + v + ';path=/;domain=.' + host.replace(/^www\./, '') + exp;
    track('select_language', { language: l }); location.reload();
  }
  function langUI() {
    var b = $('[data-bl-lang]'); if (!b) return;
    var cur = curLang(), menuEl = d.createElement('div'); menuEl.className = 'lang-menu'; menuEl.setAttribute('hidden', '');
    menuEl.innerHTML = LANGS.map(function (l) { return '<button type="button" data-l="' + l[0] + '"' + (l[0] === cur ? ' class="on"' : '') + '>' + l[1] + '</button>'; }).join('');
    b.parentNode.style.position = 'relative'; b.parentNode.appendChild(menuEl);
    b.addEventListener('click', function (e) { e.stopPropagation(); if (menuEl.hasAttribute('hidden')) menuEl.removeAttribute('hidden'); else menuEl.setAttribute('hidden', ''); });
    d.addEventListener('click', function () { menuEl.setAttribute('hidden', ''); });
    $$('button', menuEl).forEach(function (x) { x.addEventListener('click', function () { setLang(x.getAttribute('data-l')); }); });
    if (cur !== 'en') {
      var lbl = LANGS.filter(function (l) { return l[0] === cur; })[0]; if (lbl) $('span', b).textContent = lbl[1];
      var holder = d.createElement('div'); holder.id = 'gt-el'; holder.style.display = 'none'; d.body.appendChild(holder);
      w.blTranslateInit = function () { try { new w.google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'gt-el'); } catch (e) {} };
      var s = d.createElement('script'); s.src = 'https://translate.google.com/translate_a/element.js?cb=blTranslateInit'; s.async = true; d.body.appendChild(s);
    }
  }

  // ---------------- share bar ----------------
  function share() {
    var host = $('.shead') || $('.prose > h1') || $('.page-hero .wrap');
    if (!host || $('.sharebar') || d.body.hasAttribute('data-noshare')) return;
    var u = encodeURIComponent(location.href.split('#')[0]), t = encodeURIComponent(d.title.replace(/\s*\|\s*BHARAT\.LOAN.*$/, ''));
    var bar = d.createElement('div'); bar.className = 'sharebar';
    bar.innerHTML = '<span>Share:</span><a href="https://wa.me/?text=' + t + '%20' + u + '" target="_blank" rel="noopener" data-net="whatsapp">WhatsApp</a><a href="https://twitter.com/intent/tweet?url=' + u + '&text=' + t + '" target="_blank" rel="noopener" data-net="x">X</a><a href="https://www.linkedin.com/sharing/share-offsite/?url=' + u + '" target="_blank" rel="noopener" data-net="linkedin">LinkedIn</a><a href="https://www.facebook.com/sharer/sharer.php?u=' + u + '" target="_blank" rel="noopener" data-net="facebook">Facebook</a><button type="button" data-net="copy">Copy link</button><button type="button" data-net="print">Print / PDF</button>';
    if (host.classList && (host.classList.contains('shead') || host.classList.contains('wrap'))) host.appendChild(bar); else host.parentNode.insertBefore(bar, host.nextSibling);
    $$('a,button', bar).forEach(function (a) {
      a.addEventListener('click', function () {
        var net = a.getAttribute('data-net'); track('share', { method: net, content_type: 'page', item_id: location.pathname });
        if (net === 'copy') { (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject()).then(function () { a.textContent = 'Copied ✓'; }, function () { prompt('Copy this link:', location.href); }); }
        if (net === 'print') w.print();
      });
    });
  }

  // ---------------- WhatsApp + sticky mobile CTA ----------------
  var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41Z"/></svg>';
  function sticky() {
    var hasWA = real(CONFIG.WHATSAPP_NUMBER);
    var wa = hasWA ? 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(CONFIG.WHATSAPP_MESSAGE) : '';
    if (hasWA) $$('.wa-link').forEach(function (a) { a.href = wa; a.removeAttribute('hidden'); });
    if (/^\/get-funding/.test(location.pathname)) return;
    var box = d.createElement('div');
    box.innerHTML = (hasWA ? '<a class="wa-fab" href="' + wa + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' + WA_ICON + '</a>' : '') +
      '<div class="mcta-bar">' + (hasWA ? '<a class="mcta-wa" href="' + wa + '" target="_blank" rel="noopener">' + WA_ICON + ' WhatsApp</a>' : '') + '<a class="mcta-book" href="/get-funding">Check my eligibility — free →</a></div>';
    while (box.firstChild) d.body.appendChild(box.firstChild);
  }

  // ---------------- donations (shown only when configured) ----------------
  function donations() {
    var D = CONFIG.DONATE, any = false;
    $$('[data-donate]').forEach(function (el) {
      var k = el.getAttribute('data-donate'), v = D[k];
      if (!v) return; any = true; el.removeAttribute('hidden');
      if (k === 'upi') {
        var amt = el.getAttribute('data-amount') || '';
        var link = 'upi://pay?pa=' + encodeURIComponent(v) + '&pn=' + encodeURIComponent(D.upiName || 'BHARAT.LOAN') + '&cu=INR&tn=' + encodeURIComponent('Support BHARAT.LOAN') + (amt ? '&am=' + amt : '');
        el.href = link;
        var qr = $('[data-upi-qr]'); if (qr) { qr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(link); qr.removeAttribute('hidden'); }
        var idel = $('[data-upi-id]'); if (idel) { idel.textContent = v; idel.parentNode.removeAttribute('hidden'); }
      } else if (k === 'paypal') el.href = /^https?:/.test(v) ? v : 'https://www.paypal.com/paypalme/' + v;
      else if (k === 'buymeacoffee') el.href = /^https?:/.test(v) ? v : 'https://www.buymeacoffee.com/' + v;
      else el.href = v;
      el.addEventListener('click', function () { track('donate_click', { method: k }); });
    });
    $$('[data-donate-fallback]').forEach(function (el) { if (any) el.setAttribute('hidden', ''); });
    Object.keys(CONFIG.SOCIAL).forEach(function (k) { var v = CONFIG.SOCIAL[k]; $$('[data-social="' + k + '"]').forEach(function (a) { if (v) { a.href = v; a.removeAttribute('hidden'); } }); });
  }

  // ---------------- YouTube lite embeds ----------------
  function yt() {
    $$('.yt[data-yt]').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-yt'); if (!/^[\w-]{6,20}$/.test(id)) return;
        el.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
        track('video_start', { video_id: id });
      });
    });
  }

  // ---------------- tag filters (updates page etc.) ----------------
  function chips() {
    $$('[data-filter-target]').forEach(function (bar) {
      var target = $(bar.getAttribute('data-filter-target')); if (!target) return;
      $$('button[data-f]', bar).forEach(function (b) {
        b.addEventListener('click', function () {
          $$('button', bar).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on');
          var f = b.getAttribute('data-f');
          $$('li[data-tags]', target).forEach(function (li) { li.style.display = (f === 'all' || (' ' + li.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') > -1) ? '' : 'none'; });
          $$('section', target).forEach(function (s) { s.style.display = $$('li', s).some(function (li) { return li.style.display !== 'none'; }) ? '' : 'none'; });
        });
      });
    });
  }

  // ---------------- cookie notice ----------------
  function cookies() {
    if (ls.get('bl_ck')) return;
    var c = d.createElement('div'); c.className = 'ck'; c.setAttribute('role', 'region'); c.setAttribute('aria-label', 'Cookie notice');
    c.innerHTML = '<p>We use cookies for analytics and to show ads (Google AdSense). See our <a href="/cookie-policy">Cookie Policy</a>.</p><button type="button">OK</button>';
    d.body.appendChild(c); $('button', c).addEventListener('click', function () { ls.set('bl_ck', '1'); c.parentNode.removeChild(c); });
  }

  // ---------------- exit intent (desktop only, once a week) ----------------
  function exitIntent() {
    if (w.matchMedia && !w.matchMedia('(min-width: 900px) and (pointer: fine)').matches) return;
    if (/^\/(get-funding|contact|privacy|terms|disclaimer|cookie-policy|copyright|support|careers|contests|advertise)/.test(location.pathname)) return;
    var last = +(ls.get('bl_exit') || 0); if (Date.now() - last < 7 * 864e5) return;
    var armed = false; setTimeout(function () { armed = true; }, 12000);
    d.addEventListener('mouseout', function h(e) {
      if (!armed || e.relatedTarget || e.clientY > 8) return;
      d.removeEventListener('mouseout', h); ls.set('bl_exit', String(Date.now()));
      var m = d.createElement('div'); m.className = 'xmodal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Free eligibility check');
      m.innerHTML = '<div class="xm-box"><button type="button" class="xm-x" aria-label="Close">×</button><span class="k">Before you go</span><h3>Most businesses qualify for 3+ schemes they never claim.</h3><p>Answer 6 quick questions — see every central and state scheme you match, free.</p><a class="btn btn-primary" href="/get-funding?src=exit">Check my eligibility — 60 seconds →</a></div>';
      d.body.appendChild(m); track('exit_intent_view');
      var cl = function () { if (m.parentNode) m.parentNode.removeChild(m); };
      $('.xm-x', m).addEventListener('click', cl); m.addEventListener('click', function (ev) { if (ev.target === m) cl(); });
    });
  }

  // ---------------- chrome fallback (pages not yet baked by the build) ----------------
  function chromeFallback() {
    var h = d.getElementById('site-header'), f = d.getElementById('site-footer');
    if (!h && !f) return Promise.resolve();
    return fetch('/assets/chrome.json').then(function (r) { return r.json(); }).then(function (c) { if (h) h.outerHTML = c.header; if (f) f.outerHTML = c.footer; }).catch(function () {});
  }

  // misc: outbound sponsor link tracking + scroll reveal
  function misc() {
    $$('[data-bl-ev]').forEach(function (a) { a.addEventListener('click', function () { track(a.getAttribute('data-bl-ev')); }); });
    if ('IntersectionObserver' in w) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.1 });
      $$('.reveal').forEach(function (el) { io.observe(el); });
    } else $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  function boot() {
    chromeFallback().then(function () {
      menu(); searchUI(); langUI(); enhanceCards(); bindForms(); ads(); share(); sticky(); donations(); yt(); chips(); cookies(); exitIntent(); misc();
      d.dispatchEvent(new CustomEvent('bl:ready'));
    });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();

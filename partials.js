/* BHARAT.LOAN shared chrome — single source of truth.
   Header, footer, analytics, WhatsApp, sticky mobile CTA.
   Change this file once; every page that includes it updates instantly.
   No build step, no Node. Pure browser JS. */
(function () {
  // ============================================================
  // ANALYTICS — Web, paste real IDs after creating accounts.
  // analytics.google.com → Admin → Data Streams → Web → Measurement ID
  // clarity.microsoft.com → New project → Project ID
  // ============================================================
  var GA4_ID     = 'G-XXXXXXXXXX';   // <-- paste GA4 Measurement ID here
  var CLARITY_ID = 'XXXXXXXXXX';     // <-- paste Microsoft Clarity Project ID here

  // ============================================================
  // CONTACT — Web, paste real numbers once available.
  // WhatsApp: 91 + 10 digits, no spaces (e.g. '919876543210').
  // ============================================================
  var WHATSAPP_NUMBER = '91XXXXXXXXXX';                                   // <-- WhatsApp Business number
  var WHATSAPP_MSG    = 'Hi, I am interested in a government scheme consultation.';
  var PHONE_DISPLAY   = '+91 XXXXX XXXXX';                                // <-- visible phone (e.g. Exotel virtual)

  function loadGA4(id) {
    if (!id || id.indexOf('XXX') > -1) return;
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', id, { anonymize_ip: true });
  }

  function loadClarity(id) {
    if (!id || id.indexOf('XXX') > -1) return;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", id);
  }

  loadGA4(GA4_ID);
  loadClarity(CLARITY_ID);

  // ============================================================
  // SHARED STYLES (WhatsApp link + sticky mobile CTA)
  // Injected at head so styles.css stays the canonical layout source.
  // ============================================================
  var CSS = ''
    + '.util .util-r{display:flex;align-items:center;gap:14px;font-weight:600}'
    + '.util .wa-link{color:#25D366 !important;display:inline-flex;align-items:center;gap:5px}'
    + '.util .wa-link svg{width:13px;height:13px}'
    + '.stickybar{display:none}'
    + '@media(max-width:900px){'
    +   '.stickybar{position:fixed;left:0;right:0;bottom:0;background:#fff;border-top:1px solid var(--line);box-shadow:0 -4px 14px rgba(0,0,0,.08);display:flex;z-index:80;padding:9px 12px;gap:10px}'
    +   '.stickybar a{flex:1;text-align:center;padding:13px 8px;border-radius:9px;font-weight:600;font-size:14px;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:7px;color:#fff}'
    +   '.stickybar svg{width:16px;height:16px}'
    +   '.stickybar .wa-cta{background:#25D366}'
    +   '.stickybar .wa-cta:active{background:#1ea854}'
    +   '.stickybar .cn-cta{background:#1456e6}'
    +   '.stickybar .cn-cta:active{background:#0d3fb5}'
    +   '.util .wa-link{display:none}'   /* WhatsApp shifts to sticky bar on mobile */
    +   'body{padding-bottom:84px !important}'
    + '}';
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  // ============================================================
  // WhatsApp SVG icon (inline, reused in util bar + sticky bar)
  // ============================================================
  var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9c-.3-.1-.5-.1-.7.1c-.2.3-.7.9-.9 1.1c-.2.2-.3.2-.6.1c-.3-.1-1.3-.5-2.4-1.5c-.9-.8-1.5-1.8-1.7-2.1c-.2-.3 0-.5.1-.6c.1-.1.3-.3.4-.5c.1-.1.2-.3.2-.5c.1-.2 0-.4 0-.5c-.1-.1-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5c-.2 0-.4 0-.6 0c-.2 0-.5.1-.8.4c-.3.3-1 1-1 2.4c0 1.4 1.1 2.8 1.2 3c.1.2 2.1 3.2 5 4.5c.7.3 1.2.5 1.7.6c.7.2 1.3.2 1.8.1c.6-.1 1.7-.7 1.9-1.4c.2-.7.2-1.3.2-1.4c-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2c5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>';

  var WA_URL = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_MSG);

  // ============================================================
  // HEADER + FOOTER + STICKY BAR
  // ============================================================
  var HEADER =
    '<div class="util"><div class="wrap"><div class="gov"><span class="dot"></span> Verified scheme reference \u00b7 BHARAT.LOAN</div>' +
    '<div class="util-r"><a class="wa-link" href="' + WA_URL + '" target="_blank" rel="noopener">' + WA_ICON + 'WhatsApp</a> <a href="/#engine">Check Your Eligibility \u2192</a></div></div></div>' +
    '<header><div class="wrap">' +
    '<a href="/" class="brand"><div class="crest"><span>\u092d\u093e</span></div><div class="brand-tx"><b>BHARAT.LOAN</b><small>Scheme &amp; Subsidy Advisory</small></div></a>' +
    '<nav class="main"><a href="/#schemes">Schemes</a><a href="/#states">States</a><a href="/#engine">Check Eligibility</a><a href="/about.html">About</a><a href="/acquisition.html" class="cta-partner">Partnership / Sponsorship</a><a href="/#engine" class="cta-sm">Book a Consultation</a></nav>' +
    '</div></header>';

  var FOOTER =
    '<footer><div class="wrap"><div class="fbrand"><b>BHARAT.LOAN</b></div>' +
    '<p style="margin:10px 0 18px;max-width:360px;line-height:1.6">Government scheme, subsidy and incentive advisory for Indian startups, MSMEs and industries. Advisory delivered by CONSULT.IN.</p>' +
    '<p style="margin:0 0 18px;font-size:13px"><a href="/about.html" style="color:#5b6b7a;text-decoration:none;margin-right:18px">About</a><a href="/contact.html" style="color:#5b6b7a;text-decoration:none;margin-right:18px">Contact</a><a href="/privacy.html" style="color:#5b6b7a;text-decoration:none;margin-right:18px">Privacy</a><a href="/terms.html" style="color:#5b6b7a;text-decoration:none">Terms</a></p>' +
    '<p class="disc">BHARAT.LOAN is an independent advisory service. We are not a government body and do not represent any ministry or agency. Scheme details are compiled from official sources and verified regularly; applicants should confirm current terms with the relevant authority. Subsidy and loan approvals are at the sole discretion of the respective government bodies and lending institutions. \u00a9 2026 BHARAT.LOAN.</p>' +
    '</div></footer>';

  var STICKYBAR =
    '<div class="stickybar">' +
    '<a class="wa-cta" href="' + WA_URL + '" target="_blank" rel="noopener">' + WA_ICON + 'WhatsApp</a>' +
    '<a class="cn-cta" href="/#engine">Free Consultation \u2192</a>' +
    '</div>';

  function mount() {
    var h = document.getElementById('site-header');
    if (h) h.outerHTML = HEADER;
    var f = document.getElementById('site-footer');
    if (f) f.outerHTML = FOOTER;
    if (!document.querySelector('.stickybar')) {
      document.body.insertAdjacentHTML('beforeend', STICKYBAR);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();

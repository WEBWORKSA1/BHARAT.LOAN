/* BHARAT.LOAN shared chrome — single source of truth for header + footer + analytics + WhatsApp + sticky mobile CTA.
   Change this file once; every page that includes it updates instantly.
   No build step, no Node. Pure browser JS. */
(function () {
  // ============================================================
  // ANALYTICS — Web, paste real IDs after creating accounts.
  // Until the IDs are real (still contain XXX), trackers stay off.
  //   GA4:     analytics.google.com → Admin → Data Streams → Web → Measurement ID
  //   Clarity: clarity.microsoft.com → New project → Project ID
  // ============================================================
  var GA4_ID     = 'G-XXXXXXXXXX';   // <-- paste GA4 Measurement ID here
  var CLARITY_ID = 'XXXXXXXXXX';     // <-- paste Microsoft Clarity Project ID here

  // ============================================================
  // CONTACT — Web, paste real WhatsApp number once you have a virtual line.
  // Format: country code + number, no spaces or symbols (e.g. '919876543210').
  // While it still contains 'X' the WA buttons stay hidden site-wide.
  // ============================================================
  var WHATSAPP_NUMBER  = '91XXXXXXXXXX';
  var WHATSAPP_MESSAGE = 'Hi BHARAT.LOAN, I want to check my scheme eligibility.';

  function loadGA4(id) {
    if (!id || id.indexOf('XXX') > -1) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
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

  // WhatsApp gating — button hidden until a real number is set.
  var hasWA = WHATSAPP_NUMBER && WHATSAPP_NUMBER.indexOf('X') === -1;
  var waUrl = hasWA ? ('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_MESSAGE)) : '/#engine';

  var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>';

  // ============================================================
  // HEADER + FOOTER
  // ============================================================
  var HEADER =
    '<div class="util"><div class="wrap"><div class="gov"><span class="dot"></span> Verified scheme reference \u00b7 BHARAT.LOAN</div><div><a href="/#engine">Check Your Eligibility \u2192</a></div></div></div>' +
    '<header><div class="wrap">' +
    '<a href="/" class="brand"><div class="crest"><span>\u092d\u093e</span></div><div class="brand-tx"><b>BHARAT.LOAN</b><small>Scheme &amp; Subsidy Advisory</small></div></a>' +
    '<nav class="main"><a href="/#schemes">Schemes</a><a href="/#states">States</a><a href="/#engine">Check Eligibility</a><a href="/acquisition.html" class="cta-partner">Partnership / Sponsorship</a><a href="/#engine" class="cta-sm">Book a Consultation</a></nav>' +
    '</div></header>';

  var FOOTER =
    '<footer><div class="wrap"><div class="fbrand"><b>BHARAT.LOAN</b></div>' +
    '<p style="margin:10px 0 18px;max-width:360px;line-height:1.6">Government scheme, subsidy and incentive advisory for Indian startups, MSMEs and industries. Advisory delivered by CONSULT.IN.</p>' +
    '<div class="fnav"><a href="/about.html">About</a><a href="/contact.html">Contact</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/#schemes">Schemes</a></div>' +
    '<p class="disc">BHARAT.LOAN is an independent advisory service. We are not a government body and do not represent any ministry or agency. Scheme details are compiled from official sources and verified regularly; applicants should confirm current terms with the relevant authority. Subsidy and loan approvals are at the sole discretion of the respective government bodies and lending institutions. \u00a9 2026 BHARAT.LOAN.</p>' +
    '</div></footer>';

  // WhatsApp FAB (desktop) — only renders if number is configured
  var WA_FAB = hasWA
    ? '<a class="wa-fab" href="' + waUrl + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' + WA_ICON + '</a>'
    : '';

  // Sticky Mobile CTA bar — always shows Free Consultation; adds WA half if number is set
  var MCTA_BAR =
    '<div class="mcta-bar">' +
      (hasWA ? '<a class="mcta-wa" href="' + waUrl + '" target="_blank" rel="noopener">' + WA_ICON + ' WhatsApp</a>' : '') +
      '<a class="mcta-book" href="/#engine">Free Consultation \u2192</a>' +
    '</div>';

  function mount() {
    var h = document.getElementById('site-header');
    if (h) h.outerHTML = HEADER;
    var f = document.getElementById('site-footer');
    if (f) f.outerHTML = FOOTER;

    // Patch any explicit .wa-link anchors site-wide once the real number is set
    if (hasWA) {
      var links = document.querySelectorAll('.wa-link');
      for (var i = 0; i < links.length; i++) links[i].href = waUrl;
    }

    // Inject WA FAB + Mobile CTA at end of body
    if (WA_FAB || MCTA_BAR) {
      var d = document.createElement('div');
      d.innerHTML = WA_FAB + MCTA_BAR;
      while (d.firstChild) document.body.appendChild(d.firstChild);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();

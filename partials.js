/* BHARAT.LOAN shared chrome — single source of truth for header + footer + analytics.
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
    '<p class="disc">BHARAT.LOAN is an independent advisory service. We are not a government body and do not represent any ministry or agency. Scheme details are compiled from official sources and verified regularly; applicants should confirm current terms with the relevant authority. Subsidy and loan approvals are at the sole discretion of the respective government bodies and lending institutions. \u00a9 2026 BHARAT.LOAN.</p>' +
    '</div></footer>';

  function mount() {
    var h = document.getElementById('site-header');
    if (h) h.outerHTML = HEADER;
    var f = document.getElementById('site-footer');
    if (f) f.outerHTML = FOOTER;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();

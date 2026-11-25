// BHARAT.LOAN — site-wide constants and shared chrome (header, footer).
// Edited here, baked into every page by scripts/build.mjs (runs daily via GitHub Actions).

export const SITE = {
  name: 'BHARAT.LOAN',
  origin: 'https://bharat.loan',
  adsenseClient: 'ca-pub-6620975821265271',
  sponsorUrl: 'https://web.works/contact',
  ownerUrl: 'https://web.works',
  tz: 'Asia/Kolkata',
  year: 2026,
};

export const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const I = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.4 8.6 8 9 4.6-.4 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
};
export const ICONS = I;

const dd = (label, href, items) =>
  `<div class="nav-dd"><a href="${href}" class="nav-dd-trigger">${label} <span class="caret">▾</span></a><div class="nav-dd-menu">` +
  items.map(([t, h, s]) => `<a href="${h}">${t}${s ? `<small>${s}</small>` : ''}</a>`).join('') + '</div></div>';

export const NAV = {
  schemes: [
    ['All schemes', '/schemes', 'Filter every central and state scheme'],
    ['Gujarat', '/states/gujarat', 'Capital, interest & SGST incentives'],
    ['Uttar Pradesh', '/states/up', 'CM-YUVA, ODOP, CMYSY, UPIEPP'],
    ['Maharashtra', '/states/maharashtra', 'CMEGP, Annasaheb Patil, IIS Policy 2025'],
    ['ODOP districts (75)', '/odop', 'UP district-by-district product loans'],
  ],
  tools: [
    ['Funding Matcher', '/get-funding', 'Find every scheme you qualify for'],
    ['EMI Calculator', '/emi-calculator', 'Monthly EMI + subsidy impact'],
    ['Subsidy Estimator', '/subsidy-estimator', 'How much govt money you qualify for'],
    ['Compare Schemes', '/compare-schemes', 'CGTMSE vs PMEGP vs Mudra and more'],
  ],
  more: [
    ['Contests & prizes', '/contests', 'Compete, win, get featured'],
    ['Careers', '/careers', 'Join the team or the talent pool'],
    ['Support us', '/support', 'Back independent scheme research'],
    ['Advertise & partner', '/advertise', 'Sponsorships, placements, leads'],
    ['Official portals', '/resources', 'Direct links to government sites'],
    ['About', '/about', ''],
    ['Contact', '/contact', ''],
  ],
};

export function header({ stamp }) {
  return `<a class="skip" href="#main">Skip to content</a>
<div class="topbar" role="note"><div class="wrap"><a href="${SITE.sponsorUrl}" target="_blank" rel="noopener" data-bl-ev="sponsor_topbar">Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership <span aria-hidden="true">→</span></a></div></div>
<div class="util"><div class="wrap"><div class="gov"><span class="dot"></span> Independent guide · Not a government website<span class="hide-sm"> · Updated daily · ${esc(stamp)}</span></div><div class="util-r"><button type="button" class="lang-btn" data-bl-lang aria-haspopup="true">${I.globe}<span>English / हिंदी</span></button><a href="/get-funding" class="util-cta">Free eligibility check →</a></div></div></div>
<header class="site-hd"><div class="wrap">
<a href="/" class="brand" aria-label="BHARAT.LOAN home"><div class="crest"><span>भा</span></div><div class="brand-tx"><b>BHARAT.LOAN</b><small>Scheme &amp; Subsidy Guide</small></div></a>
<nav class="main" aria-label="Main">${dd('Schemes', '/schemes', NAV.schemes)}${dd('Tools', '/get-funding', NAV.tools)}<a href="/updates" class="nav-live"><span class="live-dot"></span>Updates</a><a href="/guides">Guides</a><a href="/videos">Videos</a>${dd('More', '/advertise', NAV.more)}</nav>
<div class="hd-actions"><button type="button" class="icon-btn" data-bl-search aria-label="Search schemes">${I.search}</button><a href="/get-funding" class="cta-sm">Get Funding</a><button type="button" class="icon-btn menu-btn" data-bl-menu aria-label="Open menu" aria-expanded="false">${I.menu}</button></div>
</div>
<div class="mnav" id="mnav" hidden><div class="wrap">
<div class="mnav-grp"><b>Schemes</b>${NAV.schemes.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}</div>
<div class="mnav-grp"><b>Tools</b>${NAV.tools.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}</div>
<div class="mnav-grp"><b>Read &amp; watch</b><a href="/updates">Daily updates</a><a href="/guides">Guides</a><a href="/videos">Videos</a><a href="/resources">Official portals</a></div>
<div class="mnav-grp"><b>Community</b>${NAV.more.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}</div>
</div></div>
</header>`;
}

export function footer({ stamp, year }) {
  const col = (t, links) => `<div class="fcol"><b>${t}</b>${links.map(([a, h]) => `<a href="${h}">${a}</a>`).join('')}</div>`;
  return `<section class="nl-band" aria-label="Newsletter"><div class="wrap nl-in"><div><h3>Get new schemes &amp; deadlines first</h3><p>One short email when something changes — new schemes, revised limits, application windows. No spam.</p></div>
<form class="nl-form" data-bl-form="newsletter" data-subject="Newsletter signup" novalidate><input class="field" type="email" name="email" placeholder="Your email" required autocomplete="email" aria-label="Email"><select class="field" name="state" aria-label="Your state"><option value="">Your state</option><option>Uttar Pradesh</option><option>Gujarat</option><option>Maharashtra</option><option>Other state</option></select><input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><label class="consent"><input type="checkbox" name="consent" value="yes" required> I agree to receive emails and accept the <a href="/privacy">Privacy Policy</a>.</label><button type="submit" class="btn btn-primary">Subscribe</button><div class="form-msg" role="status" aria-live="polite"></div></form></div></section>
<footer class="site-ft"><div class="wrap">
<div class="ft-grid">
<div class="fcol fbrand"><b class="fb-name">BHARAT.LOAN</b><p>An independent, continuously updated guide to Indian government business schemes, subsidies and incentives — with advisory support for founders and MSMEs.</p><div class="fraud">${I.shield}<span><strong>Fraud alert:</strong> government schemes are free to apply. Never pay anyone who “guarantees” a loan or subsidy approval. Apply only on official portals — see our <a href="/resources">official links</a>.</span></div></div>
${col('Schemes', [['All schemes', '/schemes'], ['Gujarat', '/states/gujarat'], ['Uttar Pradesh', '/states/up'], ['Maharashtra', '/states/maharashtra'], ['ODOP districts', '/odop'], ['Official portals', '/resources']])}
${col('Tools &amp; content', [['Funding Matcher', '/get-funding'], ['EMI Calculator', '/emi-calculator'], ['Subsidy Estimator', '/subsidy-estimator'], ['Compare Schemes', '/compare-schemes'], ['Daily updates', '/updates'], ['Guides', '/guides'], ['Videos', '/videos'], ['Search', '/search']])}
${col('Company', [['About', '/about'], ['Contact', '/contact'], ['Careers', '/careers'], ['Contests', '/contests'], ['Support us', '/support'], ['Advertise &amp; partner', '/advertise'], ['Editorial policy', '/editorial-policy']])}
${col('Legal', [['Privacy policy', '/privacy'], ['Terms of service', '/terms'], ['Disclaimer', '/disclaimer'], ['Cookie policy', '/cookie-policy'], ['Copyright &amp; trademarks', '/copyright'], ['Sitemap', '/sitemap.xml'], ['RSS feed', '/feed.xml']])}
</div>
<p class="disc"><strong>Disclaimer:</strong> BHARAT.LOAN is an independent information and advisory publisher. It is <strong>not a government website</strong>, not affiliated with any ministry, department or agency, and <strong>not a bank, NBFC or lender</strong> — we do not lend money or decide approvals. Scheme names, logos and marks belong to their respective government bodies and are used for identification only. Details are compiled from official public sources and may change; always confirm current terms on the official portal before you act. News headlines link to their original publishers. <a href="/disclaimer">Full disclaimer</a>.</p>
<p class="copy">© ${year} BHARAT.LOAN. All rights reserved. BHARAT.LOAN™, the BHARAT.LOAN wordmark and the भा crest are trademarks of <a href="${SITE.ownerUrl}" target="_blank" rel="noopener">Webworks</a>. Original text, data compilations, tools and design are protected by copyright; reproduction without written permission is prohibited. See <a href="/copyright">Copyright &amp; trademarks</a>. · Data refreshed ${esc(stamp)}</p>
</div></footer>`;
}

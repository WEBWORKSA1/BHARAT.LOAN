#!/usr/bin/env node
// BHARAT.LOAN build — zero dependencies, Node 18+.
// Runs in GitHub Actions after scripts/refresh.mjs (twice daily) and can be run locally: `node scripts/build.mjs`.
// It (1) normalises every page's <head> for AdSense/SEO, (2) bakes the shared header/footer,
// (3) fills dynamic blocks (<!--bl:NAME--> ... <!--/bl:NAME-->) from /data/*.json,
// (4) writes sitemap.xml, feed.xml, robots.txt, ads.txt, data/search-index.json, assets/chrome.json,
// (5) enforces guardrails (no exposed email, single AdSense ID, top bar on every page) — exits 1 on failure.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { SITE, esc, header, footer } from './site.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rd = (p, d = null) => { try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch { return d; } };
const rj = (p, d) => { try { const v = JSON.parse(rd(p)); return v == null ? d : v; } catch { return d; } };
const wr = (p, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), s); };

// ---------- time (IST) ----------
const now = new Date();
const istParts = new Intl.DateTimeFormat('en-GB', { timeZone: SITE.tz, year: 'numeric', month: 'short', day: '2-digit' }).formatToParts(now);
const part = (t) => istParts.find((x) => x.type === t).value;
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: SITE.tz }).format(now); // YYYY-MM-DD
const STAMP = `${part('day')} ${part('month')} ${part('year')}`;
const fmtDate = (iso) => { try { return new Intl.DateTimeFormat('en-GB', { timeZone: SITE.tz, day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso)); } catch { return ''; } };
const dayNum = Math.floor(Date.parse(TODAY + 'T00:00:00Z') / 86400000);

// ---------- data ----------
const REG = rj('data/schemes.json', { schemes: [], states: [] });
const SCHEMES = REG.schemes;
const byId = Object.fromEntries(SCHEMES.map((s) => [s.id, s]));
const UPD = rj('data/updates.json', { items: [] });
const VID = rj('data/videos.json', { items: [], topics: [] });
const CONTESTS = rj('data/contests.json', { contests: [] });
const CAREERS = rj('data/careers.json', { roles: [] });
const ODOP = rj('data/odop-districts.json', { districts: [] }).districts || [];
const LASTMOD = rj('data/lastmod.json', {});
const OLD_PUB = /ca-pub-(?!6620975821265271)\d{16}/g;
const EMAIL_RE = /webworksa1\s*(@|\[at\]|&#64;|%40)\s*gmail/i;

// ---------- helpers ----------
function walk(dir, out = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) { if (['.git', 'node_modules', 'scripts', '.github'].includes(e.name)) continue; walk(rel, out); }
    else out.push(rel.replace(/^\.\//, ''));
  }
  return out;
}
// GitHub Pages: /about -> about.html, /schemes/ -> schemes/index.html (directories always end with "/")
const urlOf = (f) => { let u = '/' + f.replace(/\.html$/, ''); if (u.endsWith('/index')) u = u.slice(0, -5); return u || '/'; };
function block(html, name, content) {
  const re = new RegExp(`<!--bl:${name}(\\s[^>]*)?-->[\\s\\S]*?<!--/bl:${name}-->`, 'g');
  if (!re.test(html)) return html;
  return html.replace(re, (m, attrs = '') => `<!--bl:${name}${attrs || ''}-->${typeof content === 'function' ? content(attrs) : content}<!--/bl:${name}-->`);
}
const attr = (attrs, k) => ((attrs || '').match(new RegExp(`${k}="([^"]*)"`)) || [])[1];
const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '#');

// ---------- daily picks ----------
const featured = SCHEMES.filter((s) => s.tier === 'S' || s.tier === 'A');
const SOTD = featured.length ? featured[dayNum % featured.length] : null;
const items = (UPD.items || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const tip = (rj('data/tips.json', { tips: [] }).tips || []);
const TIP = tip.length ? tip[dayNum % tip.length] : null;

function newsList(list, opts = {}) {
  if (!list.length) return opts.empty || '';
  return `<ul class="news-list">${list.map((n) => `<li data-tags="${esc((n.tags || []).join(' '))}"><a href="${esc(safeUrl(n.url))}" target="_blank" rel="noopener nofollow">${esc(n.title)}</a><span class="nl-meta">${esc(n.source || '')}${n.date ? ' · ' + esc(fmtDate(n.date)) : ''}</span></li>`).join('')}</ul>`;
}
const words = (t) => new Set(String(t).toLowerCase().replace(/[^a-z0-9\u0900-\u097f ]+/g, ' ').split(/\s+/).filter((w) => w.length > 3));
function diverse(list, n) {
  const out = [];
  for (const it of list) {
    const w = words(it.title);
    if (out.some((o) => { const ow = o._w; let inter = 0; w.forEach((x) => { if (ow.has(x)) inter++; }); return inter / Math.max(1, Math.min(w.size, ow.size)) > 0.5; })) continue;
    out.push(Object.assign({}, it, { _w: w })); if (out.length >= n) break;
  }
  return out;
}
const newsFor = (id, n = 5) => diverse(items.filter((x) => (x.tags || []).includes(id)), n);

function schemeCard(s) {
  const st = { central: 'Central', gujarat: 'Gujarat', up: 'Uttar Pradesh', maharashtra: 'Maharashtra' }[s.scope] || '';
  return `<a class="card" href="${s.url}" data-cat="${esc(s.cat)}" data-scope="${esc(s.scope)}" data-tier="${esc(s.tier)}"><div class="tierflag">TIER ${esc(s.tier)}</div><div class="type">${esc(s.cat)} · ${esc(st)}</div><h4>${esc(s.name)}</h4><div class="full">${esc(s.full)}</div><div class="quantum">${esc(s.quantum)}</div><div class="body-tag">${esc(s.body)}</div><div class="card-link">View scheme →</div></a>`;
}

function videoCard(v) {
  return `<article class="vcard"><div class="yt" data-yt="${esc(v.id)}"><img src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" alt="${esc(v.title)}" loading="lazy" width="480" height="360"><button type="button" class="yt-play" aria-label="Play video: ${esc(v.title)}"></button></div><h3>${esc(v.title)}</h3><p class="v-meta">${esc(v.channel || '')}${v.date ? ' · ' + esc(fmtDate(v.date)) : ''}</p></article>`;
}

const TOPICS = VID.topics && VID.topics.length ? VID.topics : [
  ['PMEGP loan — how to apply', 'PMEGP loan apply online'], ['Mudra loan explained', 'Mudra loan kaise le'],
  ['CGTMSE collateral-free loan', 'CGTMSE loan without collateral'], ['Udyam registration step by step', 'Udyam registration online'],
  ['Stand-Up India loan', 'Stand Up India loan apply'], ['PMFME food processing subsidy', 'PMFME scheme apply online'],
  ['CM-YUVA UP interest-free loan', 'CM Yuva Udyami yojana apply'], ['CMEGP Maharashtra', 'CMEGP Maharashtra apply online'],
];
const topicLinks = () => `<div class="topic-grid">${TOPICS.map(([t, q]) => `<a class="topic" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q)}" target="_blank" rel="noopener">▶ ${esc(t)}</a>`).join('')}</div>`;

// ---------- dynamic blocks ----------
const BLOCKS = {
  stamp: STAMP,
  'today': () => {
    const s = SOTD;
    const sCard = s ? `<a class="sotd" href="${s.url}"><span class="k">Scheme of the day</span><b>${esc(s.name)}</b><span>${esc(s.quantum)}</span><span class="go">Read the guide →</span></a>` : '';
    const tCard = TIP ? `<div class="tipcard"><span class="k">Founder tip · ${esc(STAMP)}</span><p>${esc(TIP)}</p></div>` : '';
    return `<div class="today-grid">${sCard}<div class="today-news"><div class="tn-h"><span class="live-dot"></span> Latest scheme news <a href="/updates">All updates →</a></div>${newsList(diverse(items, 6), { empty: '<p class="muted">Today’s headlines are being refreshed. <a href="/updates">Open the updates page →</a></p>' })}</div>${tCard}</div>`;
  },
  'home-schemes': () => SCHEMES.filter((s) => s.scope === 'central').map(schemeCard).join(''),
  'home-states': () => (REG.states || []).map((st) => {
    const n = SCHEMES.filter((s) => s.scope === st.id).length;
    return `<a class="card" href="${st.url}"><div class="tierflag live">LIVE</div><div class="type">${n} state schemes${st.id === 'up' ? ' + 75 ODOP districts' : ''}</div><h4>${esc(st.name)}</h4><div class="full">${esc(st.tag)}</div><div class="card-link">Explore ${esc(st.name)} →</div></a>`;
  }).join(''),
  'home-videos': () => (VID.items || []).length ? `<div class="vgrid">${VID.items.slice(0, 3).map(videoCard).join('')}</div>` : topicLinks(),
  'counts': () => `<div><b>${SCHEMES.length}</b><small>Schemes mapped &amp; reviewed</small></div><div><b>${(REG.states || []).length} + 75</b><small>States live + UP ODOP districts</small></div><div><b>Daily</b><small>News &amp; updates refresh</small></div>`,
  'updates': () => {
    const recent = items.slice(0, 160);
    if (!recent.length) return '<p class="muted">The first automated refresh is running — headlines appear here within minutes of each refresh cycle.</p>';
    const groups = {};
    for (const n of recent) { const d = (n.date || '').slice(0, 10) || 'Recent'; (groups[d] = groups[d] || []).push(n); }
    return Object.entries(groups).map(([d, list]) => `<section class="ud-day"><h2>${d === 'Recent' ? 'Recent' : esc(fmtDate(d + 'T12:00:00Z'))}</h2>${newsList(list)}</section>`).join('');
  },
  'updates-count': () => String(items.length),
  'videos': () => (VID.items || []).length ? `<div class="vgrid">${VID.items.slice(0, 24).map(videoCard).join('')}</div>` : '<p class="muted">New explainer videos are pulled in automatically on each refresh. Meanwhile, start with the topics below.</p>',
  'video-topics': topicLinks,
  'schemes-grid': () => SCHEMES.map(schemeCard).join(''),
  'schemes-json': () => JSON.stringify({ schemes: SCHEMES.map(({ id, name, scope, cat, tier, quantum, need, stage, sector, who, maxLakh, url }) => ({ id, name, scope, cat, tier, quantum, need, stage, sector, who, maxLakh, url })) }).replace(/</g, '\\u003c'),
  'state-schemes': (attrs) => { const g = attr(attrs, 'group'); return SCHEMES.filter((s) => s.scope === attr(attrs, 'state') && (!g || s.group === g)).map(schemeCard).join(''); },
  'state-count': (attrs) => String(SCHEMES.filter((s) => s.scope === attr(attrs, 'state')).length),
  'state-news': (attrs) => {
    const st = attr(attrs, 'state'); const name = ((REG.states || []).find((x) => x.id === st) || {}).name || st;
    const l = diverse(items.filter((x) => (x.tags || []).includes(st)), 6);
    return l.length ? `<div class="block news-block" id="news"><h2>Latest ${esc(name)} funding news</h2>${newsList(l)}<p class="nb-note">Auto-refreshed ${esc(STAMP)} · headlines link to the original publishers.</p></div>` : '';
  },
  'schemes-count': () => String(SCHEMES.length),
  'contests': () => (CONTESTS.contests || []).map((c) => `<article class="ccard" id="${esc(c.id)}"><div class="cc-st ${esc(c.status)}">${esc(c.statusLabel || c.status)}</div><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p><ul class="cc-facts"><li><b>Prize</b>${esc(c.prize)}</li><li><b>Who</b>${esc(c.who)}</li><li><b>Timeline</b>${esc(c.timeline)}</li></ul><a class="btn btn-primary" href="#enter" data-contest="${esc(c.title)}">Enter / register interest</a></article>`).join(''),
  'contest-options': () => (CONTESTS.contests || []).map((c) => `<option>${esc(c.title)}</option>`).join(''),
  'careers': () => (CAREERS.roles || []).map((r) => `<article class="jcard"><div class="j-top"><h3>${esc(r.title)}</h3><span class="j-type">${esc(r.type)}</span></div><p>${esc(r.summary)}</p><ul class="checks-sm">${(r.points || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ul><p class="j-meta">${esc(r.location)} · ${esc(r.pay)}</p><a class="btn btn-ghost" href="#apply" data-role="${esc(r.title)}">Apply for this role</a></article>`).join(''),
  'career-options': () => (CAREERS.roles || []).map((r) => `<option>${esc(r.title)}</option>`).join(''),
  'odop-news': () => { const l = diverse(items.filter((x) => (x.tags || []).includes('odop-up')), 4); return l.length ? `<div class="block news-block"><h2>Latest ODOP news</h2>${newsList(l)}<p class="nb-note">Auto-refreshed ${esc(STAMP)} · headlines link to the original publishers.</p></div>` : ''; },
};

// ---------- head normalisation ----------
function normalizeHead(html, file) {
  const isNoindex = /<meta name="robots" content="noindex/i.test(html);
  const noAds = isNoindex || /data-noads/.test(html) || file === '404.html';
  // remove every existing AdSense loader + verification meta, re-add a single canonical one
  html = html.replace(/<script[^>]*pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^>]*><\/script>\s*/g, '');
  html = html.replace(/<meta name="google-adsense-account"[^>]*>\s*/g, '');
  const add = [];
  if (!/classList\.add\('js'\)/.test(html)) add.push("<script>document.documentElement.classList.add('js')</script>");
  add.push(`<meta name="google-adsense-account" content="${SITE.adsenseClient}">`);
  if (!noAds) add.push(`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}" crossorigin="anonymous"></script>`);
  if (!/property="og:image"/.test(html) && !isNoindex) add.push(`<meta property="og:image" content="${SITE.origin}/og-image.svg">`);
  if (!/name="twitter:image"/.test(html) && !isNoindex) add.push(`<meta name="twitter:image" content="${SITE.origin}/og-image.svg">`);
  if (!/rel="icon"/.test(html)) add.push('<link rel="icon" type="image/svg+xml" href="/favicon.svg">');
  if (!/rel="apple-touch-icon"/.test(html)) add.push('<link rel="apple-touch-icon" href="/favicon.svg">');
  if (!/name="theme-color"/.test(html)) add.push('<meta name="theme-color" content="#1456e6">');
  if (!/rel="manifest"/.test(html)) add.push('<link rel="manifest" href="/site.webmanifest">');
  if (!/application\/rss\+xml/.test(html)) add.push(`<link rel="alternate" type="application/rss+xml" title="BHARAT.LOAN updates" href="${SITE.origin}/feed.xml">`);
  if (!/href="\/styles\.css"/.test(html)) add.push('<link rel="stylesheet" href="/styles.css">');
  html = html.replace(/<\/head>/, add.join('\n') + '\n</head>');
  // canonical + og:url: directory indexes carry a trailing slash (GitHub Pages redirects /dir -> /dir/)
  if (/(^|\/)index\.html$/.test(file) && file !== 'index.html') {
    const u = SITE.origin + urlOf(file);
    html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${u}$2`).replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${u}$2`);
  }
  return html;
}

// ---------- body transforms ----------
function transformBody(html, file) {
  // old publisher IDs anywhere -> current
  html = html.replace(OLD_PUB, SITE.adsenseClient);
  // manual <ins> ad units without slot IDs -> lightweight placeholders handled by partials.js
  html = html.replace(/<div class="ad-slot"([^>]*)>\s*<ins class="adsbygoogle"[\s\S]*?<\/ins>\s*(<script>[^<]*<\/script>)?\s*<\/div>/g, (m, a) => `<div class="ad-slot" data-ad="in-article"${/style="/.test(a) ? '' : ''}></div>`);
  // inline lead scripts that exposed the inbox -> data attributes consumed by partials.js
  html = html.replace(/<script>\s*document\.getElementById\('leadBtn'\)[\s\S]*?<\/script>\s*/g, (m) => {
    const scheme = (m.match(/scheme:'([^']*)'/) || [])[1];
    if (scheme) html = html; // captured below
    transformBody._scheme = scheme;
    return '';
  });
  if (transformBody._scheme) {
    const sc = transformBody._scheme.replace(/"/g, '&quot;');
    html = html.replace(/<div class="cta-card"(?![^>]*data-scheme)/, `<div class="cta-card" data-scheme="${sc}"`);
    transformBody._scheme = null;
  }
  // header/footer placeholders -> baked markers
  html = html.replace(/<div id="site-header"><\/div>/, '<!--bl:header--><!--/bl:header-->');
  html = html.replace(/<div id="site-footer"><\/div>/, '<!--bl:footer--><!--/bl:footer-->');
  // main landmark for skip-link
  if (!/id="main"/.test(html)) html = html.replace(/(<!--\/bl:header-->)/, '$1\n<main id="main">').replace(/(<!--bl:footer-->)/, '</main>\n$1');
  // per-scheme news block
  const m = file.match(/^schemes\/([a-z0-9-]+)\.html$/);
  if (m && m[1] !== 'index' && byId[m[1]] && !/<!--bl:news/.test(html)) {
    html = html.replace(/(<div class="advisor-block")/, `<!--bl:news id="${m[1]}"--><!--/bl:news-->\n$1`);
  }
  if (m && byId[m[1]] && !/class="reviewed"/.test(html)) {
    const s = byId[m[1]];
    const line = `<p class="reviewed">Last reviewed ${esc(fmtDate(s.reviewed + 'T12:00:00Z'))} · Reviewed by the BHARAT.LOAN advisory desk${s.official ? ` · <a href="${esc(s.official)}" target="_blank" rel="noopener">Official portal ↗</a>` : ''}</p>`;
    html = html.replace(/(\s*<div class="layout">)/, `\n${line}$1`);
  }
  if (/^odop\/(?!index)[a-z-]+\.html$/.test(file) && !/<!--bl:odop-news/.test(html)) {
    html = html.replace(/(<div class="advisor-block")/, '<!--bl:odop-news--><!--/bl:odop-news-->\n$1');
  }
  // shorter titles for ODOP district pages
  html = html.replace(/(<title>ODOP [^<|]+?) \| Margin-Money Loan, Eligibility &amp; How to Apply \| BHARAT\.LOAN<\/title>/, '$1 | ODOP Loan | BHARAT.LOAN</title>');
  html = html.replace(/(<title>ODOP [^<|]+?) \| Margin-Money Loan, Eligibility & How to Apply \| BHARAT\.LOAN<\/title>/, '$1 | ODOP Loan | BHARAT.LOAN</title>');
  // structured-data URLs for directory indexes
  html = html.replace(/"https:\/\/bharat\.loan\/(schemes|odop|guides)"/g, '"https://bharat.loan/$1/"');
  // internal .html links -> clean absolute URLs (avoids 308 hops under cleanUrls)
  html = html.replace(/href="((?!https?:|\/\/|mailto:|tel:|#|javascript:)[^"]+?)\.html(#[^"]*)?"/g, (mm, h, hash = '') => {
    const abs = h.startsWith('/') ? h : path.posix.normalize(path.posix.join('/' + path.posix.dirname(file), h));
    let u = abs.replace(/\/index$/, '/') || '/';
    return `href="${u}${hash}"`;
  });
  // internal links that 308-redirect under cleanUrls/trailingSlash:false
  html = html.replace(/href="\/(schemes|odop|guides)"/g, 'href="/$1/"').replace(/href="\/(schemes|odop|guides)([?#][^"]*)"/g, 'href="/$1/$2"').replace(/href="\/acquisition(\.html)?"/g, 'href="/advertise"');
  return html;
}

function fillBlocks(html) {
  html = block(html, 'header', '\n' + header({ stamp: STAMP }) + '\n');
  html = block(html, 'footer', '\n' + footer({ stamp: STAMP, year: SITE.year }) + '\n');
  html = block(html, 'news', (attrs) => {
    const id = attr(attrs, 'id'); const s = byId[id]; const l = newsFor(id, 5);
    if (!s || !l.length) return '';
    return `<div class="block news-block" id="news"><h2>Latest news on ${esc(s.name)}</h2>${newsList(l)}<p class="nb-note">Auto-refreshed ${esc(STAMP)} · headlines link to the original publishers.${s.official ? ` Official portal: <a href="${esc(s.official)}" target="_blank" rel="noopener">${esc(s.official.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>` : ''}</p></div>`;
  });
  for (const [name, fn] of Object.entries(BLOCKS)) html = block(html, name, typeof fn === 'function' ? fn : () => fn);
  return html;
}

// ---------- run ----------
const files = walk('.');
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const pages = [];
for (const f of htmlFiles) {
  let html = rd(f);
  const before = html;
  html = normalizeHead(html, f);
  html = transformBody(html, f);
  html = fillBlocks(html);
  if (html !== before) wr(f, html);
  pages.push({ f, html });
}

// ---------- lastmod (content hash excluding chrome/stamps) ----------
const strip = (h) => h.replace(/<!--bl:(header|footer|stamp|today|counts)[\s\S]*?<!--\/bl:\1-->/g, '').replace(/Auto-refreshed [^<·]+/g, '');
const lm = {};
for (const p of pages) {
  const h = crypto.createHash('sha1').update(strip(p.html)).digest('hex').slice(0, 12);
  const prev = LASTMOD[p.f];
  lm[p.f] = prev && prev.h === h ? prev : { h, d: TODAY };
}
wr('data/lastmod.json', JSON.stringify(lm, null, 0));

// ---------- sitemap / search index / feed ----------
const meta = (h, re) => ((h.match(re) || [])[1] || '').replace(/\s+/g, ' ').trim();
const indexable = pages.filter((p) => !/<meta name="robots" content="noindex/i.test(p.html) && p.f !== '404.html');
const prio = (u) => (u === '/' ? '1.0' : /^\/(get-funding|schemes\/$|states\/|updates)/.test(u) ? '0.9' : /^\/schemes\//.test(u) ? '0.85' : /^\/odop\//.test(u) ? '0.7' : '0.6');
const sm = indexable.map((p) => { const u = urlOf(p.f); return `  <url><loc>${SITE.origin}${u === '/' ? '/' : u}</loc><lastmod>${lm[p.f].d}</lastmod><changefreq>${/^\/(updates|videos)?$/.test(u) || /^\/(schemes|odop)\/./.test(u) ? 'daily' : 'weekly'}</changefreq><priority>${prio(u)}</priority></url>`; }).sort();
wr('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sm.join('\n')}\n</urlset>\n`);

const kind = (u) => (u.startsWith('/schemes/') ? 'Scheme' : u.startsWith('/odop/') ? 'ODOP district' : u.startsWith('/states/') ? 'State' : u.startsWith('/guides/') ? 'Guide' : 'Page');
const idx = indexable.map((p) => {
  const u = urlOf(p.f);
  const t = meta(p.html, /<h1[^>]*>([\s\S]*?)<\/h1>/).replace(/<[^>]+>/g, '') || meta(p.html, /<title>([^<]*)/).replace(/\s*\|\s*BHARAT\.LOAN.*$/, '');
  return { t: t.replace(/&amp;/g, '&'), u, d: meta(p.html, /<meta name="description" content="([^"]*)"/).replace(/&amp;/g, '&').slice(0, 160), k: kind(u) };
});
wr('data/search-index.json', JSON.stringify(idx));

const rfc822 = (d) => new Date(d || now).toUTCString();
const feedItems = items.slice(0, 50).map((n) => `<item><title>${esc(n.title)}</title><link>${esc(safeUrl(n.url))}</link><guid isPermaLink="false">${esc(n.id || n.url)}</guid><pubDate>${rfc822(n.date)}</pubDate><source url="${SITE.origin}/updates">${esc(n.source || 'BHARAT.LOAN')}</source></item>`).join('\n');
const sotdItem = SOTD ? `<item><title>Scheme of the day: ${esc(SOTD.name)} — ${esc(SOTD.quantum)}</title><link>${SITE.origin}${SOTD.url}</link><guid isPermaLink="false">sotd-${TODAY}</guid><pubDate>${rfc822(TODAY + 'T00:30:00Z')}</pubDate></item>` : '';
wr('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>BHARAT.LOAN — Government scheme updates</title><link>${SITE.origin}/updates</link><description>Daily updates on Indian government business schemes, subsidies and MSME credit.</description><language>en-in</language><lastBuildDate>${now.toUTCString()}</lastBuildDate>\n${sotdItem}\n${feedItems}\n</channel></rss>\n`);

wr('robots.txt', `User-agent: *\nAllow: /\nDisallow: /data/lastmod.json\n\nSitemap: ${SITE.origin}/sitemap.xml\n`);
wr('ads.txt', `google.com, ${SITE.adsenseClient.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`);
wr('assets/chrome.json', JSON.stringify({ header: header({ stamp: STAMP }), footer: footer({ stamp: STAMP, year: SITE.year }) }));
wr('data/build.json', JSON.stringify({ built: now.toISOString(), date: TODAY, stamp: STAMP, pages: pages.length, indexable: indexable.length, updates: items.length, videos: (VID.items || []).length, sotd: SOTD && SOTD.id }, null, 1));

// ---------- guardrails ----------
const problems = [];
const deployable = walk('.').filter((f) => !/^(README\.md|\.gitignore|data\/pages-status\.json)$/.test(f));
for (const f of deployable) {
  if (!/\.(html|js|json|xml|txt|css|svg|webmanifest|md)$/.test(f)) continue;
  const s = rd(f, '');
  if (EMAIL_RE.test(s)) problems.push(`email exposed in ${f}`);
  if (OLD_PUB.test(s)) problems.push(`old AdSense ID in ${f}`);
  OLD_PUB.lastIndex = 0;
}
for (const p of pages) {
  const h = rd(p.f);
  if (p.f !== '404.html' && !/data-redirect/.test(h) && !/class="topbar"/.test(h)) problems.push(`no sponsorship top bar: ${p.f}`);
  if (/document\.getElementById\('leadBtn'\)/.test(h)) problems.push(`inline lead script left in ${p.f}`);
  if (/formsubmit\.co/.test(h)) problems.push(`direct form endpoint in ${p.f}`);
}
if (problems.length) { console.error('GUARDRAIL FAILURES:\n' + problems.join('\n')); process.exit(1); }
console.log(`build ok · ${pages.length} pages (${indexable.length} indexable) · ${items.length} updates · ${(VID.items || []).length} videos · ${STAMP}`);

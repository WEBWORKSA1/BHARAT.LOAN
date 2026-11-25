#!/usr/bin/env node
// BHARAT.LOAN daily refresh — pulls fresh scheme news + explainer videos into /data.
// Runs in GitHub Actions twice a day (see .github/workflows/daily-refresh.yml). Zero dependencies, Node 18+.
// Sources: Google News RSS (per-scheme queries), PIB press releases RSS, YouTube channel RSS
// (and the YouTube Data API when a YOUTUBE_API_KEY secret is set). Every source is optional —
// a failing feed is logged and skipped, never fatal.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rj = (p, d) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8')); } catch { return d; } };
const wj = (p, o) => fs.writeFileSync(path.join(ROOT, p), JSON.stringify(o, null, 1));
const UA = 'Mozilla/5.0 (compatible; BharatLoanBot/2.0; +https://bharat.loan/editorial-policy)';
const REG = rj('data/schemes.json', { schemes: [] });
const SRC = rj('scripts/sources.json', {});
const log = { started: new Date().toISOString(), feeds: [], errors: [] };
const MAX_AGE_DAYS = 45;

async function get(url, ms = 15000) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-IN,en;q=0.8' }, signal: ctl.signal, redirect: 'follow' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.text();
  } finally { clearTimeout(t); }
}
const decode = (s) => String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const tag = (x, t) => { const m = x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, 'i')); return m ? decode(m[1]) : ''; };
function parseRss(xml) {
  return (xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || []).map((it) => ({
    title: tag(it, 'title'), url: tag(it, 'link'), date: tag(it, 'pubDate') || tag(it, 'dc:date'), source: tag(it, 'source'),
  })).filter((x) => x.title && /^https?:\/\//.test(x.url));
}
const norm = (t) => t.toLowerCase().replace(/[^a-z0-9ऀ-ॿ ]+/g, ' ').replace(/\s+/g, ' ').trim();
const iso = (d) => { const t = Date.parse(d); return Number.isFinite(t) ? new Date(t).toISOString() : new Date().toISOString(); };

// keyword map used to tag every headline with scheme ids + topics (drives per-page news blocks and filters)
const KW = {
  cgtmse: [/cgtmse/i, /credit guarantee fund trust/i], pmegp: [/pmegp/i, /employment generation programme/i], 'mudra-yojana': [/mudra/i],
  'stand-up-india': [/stand[- ]?up india/i], 'startup-india-seed-fund': [/seed fund/i, /sisfs/i], 'dpiit-startup-india': [/dpiit/i, /startup india/i, /80[- ]?iac/i],
  pli: [/\bpli\b/i, /production[- ]linked incentive/i], pmfme: [/pmfme/i, /micro food processing/i], atufs: [/tufs/i, /technology upgradation fund/i],
  clcss: [/clcss/i, /credit linked capital subsidy/i], 'msme-loan-59-minutes': [/59 minutes/i], 'sidbi-direct': [/sidbi/i], 'nsic-schemes': [/\bnsic\b/i],
  'aatmanirbhar-gujarat-msme': [/aatmanirbhar gujarat/i], 'gujarat-textile-policy': [/gujarat.{0,30}textile/i], 'gujarat-large-industry-incentive': [/gujarat.{0,40}(industrial policy|incentive)/i], 'gujarat-startup-scheme': [/gujarat.{0,30}start ?up/i],
  'cm-yuva-up': [/cm[- ]?yuva/i, /yuva udyami/i], 'odop-up': [/\bodop\b/i, /one district one product/i], 'cm-yuva-swarozgar-up': [/yuva swarozgar/i],
  'upiepp-up': [/invest up/i, /up.{0,20}industrial (investment|policy)/i], 'up-msme-policy': [/(uttar pradesh|\bup\b).{0,25}msme/i], 'up-textile-policy': [/(uttar pradesh|\bup\b).{0,25}textile/i],
  'cmegp-maharashtra': [/cmegp/i, /chief minister.{0,10}employment generation/i], 'annasaheb-patil-maharashtra': [/annasaheb patil/i], 'maharashtra-iis-policy': [/maharashtra.{0,40}(industr|investment).{0,20}polic/i],
  msme: [/\bmsme/i, /small business/i, /udyam/i], startup: [/start ?up/i], gujarat: [/gujarat/i], up: [/uttar pradesh|\bu\.?p\.? govt|lucknow|yogi/i], maharashtra: [/maharashtra|mumbai|pune/i], credit: [/loan|credit|lending|bank/i], subsidy: [/subsid|incentive|grant/i],
};
const RELEVANT = /msme|scheme|yojana|subsid|loan|credit|startup|start-up|incentive|udyam|entrepreneur|mudra|pmegp|cgtmse|sidbi|odop|textile|policy|industr|export|manufactur|food processing|women|self-employment|guarantee/i;
function tagsFor(title, seed) {
  const t = new Set(seed || []);
  for (const [k, res] of Object.entries(KW)) if (res.some((r) => r.test(title))) t.add(k);
  const s = REG.schemes.find((x) => t.has(x.id)); if (s && s.scope !== 'central') t.add(s.scope);
  return [...t];
}
const gnews = (q) => `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:30d')}&hl=en-IN&gl=IN&ceid=IN:en`;

async function news() {
  const prev = rj('data/updates.json', { items: [] }).items || [];
  const queries = [
    ...REG.schemes.map((s) => ({ q: s.q || s.name, seed: [s.id] })),
    ...(SRC.newsQueries || ['MSME scheme India', 'government loan scheme small business India', 'MSME subsidy India', 'startup scheme India government', 'women entrepreneur loan scheme India']).map((q) => ({ q, seed: [] })),
  ];
  const fresh = [];
  for (const { q, seed } of queries) {
    try {
      const xml = await get(gnews(q));
      const list = parseRss(xml).slice(0, 12).map((x) => {
        // Google News appends " - Publisher" to titles
        let title = x.title, source = x.source;
        const m = title.match(/^(.*)\s+-\s+([^-]{2,60})$/); if (m) { title = m[1]; source = source || m[2]; }
        return { title, url: x.url, date: iso(x.date), source, tags: tagsFor(title, seed), via: 'gnews' };
      });
      fresh.push(...list); log.feeds.push({ q, n: list.length });
    } catch (e) { log.errors.push(`news "${q}": ${e.message}`); }
    await new Promise((r) => setTimeout(r, 700));
  }
  for (const f of SRC.rss || []) {
    try {
      const list = parseRss(await get(f.url)).filter((x) => RELEVANT.test(x.title)).slice(0, 25)
        .map((x) => ({ title: x.title, url: x.url, date: iso(x.date), source: f.name, tags: tagsFor(x.title, f.tags || []), via: 'rss' }));
      fresh.push(...list); log.feeds.push({ rss: f.name, n: list.length });
    } catch (e) { log.errors.push(`rss ${f.name}: ${e.message}`); }
  }
  const cutoff = Date.now() - MAX_AGE_DAYS * 864e5;
  const seen = new Map();
  for (const it of [...fresh, ...prev]) {
    if (!it.title || Date.parse(it.date) < cutoff) continue;
    if (!RELEVANT.test(it.title) && !(it.tags || []).some((t) => REG.schemes.some((s) => s.id === t))) continue;
    const k = norm(it.title).slice(0, 90);
    if (seen.has(k)) { const ex = seen.get(k); ex.tags = [...new Set([...(ex.tags || []), ...(it.tags || [])])]; continue; }
    seen.set(k, { ...it, id: Buffer.from(k).toString('base64').slice(0, 24) });
  }
  const items = [...seen.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 400);
  if (items.length || !prev.length) wj('data/updates.json', { updated: new Date().toISOString(), count: items.length, items });
  log.news = items.length;
}

async function channelId(handle) {
  const html = await get(`https://www.youtube.com/${handle.startsWith('@') ? handle : '@' + handle}`);
  const m = html.match(/"(?:externalId|channelId)":"(UC[\w-]{22})"/) || html.match(/channel\/(UC[\w-]{22})/);
  if (!m) throw new Error('no channel id'); return m[1];
}
async function videos() {
  const prev = rj('data/videos.json', { items: [] });
  const VKW = /msme|scheme|yojana|loan|subsid|udyam|mudra|pmegp|cgtmse|startup|business|vyapar|udyog|entrepreneur|gst|pmfme|odop|stand[- ]?up|सब्सिडी|योजना|लोन|व्यापार|उद्योग/i;
  const out = [];
  const key = process.env.YOUTUBE_API_KEY;
  if (key) {
    for (const [label, q] of SRC.videoQueries || []) {
      try {
        const u = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=4&order=relevance&regionCode=IN&relevanceLanguage=hi&safeSearch=strict&videoEmbeddable=true&publishedAfter=${encodeURIComponent(new Date(Date.now() - 365 * 864e5).toISOString())}&q=${encodeURIComponent(q)}&key=${key}`;
        const j = JSON.parse(await get(u));
        for (const it of j.items || []) out.push({ id: it.id.videoId, title: decode(it.snippet.title), channel: decode(it.snippet.channelTitle), date: it.snippet.publishedAt, topic: label });
      } catch (e) { log.errors.push(`yt api "${q}": ${e.message}`); }
    }
  }
  for (const ch of SRC.youtubeChannels || []) {
    try {
      const id = ch.id || await channelId(ch.handle);
      const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
      const entries = (xml.match(/<entry>[\s\S]*?<\/entry>/g) || []).map((e) => ({
        id: (e.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/) || [])[1], title: tag(e, 'title'), channel: ch.name || tag(xml, 'title'), date: tag(e, 'published'), topic: ch.topic || '',
      })).filter((v) => v.id && VKW.test(v.title)).slice(0, ch.max || 6);
      out.push(...entries); log.feeds.push({ yt: ch.name || ch.handle, n: entries.length });
    } catch (e) { log.errors.push(`yt ${ch.name || ch.handle}: ${e.message}`); }
  }
  const seen = new Set(); const items = [];
  for (const v of [...out, ...(prev.items || [])]) { if (!v.id || seen.has(v.id)) continue; seen.add(v.id); items.push(v); }
  items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  wj('data/videos.json', { updated: new Date().toISOString(), topics: SRC.videoQueries || [], items: items.slice(0, 48) });
  log.videos = items.length;
}

await news().catch((e) => log.errors.push('news fatal: ' + e.message));
await videos().catch((e) => log.errors.push('videos fatal: ' + e.message));
log.finished = new Date().toISOString();
wj('data/refresh-log.json', log);
console.log(`refresh done · ${log.news ?? 0} news · ${log.videos ?? 0} videos · ${log.errors.length} feed errors`);

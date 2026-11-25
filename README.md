# BHARAT.LOAN

Independent, self-updating guide to Indian government business schemes, subsidies and incentives — with a lead-generation funnel to an advisory desk, AdSense monetisation, donations, contests and careers.

Static HTML, hosted free on **GitHub Pages** from this repository (`WEBWORKSA1/bharat.loan`). All automation and publishing runs in GitHub Actions — no other host.

## How it updates itself

`.github/workflows/daily-refresh.yml` runs twice a day (05:47 and 17:47 IST), on demand, and on every push to `main`:

1. `scripts/refresh.mjs` pulls fresh scheme news (Google News RSS per scheme + PIB) and explainer videos (YouTube channel RSS, or the YouTube Data API if a `YOUTUBE_API_KEY` repository secret is set) into `data/updates.json` and `data/videos.json`.
2. `scripts/build.mjs` bakes the shared header/footer into every page, fills the dynamic blocks (`<!--bl:NAME--> … <!--/bl:NAME-->`), and regenerates `sitemap.xml`, `feed.xml`, `robots.txt`, `ads.txt` and `data/search-index.json`. It fails the run if the inbox address is exposed anywhere, if an old AdSense ID appears, or if a page lacks the sponsorship top bar.
3. The workflow commits the result and publishes the site to GitHub Pages (only public files — `scripts/`, `.github/` and this README are never published).

### One-time GitHub Pages setup

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Same page → **Custom domain: `bharat.loan`** → Save → tick **Enforce HTTPS** once the certificate is issued.
3. At the domain registrar, point `bharat.loan` to GitHub Pages: A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and AAAA `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`). Optional `www` CNAME → `webworksa1.github.io`.

Every push to `main` (and each scheduled refresh) redeploys automatically. `data/pages-status.json` records the live Pages configuration after each run.

Every source is optional — a failing feed is logged in `data/refresh-log.json` and skipped.

## Files you edit

| File | What it controls |
|---|---|
| `partials.js` (CONFIG block at the top) | GA4 ID, Clarity ID, WhatsApp number, optional AdSense ad-unit slot IDs, optional FormSubmit alias, donation links (UPI / PayPal / Buy Me a Coffee / Razorpay), social links |
| `data/schemes.json` | Scheme registry used by the homepage, directory, Funding Matcher, search and per-scheme news |
| `data/contests.json` | Contests shown on `/contests` |
| `data/careers.json` | Open roles on `/careers` |
| `data/tips.json` | Daily founder tip on the homepage |
| `scripts/sources.json` | News queries, RSS feeds, YouTube channels and video topics |
| `scripts/site.mjs` | Header, footer, navigation, copyright line |

Edit any of these in the GitHub web editor; the next workflow run rebuilds the site.

## Leads

All forms post through `BL.send()` in `partials.js` to FormSubmit. The inbox address is never written in page source. The first live submission triggers a one-time FormSubmit activation email — confirm it once. After activation, paste the random alias FormSubmit gives you into `CONFIG.FORM_ALIAS` for maximum privacy.

## Monetisation checklist

- AdSense loader + `google-adsense-account` meta on every indexable page; `ads.txt` generated.
- Auto Ads: enable in AdSense → Ads → By site. Manual units: create in AdSense and paste slot IDs into `CONFIG.AD_SLOTS`.
- EEA/UK consent: enable Google’s CMP in AdSense → Privacy & messaging.

## Legacy

`scripts/legacy/` holds the original generators. Do not run them — they predate the current pages and would overwrite them.

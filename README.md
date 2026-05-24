# BHARAT.LOAN

Publisher / lead-gen front-end for Indian government business schemes, subsidies and incentives. Feeds qualified leads to the advisory desk (CONSULT.IN).

## Architecture

- **Static HTML** — no build step required to view. Hosted on GitHub Pages.
- **`index.html`** — homepage: hero, 4-step eligibility engine, central scheme cards, state selector, process, lead capture. All lead forms POST to FormSubmit (`webworksa1@gmail.com`).
- **`schemes/`** — one page per scheme (central + state), plus `schemes/index.html` (full directory).
- **`states/`** — one landing page per state (currently `gujarat.html`). The homepage state-selector links here.
- **`schemes-enriched.json`** — single source of truth for all scheme + state data.
- **`generate.js`** — Node generator. Reads the JSON, regenerates every scheme page, every live state page, and the schemes index.

## Regenerate / add a state or scheme

1. Edit `schemes-enriched.json` (add a scheme object with `scope: "<stateid>"`, or add a state to the `states` array and flip its `status` to `"live"`).
2. Run:

   ```
   node generate.js
   ```

3. Commit the regenerated `schemes/` and `states/` files. No other code changes are needed to add a state — it is pure data entry.

## Pending before hard launch

- **FormSubmit activation** — the first form submission triggers a one-time confirmation email to `webworksa1@gmail.com` that must be clicked before leads flow.
- **Gujarat figures** — all Gujarat scheme quanta are marked `verifyPending` and asterisked. Confirm exact rates/caps/taluka variations against the current government resolution before relying on the numbers.
- **CGTMSE ceiling** — sources disagree on the current cap; the page carries a verify caveat. Confirm the live ceiling.

# BHARAT.LOAN

Government scheme, subsidy & incentive advisory for Indian startups, MSMEs and industries.
National coverage (central schemes) + deep Gujarat state coverage. Publisher front-end that
routes qualified leads to the **CONSULT.IN** advisory desk.

## Stack
- Static `index.html` (self-contained: HTML + CSS + JS, no build step)
- `schemes.json` — scheme database (state-agnostic schema; UP drops in as a third key later)
- Deployed on Vercel (static)

## Live lead flow
- 4-step eligibility checker → matches schemes by stage / sector / state / need → ranks S→A→B
- Lead form POSTs to FormSubmit → **webworksa1@gmail.com**
- First submission triggers a one-time FormSubmit activation email (confirm it once)

## TODO before scale
- [ ] **Partner to verify Gujarat scheme quanta** (percentages/taluka bands are structural placeholders)
- [ ] Swap FormSubmit → Formspree or CONSULT.IN CRM when analytics needed
- [ ] Port to Next.js for programmatic per-scheme SEO pages (schemes.json already in portable shape)
- [ ] Add Uttar Pradesh as phase-two state (data-entry, not rebuild)

## Architecture
BHARAT.LOAN (publisher / SEO) → feeds leads → CONSULT.IN (agency / partner closes)

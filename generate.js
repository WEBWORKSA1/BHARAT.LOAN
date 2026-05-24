const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'schemes-enriched.json'), 'utf8'));
const OUT = path.join(__dirname, 'schemes');
const STATEOUT = path.join(__dirname, 'states');
[OUT, STATEOUT].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const stateById = Object.fromEntries(data.states.map(s => [s.id, s]));

const HEAD = (title, desc) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--ink:#0b1b2b;--ink-soft:#3a4a5c;--muted:#6b7a8a;--bg:#fbfcfd;--surface:#ffffff;--wash:#f1f5f9;--line:#e3e9f0;--line-soft:#eef2f6;--blue:#1456e6;--blue-deep:#0d3fb5;--blue-wash:#eef3ff;--teal:#0e9d8a;--teal-wash:#e6f6f3;--amber:#e08a1e;--amber-wash:#fdf3e3;--green:#0e9f6e;--green-wash:#e7f7f0;--shadow:0 4px 16px rgba(11,27,43,.06),0 1px 4px rgba(11,27,43,.04);--shadow-lg:0 24px 60px rgba(13,63,181,.13),0 4px 12px rgba(11,27,43,.06);--r:14px}
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased}
.wrap{max-width:1040px;margin:0 auto;padding:0 32px}
.util{background:var(--ink);color:#aebccb;font-size:12.5px}.util .wrap{display:flex;justify-content:space-between;align-items:center;height:40px;max-width:1180px}
.util .gov{display:flex;align-items:center;gap:9px}.util .dot{width:6px;height:6px;border-radius:50%;background:#3ddc97;box-shadow:0 0 0 3px rgba(61,220,151,.22)}.util a{color:#e2eaf2;text-decoration:none;font-weight:500}
header{background:rgba(251,252,253,.9);backdrop-filter:blur(14px);position:sticky;top:0;z-index:50;border-bottom:1px solid var(--line)}
header .wrap{display:flex;align-items:center;justify-content:space-between;height:74px;max-width:1180px}
.brand{display:flex;align-items:center;gap:13px;text-decoration:none}
.crest{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(150deg,var(--blue),var(--blue-deep));box-shadow:0 6px 16px rgba(20,86,230,.28)}
.crest span{font-family:'Fraunces',serif;font-weight:600;font-size:19px;color:#fff}
.brand-tx b{font-family:'Fraunces',serif;font-size:21px;font-weight:600;color:var(--ink);display:block;line-height:1}
.brand-tx small{font-size:10px;letter-spacing:.2em;color:var(--muted);text-transform:uppercase;font-weight:600}
nav.main{display:flex;gap:30px;align-items:center}nav.main a{color:var(--ink-soft);text-decoration:none;font-size:14.5px;font-weight:500}nav.main a:hover{color:var(--blue)}
.cta-sm{background:var(--blue);color:#fff!important;padding:10px 18px;border-radius:9px;font-weight:600!important;font-size:14px!important;box-shadow:0 4px 12px rgba(20,86,230,.22)}
.crumb{padding:24px 0 0;font-size:13px;color:var(--muted)}.crumb a{color:var(--blue);text-decoration:none}.crumb a:hover{text-decoration:underline}
.gjflag,.stateflag{display:inline-flex;width:22px;height:15px;border-radius:2px;overflow:hidden;flex-direction:column;box-shadow:0 1px 2px rgba(0,0,0,.15);vertical-align:middle;margin-right:6px}.gjflag i,.stateflag i{flex:1}.gjflag .a,.stateflag .a{background:var(--amber)}.gjflag .b,.stateflag .b{background:#fff}.gjflag .c,.stateflag .c{background:var(--green)}
.shead{padding:26px 0 30px}
.stags{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
.stag{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:5px 11px;border-radius:100px}
.stag.cat{color:var(--teal);background:var(--green-wash)}.stag.tier{color:var(--blue);background:var(--blue-wash)}.stag.body{color:var(--ink-soft);background:var(--wash)}
.stag.state{color:var(--amber);background:var(--amber-wash);display:inline-flex;align-items:center}
.shead h1{font-family:'Fraunces',serif;font-size:clamp(28px,4vw,44px);font-weight:600;line-height:1.08;letter-spacing:-.02em;margin-bottom:12px}
.shead .full{font-size:15px;color:var(--muted);margin-bottom:16px}
.shead .lede{font-size:19px;color:var(--ink-soft);line-height:1.55;max-width:700px;font-weight:500}
.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;margin:28px 0 0}
.fact{background:var(--surface);padding:16px 18px}
.fact .fl{font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:5px}
.fact .fv{font-family:'Fraunces',serif;font-size:15.5px;font-weight:600;color:var(--ink);line-height:1.25}
.verifybanner{background:var(--amber-wash);border:1px solid #f2d9a8;border-radius:11px;padding:14px 18px;margin:24px 0 0;display:flex;gap:12px;align-items:flex-start}
.verifybanner svg{width:20px;height:20px;color:var(--amber);flex-shrink:0;margin-top:2px}
.verifybanner p{font-size:13.5px;color:#8a5a14;line-height:1.5}
.verifybanner strong{color:#6e4810}
.layout{display:grid;grid-template-columns:1fr 320px;gap:46px;padding:36px 0 70px;align-items:start}
.mininav{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:34px;padding-bottom:24px;border-bottom:1px solid var(--line)}
.mininav a{font-size:13px;font-weight:600;color:var(--ink-soft);background:var(--wash);border:1px solid var(--line);padding:7px 13px;border-radius:100px;text-decoration:none;transition:all .15s}
.mininav a:hover{color:var(--blue);border-color:#c5d6f5;background:var(--blue-wash)}
.block{margin-bottom:38px;scroll-margin-top:90px}
.block h2{font-family:'Fraunces',serif;font-size:22px;font-weight:600;margin-bottom:15px;color:var(--ink)}
.atglance{background:var(--teal-wash);border:1px solid #c5e9e1;border-radius:var(--r);padding:18px 22px;margin-bottom:34px;display:flex;gap:13px;align-items:flex-start}
.atglance svg{width:22px;height:22px;color:var(--teal);flex-shrink:0;margin-top:2px}
.atglance .ag-l{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--teal);font-weight:700;margin-bottom:4px}
.atglance p{font-size:14.5px;color:var(--ink-soft);line-height:1.5}
.quantum-card{background:linear-gradient(165deg,var(--ink),#13314c);color:#fff;border-radius:var(--r);padding:26px 28px;margin-bottom:34px;box-shadow:var(--shadow-lg);position:relative;overflow:hidden}
.quantum-card::after{content:"";position:absolute;right:-50px;top:-50px;width:180px;height:180px;background:radial-gradient(circle,rgba(20,86,230,.25),transparent 70%)}
.quantum-card .q-label{font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--teal);font-weight:700;margin-bottom:10px;position:relative}
.quantum-card .q-main{font-family:'Fraunces',serif;font-size:19px;line-height:1.4;margin-bottom:14px;position:relative}
.quantum-card .q-note{font-size:13px;color:#aebfd2;line-height:1.55;padding-top:14px;border-top:1px solid rgba(255,255,255,.12);position:relative}
ul.checks{list-style:none;display:flex;flex-direction:column;gap:11px}
ul.checks li{display:flex;gap:11px;align-items:flex-start;font-size:14.8px;color:var(--ink-soft);line-height:1.5}
ul.checks li svg{width:18px;height:18px;flex-shrink:0;color:var(--teal);margin-top:3px}
ol.steps{list-style:none;counter-reset:s;display:flex;flex-direction:column;gap:13px}
ol.steps li{display:flex;gap:14px;align-items:flex-start;font-size:14.8px;color:var(--ink-soft);line-height:1.5;counter-increment:s}
ol.steps li::before{content:counter(s);flex-shrink:0;width:28px;height:28px;border-radius:8px;background:var(--blue-wash);color:var(--blue);font-weight:700;font-size:14px;display:grid;place-items:center;font-family:'Fraunces',serif}
.docs{display:flex;flex-wrap:wrap;gap:9px}
.doc{font-size:13.5px;color:var(--ink-soft);background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:9px 13px}
.faq{border:1px solid var(--line);border-radius:11px;overflow:hidden;margin-bottom:9px;background:var(--surface)}
.faq summary{cursor:pointer;padding:15px 18px;font-weight:600;font-size:14.8px;color:var(--ink);list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";font-size:20px;color:var(--blue);font-weight:400;flex-shrink:0}
.faq[open] summary::after{content:"\u2212"}
.faq .fa{padding:0 18px 16px;font-size:14px;color:var(--ink-soft);line-height:1.55}
.advisor-block{background:var(--blue-wash);border:1px solid #d7e3ff;border-radius:var(--r);padding:24px 26px;margin-bottom:34px}
.advisor-block .ab-label{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--blue-deep);font-weight:700;margin-bottom:12px}
.advisor-block .ab-label .d{width:6px;height:6px;border-radius:50%;background:var(--blue)}
.advisor-block p{font-size:15px;color:var(--ink-soft);line-height:1.6}
.verify{font-size:12.5px;color:var(--muted);background:var(--wash);border-left:3px solid var(--amber);border-radius:0 8px 8px 0;padding:12px 16px;line-height:1.5}
.aside{position:sticky;top:92px}
.cta-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);overflow:hidden}
.cta-card .cc-top{background:linear-gradient(180deg,var(--blue-wash),transparent);padding:22px 24px 18px;border-bottom:1px solid var(--line-soft)}
.cta-card .badge{display:inline-flex;align-items:center;gap:7px;font-size:11px;letter-spacing:.04em;color:var(--green);font-weight:700;background:var(--green-wash);padding:5px 10px;border-radius:100px;margin-bottom:11px}
.cta-card .badge .d{width:6px;height:6px;border-radius:50%;background:var(--green)}
.cta-card h3{font-family:'Fraunces',serif;font-size:18px;font-weight:600;line-height:1.25;color:var(--ink)}
.cta-card .cc-body{padding:20px 24px 24px}
.cta-card .cc-body p{font-size:13.5px;color:var(--muted);margin-bottom:16px;line-height:1.5}
.cta-card .field{width:100%;background:var(--wash);border:1.5px solid var(--line);border-radius:9px;padding:12px 14px;font-size:14px;font-family:inherit;margin-bottom:9px;color:var(--ink)}
.cta-card .field:focus{outline:none;border-color:var(--blue)}.cta-card .field::placeholder{color:var(--muted)}
.cta-card button{width:100%;background:var(--blue);color:#fff;border:none;border-radius:10px;padding:13px;font-weight:600;font-size:15px;font-family:inherit;cursor:pointer;box-shadow:0 6px 16px rgba(20,86,230,.25);transition:transform .15s}
.cta-card button:hover{transform:translateY(-1px)}
.cta-card .micro{font-size:11.5px;color:var(--muted);text-align:center;margin-top:11px}
.related{background:var(--wash);border-top:1px solid var(--line);padding:52px 0}
.related h3{font-family:'Fraunces',serif;font-size:20px;font-weight:600;margin-bottom:20px}
.rel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.rel-card{background:var(--surface);border:1px solid var(--line);border-radius:11px;padding:18px;text-decoration:none;transition:all .2s;display:block}
.rel-card:hover{border-color:#c5d6f5;box-shadow:var(--shadow);transform:translateY(-2px)}
.rel-card .rc-cat{font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--teal);font-weight:700;margin-bottom:7px}
.rel-card .rc-name{font-family:'Fraunces',serif;font-size:16px;font-weight:600;color:var(--ink);margin-bottom:4px}
.rel-card .rc-q{font-size:12.5px;color:var(--muted);line-height:1.4}
footer{background:var(--bg);color:var(--muted);padding:46px 0 30px;font-size:13.5px;border-top:1px solid var(--line)}
footer .wrap{max-width:1180px}
footer .disc{font-size:12px;line-height:1.6;color:var(--muted);max-width:780px}
footer .fbrand b{font-family:'Fraunces',serif;color:var(--ink);font-size:18px}
footer a{color:var(--blue);text-decoration:none}
@media(max-width:860px){.layout{grid-template-columns:1fr;gap:30px}.aside{position:static}nav.main{display:none}.wrap{padding:0 20px}.facts{grid-template-columns:1fr 1fr}}
</style>
</head>`;

const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>';
const STAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6L5.7 21.4 8 14 2 9.4h7.6z"/></svg>';
const WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';
const GJFLAG = '<span class="gjflag"><i class="a"></i><i class="b"></i><i class="c"></i></span>';

const flagFor = (stateId) => (stateById[stateId] && stateById[stateId].flag) ? '<span class="stateflag"><i class="a"></i><i class="b"></i><i class="c"></i></span>' : '';
const scopeLabel = (scope) => (scope !== 'central' && stateById[scope]) ? ' \u00b7 ' + stateById[scope].name : '';

const NAVBAR = `<header><div class="wrap">
  <a href="/" class="brand"><div class="crest"><span>\u092d\u093e</span></div><div class="brand-tx"><b>BHARAT.LOAN</b><small>Scheme &amp; Subsidy Advisory</small></div></a>
  <nav class="main"><a href="/#schemes">Schemes</a><a href="/#states">States</a><a href="/#engine">Check Eligibility</a><a href="/#engine" class="cta-sm">Book a Consultation</a></nav>
</div></header>`;
const UTIL = `<div class="util"><div class="wrap"><div class="gov"><span class="dot"></span> Verified scheme reference \u00b7 BHARAT.LOAN</div><div><a href="/#engine">Check Your Eligibility \u2192</a></div></div></div>`;
const FOOTER = `<footer><div class="wrap"><div class="fbrand"><b>BHARAT.LOAN</b></div><p style="margin:10px 0 18px;max-width:360px;line-height:1.6">Government scheme, subsidy and incentive advisory for Indian startups, MSMEs and industries. Advisory delivered by CONSULT.IN.</p><p class="disc">BHARAT.LOAN is an independent advisory service. We are not a government body and do not represent any ministry or agency. Scheme details are compiled from official sources and verified regularly; applicants should confirm current terms with the relevant authority. Subsidy and loan approvals are at the sole discretion of the respective government bodies and lending institutions. \u00a9 2026 BHARAT.LOAN.</p></div></footer>`;

function leadScript(scheme) {
  return `<script>
document.getElementById('leadBtn').addEventListener('click',async function(){
  var n=document.getElementById('cn').value.trim(),p=document.getElementById('cp').value.trim();
  if(!n||!p){alert('Please add your name and phone so an advisor can reach you.');return;}
  this.textContent='Sending\u2026';this.disabled=true;
  var lead={name:n,phone:p,email:document.getElementById('ce').value,scheme:'${scheme}',_subject:'New BHARAT.LOAN lead (${scheme}): '+n};
  try{await fetch('https://formsubmit.co/ajax/webworksa1@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(lead)});}catch(e){}
  document.querySelector('.cc-body').innerHTML='<p style="font-size:15px;color:var(--ink)"><strong>Thank you, '+n+'.</strong></p><p style="font-size:13.5px;color:var(--muted);margin-top:6px">Our advisory desk will reach out on '+p+' within one business day.</p>';
});
<\/script>`;
}

function related(current, all) {
  const same = all.filter(s => s.id !== current.id && s.scope === current.scope);
  const pool = (same.length >= 3 ? same : all.filter(s => s.id !== current.id)).slice(0, 3);
  return pool.map(s => `<a class="rel-card" href="${s.slug}.html"><div class="rc-cat">${s.cat}${scopeLabel(s.scope)}</div><div class="rc-name">${s.name}</div><div class="rc-q">${s.oneLiner}</div></a>`).join('');
}

function schemePage(s, all) {
  const isState = s.scope !== 'central';
  const st = isState ? stateById[s.scope] : null;
  const title = `${s.name} \u2014 ${s.full} | Eligibility, Subsidy & How to Apply | BHARAT.LOAN`;
  const desc = `${s.oneLiner} Eligibility, documents, quantum and step-by-step guidance from BHARAT.LOAN.`;
  const crumbScope = isState ? `<a href="../states/${s.scope}.html">${st.name}</a>` : `<a href="/#schemes">Schemes</a>`;
  return `${HEAD(title, desc)}
<body>
${UTIL}
${NAVBAR}
<div class="wrap">
  <div class="crumb"><a href="/">Home</a> &nbsp;/&nbsp; ${crumbScope} &nbsp;/&nbsp; ${s.name}</div>
  <div class="shead">
    <div class="stags">
      <span class="stag cat">${s.cat}</span>
      <span class="stag tier">Tier ${s.tier}</span>
      ${isState ? `<span class="stag state">${flagFor(s.scope)}${st.name}</span>` : `<span class="stag body">Central</span>`}
    </div>
    <h1>${s.name}</h1>
    <div class="full">${s.full}${s.estd ? ` \u00b7 Est. ${s.estd}` : ''} \u00b7 ${s.body}</div>
    <p class="lede">${s.oneLiner}</p>
    <div class="facts">${s.facts.map(f => `<div class="fact"><div class="fl">${f[0]}</div><div class="fv">${f[1]}</div></div>`).join('')}</div>
    ${s.verifyPending ? `<div class="verifybanner">${WARN}<p><strong>Figures pending verification.</strong> This is a ${st.name} state scheme \u2014 the exact rates, caps and taluka-category variations are being confirmed against the current government resolution by our advisory desk. Treat amounts marked * as indicative until verified.</p></div>` : ''}
  </div>
  <div class="layout">
    <div class="main-col">
      <div class="mininav">
        <a href="#glance">At a glance</a><a href="#get">What you get</a><a href="#who">Who it's for</a><a href="#elig">Eligibility</a><a href="#apply">How to apply</a><a href="#docs">Documents</a><a href="#faq">FAQ</a>
      </div>
      <div class="atglance" id="glance">${STAR}<div><div class="ag-l">Quick eligibility read</div><p>${s.eligibleQuick}</p></div></div>
      <div class="quantum-card" id="get">
        <div class="q-label">What you can get</div>
        <div class="q-main">${s.quantum}</div>
        <div class="q-note">${s.guaranteeNote}</div>
      </div>
      <div class="block" id="who"><h2>Who it's for</h2><p style="font-size:15px;color:var(--ink-soft);line-height:1.6">${s.whoFor}</p></div>
      <div class="block" id="elig"><h2>Eligibility</h2><ul class="checks">${s.eligibility.map(e => `<li>${CHECK}<span>${e}</span></li>`).join('')}</ul></div>
      <div class="block" id="apply"><h2>How to apply</h2><ol class="steps">${s.howToApply.map(h => `<li>${h}</li>`).join('')}</ol></div>
      <div class="block" id="docs"><h2>Documents you'll need</h2><div class="docs">${s.documents.map(d => `<span class="doc">${d}</span>`).join('')}</div></div>
      <div class="block" id="faq"><h2>Frequently asked</h2>${s.faqs.map(f => `<details class="faq"><summary>${f[0]}</summary><div class="fa">${f[1]}</div></details>`).join('')}</div>
      <div class="advisor-block"><div class="ab-label"><span class="d"></span> Where an advisor helps</div><p>${s.advisorAngle}</p></div>
      <p class="verify"><strong>Please verify before applying.</strong> Scheme caps, subsidy rates, fees and eligibility are revised periodically by the governing body. Figures here are compiled from public sources and reviewed regularly \u2014 confirm current terms with the relevant authority or our advisory desk before you act.</p>
    </div>
    <aside class="aside">
      <div class="cta-card">
        <div class="cc-top"><span class="badge"><span class="d"></span> Advisory Desk</span><h3>Want help claiming ${s.name}?</h3></div>
        <div class="cc-body">
          <p>A 25-year finance professional will check your eligibility and handle the application end-to-end. Complimentary first assessment.</p>
          <input class="field" id="cn" type="text" placeholder="Your name">
          <input class="field" id="cp" type="tel" placeholder="Phone / WhatsApp">
          <input class="field" id="ce" type="email" placeholder="Email (optional)">
          <button id="leadBtn">Request a Consultation \u2192</button>
          <p class="micro">No obligation \u00b7 Routed to our advisory desk</p>
        </div>
      </div>
    </aside>
  </div>
</div>
<div class="related"><div class="wrap"><h3>Related schemes</h3><div class="rel-grid">${related(s, all)}</div></div></div>
${FOOTER}
${leadScript(s.name)}
</body>
</html>`;
}

function statePage(state, all) {
  const schemes = all.filter(s => s.scope === state.id);
  const title = `${state.name} Government Schemes & Incentives | BHARAT.LOAN`;
  const desc = `${state.name} state schemes, subsidies and incentives for business \u2014 ${state.tagline} Verified reference with on-the-ground advisory.`;
  return `${HEAD(title, desc)}
<body>
${UTIL}
${NAVBAR}
<div class="wrap">
  <div class="crumb"><a href="/">Home</a> &nbsp;/&nbsp; <a href="/#states">States</a> &nbsp;/&nbsp; ${state.name}</div>
  <div class="shead">
    <div class="stags"><span class="stag state">${flagFor(state.id)}${state.name}</span><span class="stag body">State coverage</span></div>
    <h1>${state.name} schemes &amp; incentives</h1>
    <p class="lede">${state.intro}</p>
    ${schemes.some(s=>s.verifyPending) ? `<div class="verifybanner">${WARN}<p><strong>State figures pending verification.</strong> ${state.name} incentive rates and caps are set by the current government resolution and are being confirmed by our advisory desk. Amounts marked * are indicative until verified.</p></div>` : ''}
  </div>
  <div style="padding:30px 0 24px"><h2 style="font-family:'Fraunces',serif;font-size:22px;font-weight:600">${state.name} schemes we cover</h2></div>
  <div class="rel-grid" style="padding-bottom:30px">
    ${schemes.map(s => `<a class="rel-card" href="../schemes/${s.slug}.html"><div class="rc-cat">${s.cat} \u00b7 Tier ${s.tier}</div><div class="rc-name">${s.name}</div><div class="rc-q">${s.oneLiner}</div></a>`).join('')}
  </div>
  <div class="advisor-block" style="margin:20px 0 60px">
    <div class="ab-label"><span class="d"></span> On the ground in ${state.name}</div>
    <p>Our advisory desk works ${state.name} directly \u2014 confirming current resolution terms, navigating the District Industries Centre and nodal agencies, and structuring applications to land the best incentive tier. <a href="/#engine" style="color:var(--blue);font-weight:600;text-decoration:none">Check your eligibility \u2192</a></p>
  </div>
</div>
${FOOTER}
</body>
</html>`;
}

function schemesIndex(all) {
  const central = all.filter(s => s.scope === 'central');
  const title = 'All Government Schemes \u2014 Central & State | BHARAT.LOAN';
  return `${HEAD(title, 'Browse every major Indian central and state scheme \u2014 credit guarantees, capital subsidies, seed funds and tax incentives. Verified reference with advisory support.')}
<body>
${UTIL}
${NAVBAR}
<div class="wrap">
  <div class="crumb"><a href="/">Home</a> &nbsp;/&nbsp; Schemes</div>
  <div class="shead"><h1>Government schemes</h1><p class="lede">Every major central scheme in one verified reference. Select a scheme for eligibility, documents and how to apply \u2014 or check what you qualify for in 60 seconds.</p></div>
  <div style="padding:28px 0 18px"><h2 style="font-family:'Fraunces',serif;font-size:22px;font-weight:600">Central government schemes</h2></div>
  <div class="rel-grid" style="padding-bottom:40px">
    ${central.map(s => `<a class="rel-card" href="${s.slug}.html"><div class="rc-cat">${s.cat} \u00b7 Tier ${s.tier}</div><div class="rc-name">${s.name}</div><div class="rc-q">${s.oneLiner}</div></a>`).join('')}
  </div>
  <div style="padding:8px 0 18px"><h2 style="font-family:'Fraunces',serif;font-size:22px;font-weight:600">State coverage</h2></div>
  <div class="rel-grid" style="padding-bottom:60px">
    ${data.states.map(st => `<a class="rel-card" href="${st.status==='live'?'../states/'+st.id+'.html':'#'}" ${st.status!=='live'?'style="opacity:.55;pointer-events:none"':''}><div class="rc-cat">${st.status==='live'?'Live':'Coming soon'}</div><div class="rc-name">${flagFor(st.id)}${st.name}</div><div class="rc-q">${st.tagline||'Coverage coming soon.'}</div></a>`).join('')}
  </div>
</div>
${FOOTER}
</body>
</html>`;
}

let n = 0;
data.schemes.forEach(s => { fs.writeFileSync(path.join(OUT, `${s.slug}.html`), schemePage(s, data.schemes)); n++; console.log('scheme: schemes/' + s.slug + '.html'); });
data.states.filter(st => st.status === 'live').forEach(st => { fs.writeFileSync(path.join(STATEOUT, `${st.id}.html`), statePage(st, data.schemes)); console.log('state: states/' + st.id + '.html'); });
fs.writeFileSync(path.join(OUT, 'index.html'), schemesIndex(data.schemes));
console.log('index: schemes/index.html');
console.log('DONE \u2014 ' + n + ' scheme pages + ' + data.states.filter(s=>s.status==='live').length + ' state page(s) + index');

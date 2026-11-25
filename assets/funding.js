/* BHARAT.LOAN Funding Matcher — 6-step wizard → instant matches → lead capture. Data is baked into the page daily. */
(function () {
  'use strict';
  var data = [];
  try { data = JSON.parse(document.getElementById('schemes-data').textContent.replace(/<!--[\s\S]*?-->/g, '')).schemes || []; } catch (e) {}
  var p = new URLSearchParams(location.search);
  var A = { need: p.get('need') || '', amount: '', stage: p.get('stage') || '', sector: '', state: p.get('state') || '', who: [] };
  var STEPS = [
    { k: 'need', t: 'What do you need most?', o: [['loan', 'A business loan / working capital'], ['subsidy', 'Subsidy or grant (money you don’t repay)'], ['startup', 'Startup funding / seed grant'], ['upgrade', 'Machinery or technology upgrade'], ['scale', 'Expansion / large project incentives'], ['any', 'Not sure — show me everything']] },
    { k: 'amount', t: 'Roughly how much funding?', o: [['5', 'Up to ₹5 lakh'], ['25', '₹5 – 25 lakh'], ['100', '₹25 lakh – ₹1 crore'], ['1000', '₹1 – 10 crore'], ['10000', 'Above ₹10 crore'], ['0', 'Not sure yet']] },
    { k: 'stage', t: 'What stage is your business at?', o: [['idea', 'Idea / not started yet'], ['new', 'New — under 2 years'], ['growing', 'Growing — 2 to 5 years'], ['established', 'Established — 5+ years']] },
    { k: 'sector', t: 'What is your main sector?', o: [['mfg', 'Manufacturing'], ['service', 'Services'], ['trade', 'Trading / retail'], ['agri', 'Food processing / agri / dairy'], ['textile', 'Textiles / garments'], ['startup', 'Tech or innovation startup']] },
    { k: 'state', t: 'Where is (or will be) the business?', o: [['Uttar Pradesh', 'Uttar Pradesh'], ['Gujarat', 'Gujarat'], ['Maharashtra', 'Maharashtra'], ['Other state / UT', 'Another state / UT']] },
    { k: 'who', t: 'Does any of this apply to the main promoter?', multi: true, o: [['women', 'Woman entrepreneur'], ['sc-st', 'SC / ST'], ['youth', 'Aged 18–40'], ['ex-servicemen', 'Ex-serviceman'], ['divyang', 'Person with disability'], ['minority', 'Minority community'], ['none', 'None of these']] },
  ];
  var scopeOf = { 'Uttar Pradesh': 'up', 'Gujarat': 'gujarat', 'Maharashtra': 'maharashtra' };
  function match(ans) {
    ans = ans || A;
    var sc = scopeOf[ans.state] || null, amt = +ans.amount || 0;
    return data.filter(function (s) {
      if (s.scope !== 'central' && ans.state && s.scope !== sc) return false;
      if (s.scope !== 'central' && !ans.state) return false;
      if (ans.need && ans.need !== 'any' && s.need.indexOf(ans.need) === -1 && !(ans.need === 'startup' && s.need.indexOf('loan') > -1 && s.stage.indexOf('idea') > -1)) return false;
      if (ans.stage && s.stage.indexOf(ans.stage) === -1) return false;
      if (ans.sector) {
        var sec = ans.sector, ok = s.sector.indexOf(sec) > -1;
        if (!ok && sec === 'textile') ok = s.sector.indexOf('mfg') > -1 && s.cat !== 'Incentive';
        if (!ok && sec === 'startup') ok = s.sector.indexOf('service') > -1 && s.need.indexOf('loan') > -1;
        if (!ok) return false;
      }
      if (s.who.indexOf('all') === -1 && ans.who.length) { if (!s.who.some(function (w) { return ans.who.indexOf(w) > -1; })) return false; }
      else if (s.who.indexOf('all') === -1 && !ans.who.length && i >= 5) return false;
      var amtMin = { 5: 0, 25: 5, 100: 25, 1000: 100, 10000: 1000 }[amt] || 0;
      if (amtMin && s.maxLakh && amtMin > s.maxLakh) return false;
      return true;
    }).sort(function (a, b) { var t = { S: 0, A: 1, B: 2 }; return (t[a.tier] - t[b.tier]) || (a.scope === 'central') - (b.scope === 'central'); });
  }
  var i = 0, auto = {};
  // skip steps already answered via URL (?state=&need=&stage=)
  var q = document.getElementById('wizq'), bar = document.getElementById('wizbar'), cnt = document.getElementById('wizn'), back = document.getElementById('wizback');
  if (!q) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function counter() { var n = match().length; cnt.textContent = (A.need || A.state || A.stage) ? n : '–'; }
  function render() {
    while (i < STEPS.length && STEPS[i].k !== 'who' && p.get(STEPS[i].k) && A[STEPS[i].k] && !auto[i]) { auto[i] = 1; i++; }
    if (i >= STEPS.length) return results();
    var s = STEPS[i];
    bar.style.width = (i / STEPS.length * 100) + '%';
    q.innerHTML = '<div class="qlabel">Step ' + (i + 1) + ' of ' + STEPS.length + '</div><h2 class="wiz-t">' + s.t + '</h2><div class="wiz-opts">' +
      s.o.map(function (o) { var sel = s.multi ? A.who.indexOf(o[0]) > -1 : A[s.k] === o[0]; return '<button type="button" class="wopt' + (sel ? ' sel' : '') + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      (s.multi ? '<button type="button" class="btn btn-primary wiz-go">See my matches →</button>' : '');
    back.hidden = i === 0;
    [].forEach.call(q.querySelectorAll('.wopt'), function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-v');
        if (s.multi) {
          if (v === 'none') A.who = []; else { var ix = A.who.indexOf(v); if (ix > -1) A.who.splice(ix, 1); else A.who.push(v); }
          [].forEach.call(q.querySelectorAll('.wopt'), function (x) { var xv = x.getAttribute('data-v'); x.classList.toggle('sel', xv === 'none' ? !A.who.length && v === 'none' : A.who.indexOf(xv) > -1); });
          counter(); return;
        }
        A[s.k] = v; counter(); i++; setTimeout(render, 140);
      });
    });
    var go = q.querySelector('.wiz-go'); if (go) go.addEventListener('click', function () { i++; render(); });
    if (window.BL) BL.track('matcher_step', { step: i + 1 });
  }
  back.addEventListener('click', function () { if (i > 0) { i--; render(); } });
  function card(s) {
    var st = { central: 'Central', up: 'Uttar Pradesh', gujarat: 'Gujarat', maharashtra: 'Maharashtra' }[s.scope];
    return '<a class="mcard" href="' + s.url + '" target="_blank" rel="noopener"><span class="mc-k">' + esc(s.cat) + ' · ' + esc(st) + ' · Tier ' + esc(s.tier) + '</span><b>' + esc(s.name) + '</b><span class="mc-q">' + esc(s.quantum) + '</span><span class="mc-go">Full guide →</span></a>';
  }
  function results() {
    var m = match(); var central = m.filter(function (s) { return s.scope === 'central'; }), state = m.filter(function (s) { return s.scope !== 'central'; });
    document.getElementById('wiz').hidden = true;
    var r = document.getElementById('wizres'); r.hidden = false;
    var labels = { need: STEPS[0], amount: STEPS[1], stage: STEPS[2], sector: STEPS[3] };
    var lab = function (k) { var o = (labels[k] || {}).o || []; for (var j = 0; j < o.length; j++) if (o[j][0] === A[k]) return o[j][1]; return A[k] || ''; };
    var profile = [lab('need'), lab('amount'), lab('stage'), lab('sector'), A.state, A.who.join(', ') || 'general'].filter(Boolean).join(' · ');
    r.innerHTML = '<div class="res-head"><div class="res-n">' + m.length + '</div><div><h2>' + (m.length ? 'schemes match your business' : 'Your case needs a personal assessment') + '</h2><p class="muted">' + esc(profile) + ' · <button type="button" class="linkbtn" id="redo">change answers</button></p></div></div>' +
      (state.length ? '<h3 class="res-sub">' + esc(A.state) + ' state schemes</h3><div class="mgrid">' + state.map(card).join('') + '</div>' : (A.state && !scopeOf[A.state] ? '<p class="note">State-level schemes for ' + esc(A.state) + ' are being added. An advisor will map your state’s incentives personally.</p>' : '')) +
      (central.length ? '<h3 class="res-sub">Central government schemes</h3><div class="mgrid">' + central.map(card).join('') + '</div>' : '') +
      '<div class="capture-card" id="plan"><div class="cap-l"><span class="k">Free · no obligation</span><h3>Get your personal funding plan</h3><p>An advisor checks the fine print for your case, tells you which schemes stack, and helps you file. Call-back within one business day.</p><ul class="checks-sm"><li>Ranked by value and approval odds</li><li>Your exact documents checklist</li><li>Project-report and filing support</li></ul></div>' +
      '<form class="cap-f" id="capf" novalidate><div class="form-grid"><input class="field" name="name" placeholder="Your name" required aria-label="Your name" autocomplete="name"><input class="field" name="phone" type="tel" placeholder="Mobile / WhatsApp" required aria-label="Mobile number" autocomplete="tel"><input class="field" name="email" type="email" placeholder="Email (optional)" aria-label="Email" autocomplete="email"><input class="field" name="district" placeholder="City / district" aria-label="City or district"><input class="field full-row" name="business" placeholder="Business name or idea (optional)" aria-label="Business"><select class="field full-row" name="timeline" aria-label="When do you need funds"><option value="">When do you need the funds?</option><option>Immediately / within 30 days</option><option>In 1–3 months</option><option>In 3–6 months</option><option>Just exploring</option></select></div>' +
      '<input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><label class="consent"><input type="checkbox" name="consent" value="yes"> I agree to be contacted by the BHARAT.LOAN advisory desk about my enquiry and accept the <a href="/privacy" target="_blank">Privacy Policy</a>.</label>' +
      '<button type="submit" class="btn btn-primary" style="width:100%;justify-content:center">Get my free funding plan →</button><div class="form-msg" role="status" aria-live="polite"></div></form></div>';
    r.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('redo').addEventListener('click', function () { i = 0; r.hidden = true; document.getElementById('wiz').hidden = false; render(); });
    var f = document.getElementById('capf');
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var g = function (n) { var el = f.elements[n]; return el ? (el.type === 'checkbox' ? (el.checked ? 'yes' : '') : el.value.trim()) : ''; };
      var msg = f.querySelector('.form-msg');
      if (g('name').length < 2) { msg.textContent = 'Please add your name.'; return; }
      if (!window.BL || !BL.phoneOk(g('phone'))) { msg.textContent = 'Please enter a valid 10-digit Indian mobile number.'; return; }
      if (!g('consent')) { msg.textContent = 'Please tick the consent box so we can contact you.'; return; }
      var btn = f.querySelector('button[type="submit"]'); btn.disabled = true; btn.textContent = 'Sending…'; msg.textContent = '';
      BL.send({ name: g('name'), phone: g('phone'), email: g('email'), district: g('district'), business: g('business'), timeline: g('timeline'), state: A.state, need: lab('need'), amount: lab('amount'), stage: lab('stage'), sector: lab('sector'), category: A.who.join(', ') || 'general', matched_count: String(m.length), matched_schemes: m.map(function (s) { return s.name; }).join(', '), scheme: 'Funding Matcher', consent: 'yes', _honey: g('_honey') }, 'funding').then(function (res) {
        if (res.ok) {
          document.getElementById('plan').innerHTML = '<div class="thanks" style="padding:20px"><div class="t-ic">✓</div><p class="t-h">Thank you, ' + esc(g('name')) + ' — your plan request is in.</p><p>Our advisory desk will call you on <b>' + esc(g('phone')) + '</b> within one business day.</p><div class="howgrid" style="text-align:left;margin-top:18px"><div><b>Today</b><p>We review your profile and the ' + m.length + ' matched schemes.</p></div><div><b>Within 1 day</b><p>Advisor call: what stacks, what to apply for first.</p></div><div><b>Next</b><p>Documents checklist and project-report help.</p></div><div><b>Then</b><p>Filing on the official portal and bank follow-up.</p></div></div><p class="t-next" style="margin-top:16px">Meanwhile: <a href="/guides/documents-for-government-business-loan">prepare your documents →</a></p><p style="margin-top:10px"><a class="btn btn-ghost" href="https://wa.me/?text=' + encodeURIComponent('I just found the government schemes my business qualifies for — free check: https://bharat.loan/get-funding') + '" target="_blank" rel="noopener">Share the matcher on WhatsApp</a></p></div>';
        } else { btn.disabled = false; btn.textContent = 'Try again →'; msg.textContent = 'We could not send your request (connection problem). Your details are saved and will retry automatically — or press “Try again”.'; }
      });
    });
    if (window.BL) BL.track('matcher_results', { matches: m.length, state: A.state });
  }
  counter(); render();
})();

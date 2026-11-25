/* BHARAT.LOAN — "Describe your business" box on the homepage.
   Reads plain-language text (English or Hindi), pulls out amount, state, sector, stage and promoter category,
   and ranks the scheme registry baked into the page. Runs entirely in the browser; nothing is sent until
   the visitor asks for a funding plan. */
(function () {
  'use strict';
  var form = document.getElementById('ask'), out = document.getElementById('ask-out'), ta = document.getElementById('ask-q');
  if (!form || !out || !ta) return;
  var data = [];
  try { data = JSON.parse(document.getElementById('schemes-data').textContent.replace(/<!--[\s\S]*?-->/g, '')).schemes || []; } catch (e) {}
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  var LIVE = {
    gujarat: { name: 'Gujarat', re: /gujarat|ahmedabad|surat|vadodara|baroda|rajkot|bhavnagar|jamnagar|gandhinagar|junagadh|anand\b|kutch|kachchh|bhuj|morbi|mehsana|navsari|valsad|vapi|bharuch|porbandar|amreli|nadiad|godhra|palanpur|गुजरात|सूरत|अहमदाबाद/i },
    up: { name: 'Uttar Pradesh', re: /uttar pradesh|lucknow|kanpur|varanasi|banaras|agra|noida|ghaziabad|prayagraj|allahabad|meerut|gorakhpur|bareilly|aligarh|moradabad|saharanpur|jhansi|ayodhya|mathura|firozabad|bhadohi|उत्तर प्रदेश|लखनऊ|कानपुर|वाराणसी/i, cs: /\bU\.?P\.?\b/ },
    maharashtra: { name: 'Maharashtra', re: /maharashtra|mumbai|bombay|pune|nagpur|nashik|thane|aurangabad|sambhajinagar|kolhapur|solapur|amravati|nanded|sangli|satara|jalgaon|latur|akola|ahmednagar|महाराष्ट्र|मुंबई|पुणे|नागपुर/i }
  };
  var OTHER = [['Karnataka', /karnataka|bengaluru|bangalore|mysuru|mysore|hubli|mangaluru/i], ['Tamil Nadu', /tamil nadu|chennai|coimbatore|madurai|tiruppur|salem/i], ['Telangana', /telangana|hyderabad|warangal/i], ['Andhra Pradesh', /andhra|vijayawada|visakhapatnam|vizag|guntur/i], ['Kerala', /kerala|kochi|cochin|thiruvananthapuram|kozhikode/i], ['West Bengal', /west bengal|kolkata|calcutta|howrah|siliguri/i], ['Delhi', /\bdelhi\b|new delhi/i], ['Rajasthan', /rajasthan|jaipur|jodhpur|udaipur|kota\b/i], ['Madhya Pradesh', /madhya pradesh|bhopal|indore|gwalior|jabalpur/i], ['Bihar', /bihar|patna|gaya|muzaffarpur/i], ['Punjab', /punjab|ludhiana|amritsar|jalandhar|mohali/i], ['Haryana', /haryana|gurugram|gurgaon|faridabad|panipat|hisar/i], ['Odisha', /odisha|orissa|bhubaneswar|cuttack/i], ['Jharkhand', /jharkhand|ranchi|jamshedpur|dhanbad/i], ['Chhattisgarh', /chhattisgarh|raipur|bilaspur/i], ['Assam', /assam|guwahati/i], ['Uttarakhand', /uttarakhand|dehradun|haridwar/i], ['Himachal Pradesh', /himachal|shimla/i], ['Goa', /\bgoa\b/i], ['Jammu & Kashmir', /kashmir|jammu|srinagar/i]];
  var SECTOR = [['startup', 'Tech startup', /start-?up|\bapp\b|saas|software product|platform|deep ?tech|fintech|edtech|healthtech|\bai\b|innovation|prototype|स्टार्टअप/i],
    ['textile', 'Textiles', /textile|garment|apparel|saree|sari\b|weav|loom|knit|embroider|dyeing|yarn|fabric|hosiery|कपड़ा|टेक्सटाइल/i],
    ['agri', 'Agri & food', /dairy|milk|cattle|cow|buffalo|farm|agri|poultry|goat|fish|aqua|food|bakery|flour|rice mill|dal mill|spice|pickle|papad|organic|cold storage|honey|mushroom|crop|horticulture|nursery|डेयरी|खेती|किसान/i],
    ['trade', 'Shop / trading', /shop|kirana|store|retail|trading|wholesale|distribut|dealer|showroom|supermarket|mart\b|pharmacy|medical store|दुकान|किराना/i],
    ['service', 'Services', /salon|parlou?r|clinic|repair|restaurant|cafe|dhaba|hotel|homestay|transport|taxi|cab\b|truck|logistics|tuition|coaching|consult|agency|garage|tailor|laundry|gym|it services|bpo|travel|courier|catering|photograph|event/i],
    ['mfg', 'Manufacturing', /manufactur|factory|plant\b|industr|production|fabricat|machine shop|plastic|packag|furniture|steel|chemical|pharma|ceramic|electronic|foundry|forging|unit\b|फैक्ट्री|उद्योग/i]];
  var NEED = [['startup', 'Startup funding', /seed|investor|angel|startup fund|grant for my (tech|startup)|incubat/i],
    ['upgrade', 'Machinery upgrade', /machine|machinery|upgrad|technology|equipment|moderni[sz]|automation|solar panel/i],
    ['scale', 'Expansion', /expan|scale|second unit|new plant|capacity|mega|large project/i],
    ['export', 'Exports', /export/i],
    ['tax', 'Tax benefits', /\btax\b|income tax|80-?iac|gst refund/i],
    ['subsidy', 'Subsidy or grant', /subsid|grant|margin money|capital assistance|free money|सब्सिडी|अनुदान/i],
    ['loan', 'Loan', /loan|credit|finance|working capital|borrow|funding|capital|लोन|ऋण|कर्ज/i]];
  var WHO = [['women', 'Woman founder', /\bwom[ae]n\b|female|\blady\b|mahila|\bwife\b|\bmother\b|\bgirl\b|महिला/i], ['sc-st', 'SC / ST', /scheduled (caste|tribe)|dalit|adivasi|tribal|अनुसूचित/i, /\b(SC|ST)\b/], ['obc', 'OBC / SEBC', /\bobc\b|sebc|backward class|पिछड़ा/i], ['minority', 'Minority community', /minority|muslim|christian|sikh|jain|buddhist|parsi|अल्पसंख्यक/i], ['ex-servicemen', 'Ex-serviceman', /ex-?service|veteran|retired (army|navy|air ?force|soldier)|ex-?army|फौजी/i], ['divyang', 'Person with disability', /disab|divyang|handicap|\bpwd\b|दिव्यांग/i]];

  // sector-specific policies only show when the described sector matches
  var SPECIAL = /electronics|semiconductor|biotech|spacetech|IT\/ITeS|GCC|textile|ATUFS|agri|PMFME|fisheries/i;
  function amountLakh(t) {
    var s = t.replace(/,/g, '').toLowerCase();
    var m = s.match(/(?:₹|rs\.?|inr|rupees?)?\s*(\d+(?:\.\d+)?)\s*(lakhs?|lacs?|lac|l\b|crores?|cr\b|k\b|thousand|लाख|करोड़|करोड)/);
    if (m) { var n = +m[1], u = m[2]; if (/^cr|करो/.test(u)) return n * 100; if (/^k|thousand/.test(u)) return n / 100; return n; }
    m = s.match(/(?:₹|rs\.?|inr)\s*(\d{4,})/); if (m) return +m[1] / 100000;
    return 0;
  }
  function fmtL(l) { return l >= 100 ? '₹' + (+(l / 100).toFixed(2)) + ' crore' : l >= 1 ? '₹' + (+l.toFixed(1)) + ' lakh' : '₹' + Math.round(l * 100) + 'k'; }
  function parse(t) {
    var r = { text: t, amount: amountLakh(t), state: '', stateName: '', sector: '', sectorL: '', need: '', needL: '', stage: '', stageL: '', who: [], whoL: [] };
    Object.keys(LIVE).forEach(function (k) { if (!r.state && (LIVE[k].re.test(t) || (LIVE[k].cs && LIVE[k].cs.test(t)))) { r.state = k; r.stateName = LIVE[k].name; } });
    if (!r.state) OTHER.forEach(function (o) { if (!r.stateName && o[1].test(t)) r.stateName = o[0]; });
    SECTOR.some(function (x) { if (x[2].test(t)) { r.sector = x[0]; r.sectorL = x[1]; return true; } });
    NEED.some(function (x) { if (x[2].test(t)) { r.need = x[0]; r.needL = x[1]; return true; } });
    var yrs = t.match(/(\d+)\s*(?:-|\s)?\s*(?:years?|yrs?)\s*(?:old|running|in business|since)?/i);
    var age = t.match(/(?:i'?m|i am|aged?|age)[^\d₹]{0,15}(\d{2})\b(?!\s*(?:lakhs?|lacs?|l\b|crores?|cr\b|k\b|-?\s*years?|-?\s*yrs?|%))|(\d{2})\s*(?:years? old|yrs? old|y\/o|साल)/i);
    if (yrs && /old|running|business|since|existing|my (factory|unit|shop|company)/i.test(t) && !(age && (age[1] || age[2]) === yrs[1])) {
      var y = +yrs[1]; r.stage = y < 2 ? 'new' : y <= 5 ? 'growing' : 'established';
    } else if (/start|starting|open|set ?up|launch|planning|new business|idea|शुरू/i.test(t)) r.stage = 'idea';
    else if (/expand|existing|running|grow/i.test(t)) r.stage = 'growing';
    r.stageL = { idea: 'Starting up', new: 'New business', growing: 'Growing business', established: 'Established business' }[r.stage] || '';
    WHO.forEach(function (w) { if (w[2].test(t) || (w[3] && w[3].test(t))) { r.who.push(w[0]); r.whoL.push(w[1]); } });
    var a = age && +(age[1] || age[2]); if (a && a >= 18 && a <= 40) { r.who.push('youth'); r.whoL.push('Aged ' + a); }
    if (/student|college|young|youth|graduate/i.test(t) && r.who.indexOf('youth') < 0) { r.who.push('youth'); r.whoL.push('Young founder'); }
    if (r.sector === 'startup' && !r.need) { r.need = 'startup'; r.needL = 'Startup funding'; }
    return r;
  }
  function rank(p) {
    var list = [];
    data.forEach(function (s) {
      if (s.scope !== 'central' && s.scope !== p.state) return;
      var restricted = s.who.indexOf('all') === -1;
      if (restricted && !s.who.some(function (w) { return p.who.indexOf(w) > -1; })) return;
      if (s.who.indexOf('general') > -1 && p.who.some(function (w) { return w === 'sc-st' || w === 'obc'; })) return;
      if (p.amount && s.minLakh && p.amount < s.minLakh) return;
      var partial = false;
      if (p.amount && s.maxLakh && p.amount > s.maxLakh * 1.05) { if ((s.cat === 'Credit' || s.cat === 'Subsidy') && s.maxLakh >= p.amount / 3) partial = true; else return; }
      var spec = SPECIAL.test(s.name);
      if (p.sector && spec && s.sector.indexOf(p.sector) === -1) return;
      if (s.need[0] === 'startup' && p.sector !== 'startup' && p.need !== 'startup') return;
      var sc = { S: 3, A: 2, B: 1 }[s.tier] || 0, why = [];
      if (s.scope !== 'central') { sc += 1.5; why.push(p.stateName + ' scheme'); }
      if (p.need) { if (s.need.indexOf(p.need) > -1) { sc += 4; why.push(p.needL); } else if (!(p.need === 'startup' && s.need.indexOf('loan') > -1)) sc -= 3; }
      if (p.sector) { if (s.sector.indexOf(p.sector) > -1) { sc += 3; why.push(p.sectorL); } else if (p.sector === 'textile' && s.sector.indexOf('mfg') > -1) sc += 1; else sc -= 4; }
      if (p.stage) { if (s.stage.indexOf(p.stage) > -1) { sc += 2; why.push(p.stageL); } else if (p.stage === 'idea' && s.stage.indexOf('new') > -1) sc += 1; else sc -= 3; }
      if (restricted) { sc += 3; why.push(p.whoL[p.who.indexOf(s.who.filter(function (w) { return p.who.indexOf(w) > -1; })[0])] || 'Your category'); }
      if (p.amount && s.maxLakh) { if (partial) { sc -= 1; why.push('Up to ' + fmtL(s.maxLakh) + ' of it'); } else why.push('Covers ' + fmtL(p.amount)); }
      if (sc > 1) list.push({ s: s, sc: sc, why: why.slice(0, 3) });
    });
    list.sort(function (a, b) { return b.sc - a.sc; });
    var top = list.length ? list[0].sc : 0;
    return list.filter(function (x) { return x.sc >= top * 0.4; }).slice(0, 6);
  }
  function chips(p) {
    var u = function (v, l) { return v ? '<span class="u">' + esc(v) + '</span>' : '<span class="u miss">' + l + '?</span>'; };
    return '<div class="ask-und"><span class="u-l">Understood:</span>' + u(p.amount ? fmtL(p.amount) : '', 'Amount') + u(p.stateName, 'State') + u(p.sectorL, 'Sector') + u(p.stageL, 'Stage') + (p.needL ? u(p.needL) : '') + p.whoL.map(function (w) { return u(w); }).join('') + '</div>';
  }
  var STATE_LABEL = { gujarat: 'Gujarat', up: 'Uttar Pradesh', maharashtra: 'Maharashtra' };
  function render(p) {
    var r = rank(p);
    var qs = new URLSearchParams(); if (p.state) qs.set('state', STATE_LABEL[p.state]); else if (p.stateName) qs.set('state', 'Other state / UT');
    if (p.need) qs.set('need', p.need); if (p.stage) qs.set('stage', p.stage);
    var note = !p.state && p.stateName ? '<p class="ask-empty">We cover state schemes for Gujarat, Uttar Pradesh and Maharashtra so far — showing central schemes that work in ' + esc(p.stateName) + '.</p>' : (!p.stateName ? '<p class="ask-empty">Add your state to see state subsidies too — they are often the biggest.</p>' : '');
    var cards = r.map(function (x) {
      var st = x.s.scope === 'central' ? 'Central' : STATE_LABEL[x.s.scope];
      return '<a class="ask-r" href="' + x.s.url + '"><span class="r-k">' + esc(x.s.cat) + ' · ' + esc(st) + '</span><b>' + esc(x.s.name) + '</b><span class="r-q">' + esc(x.s.quantum) + '</span><span class="r-why">' + x.why.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('') + '</span></a>';
    }).join('');
    out.innerHTML = '<div class="ask-card">' + chips(p) +
      '<div class="ask-head"><h2>' + (r.length ? r.length + (r.length === 1 ? ' scheme fits' : ' schemes fit') + ' what you described' : 'No exact match yet') + '</h2><a href="/get-funding' + (qs.toString() ? '?' + qs : '') + '">Refine in the Funding Matcher</a></div>' + note +
      (r.length ? '<div class="ask-grid">' + cards + '</div>' : '<p class="ask-empty">Try adding the amount, your state and what the business does — or ask our advisory desk below.</p>') +
      '<form class="ask-lead" novalidate><h3>Get a free funding plan for these schemes</h3><p class="s">An advisor checks your eligibility and calls you within one business day.</p>' +
      '<input class="field" name="name" placeholder="Your name" autocomplete="name" aria-label="Your name" required><input class="field" name="phone" type="tel" placeholder="Mobile / WhatsApp" autocomplete="tel" aria-label="Mobile number" required><input class="field" name="email" type="email" placeholder="Email (optional)" autocomplete="email" aria-label="Email"><button class="btn btn-primary" type="submit">Request my plan</button>' +
      '<input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><label class="consent"><input type="checkbox" name="consent" value="yes" required> I agree to be contacted about this enquiry and accept the <a href="/privacy">Privacy Policy</a>.</label><div class="form-msg" role="status" aria-live="polite"></div></form></div>';
    out.hidden = false;
    var lf = out.querySelector('.ask-lead');
    lf.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (n) { var el = lf.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      var msg = lf.querySelector('.form-msg'), btn = lf.querySelector('button');
      if (!g('name')) { msg.textContent = 'Please enter your name.'; return; }
      if (!window.BL || !BL.phoneOk(g('phone'))) { msg.textContent = 'Please enter a valid 10-digit Indian mobile number.'; return; }
      if (!lf.querySelector('[name="consent"]').checked) { msg.textContent = 'Please tick the consent box so we can contact you.'; return; }
      btn.disabled = true; btn.textContent = 'Sending…';
      BL.send({ name: g('name'), phone: g('phone'), email: g('email'), _honey: g('_honey'), consent: 'yes', scheme: 'Describe-your-business box', description: p.text, state: STATE_LABEL[p.state] || p.stateName, amount: p.amount ? fmtL(p.amount) : '', sector: p.sectorL, stage: p.stageL, need: p.needL, category: p.whoL.join(', ') || 'general', matched_count: String(r.length), matched_schemes: r.map(function (x) { return x.s.name; }).join(', ') }, 'funding').then(function (res) {
        if (res.ok) lf.innerHTML = '<div class="thanks" style="grid-column:1/-1;padding:6px 0"><p class="t-h">Thank you, ' + esc(g('name')) + ' — your plan request is in.</p><p>Our advisory desk will call <b>' + esc(g('phone')) + '</b> within one business day.</p></div>';
        else { btn.disabled = false; btn.textContent = 'Try again'; msg.textContent = 'We could not send your request (connection problem). Your details are saved and will retry automatically.'; }
      });
    });
    if (window.BL && BL.track) BL.track('ask_box', { matches: r.length, state: p.stateName || 'none' });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = ta.value.trim();
    if (t.length < 4) { ta.focus(); ta.setAttribute('placeholder', 'Tell us what you need — e.g. “₹5 lakh loan for a salon in Ahmedabad”'); return; }
    render(parse(t));
    out.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit')); } });
  [].forEach.call(document.querySelectorAll('.ask-ex button'), function (b) {
    b.addEventListener('click', function () { ta.value = b.textContent; form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit')); });
  });
  BL_ASK = { parse: parse, rank: rank };
})();
var BL_ASK;

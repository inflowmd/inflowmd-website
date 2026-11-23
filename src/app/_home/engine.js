/* eslint-disable */
// Runs the homepage's animations (ported as-is from the approved concept).
// Every timer, frame loop, observer and window listener is tracked so the
// returned cleanup stops it all when the page unmounts.
export function startHome() {
  const W = window;
  let dead = false;
  const timers = new Set(), obs = [], listeners = [];
  const setTimeout = (f, ms) => { const id = W.setTimeout(() => { timers.delete(id); if (!dead) f(); }, ms); timers.add(id); return id; };
  const clearTimeout = id => { timers.delete(id); W.clearTimeout(id); };
  const requestAnimationFrame = f => (dead ? 0 : W.requestAnimationFrame(f));
  const cancelAnimationFrame = id => W.cancelAnimationFrame(id);
  const IntersectionObserver = class extends W.IntersectionObserver { constructor(cb, o) { super(cb, o); obs.push(this); } };
  const ResizeObserver = W.ResizeObserver ? class extends W.ResizeObserver { constructor(cb) { super(cb); obs.push(this); } } : undefined;
  const addEventListener = (t, f, o) => { W.addEventListener(t, f, o); listeners.push([t, f, o]); };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* hero load sequence */
  const stage = $('#heroStage');
  if (!reduce && stage){
    stage.classList.add('boot');
    setTimeout(() => stage.classList.remove('boot'), 650);
  }

  /* nav hairline */
  const nav = $('#nav');
  const onNav = () => { if (nav) nav.classList.toggle('scrolled', scrollY > 8); };

  /* play loops only while visible */
  const io = new IntersectionObserver(es => es.forEach(e => {
    e.target.classList.toggle('play', e.isIntersecting && !reduce);
    if (e.isIntersecting && e.target.id === 'report') e.target.classList.remove('pre');
  }), {threshold:.25});
  $$('.io').forEach(el => io.observe(el));

  /* "It's fast" (v12): two bars race, loops while visible */
  (function(){
    const tile = $('#raceTile'); if (!tile) return;
    const rows = $$('.rl', tile).map(el => ({el, done: +el.dataset.done, t: $('.rl-t', el), b: $('.rl-track b', el)}));
    const END = Math.max(...rows.map(r => r.done)) + 3;
    function paint(t){
      rows.forEach(r => {
        const x = Math.min(1, t / r.done);
        r.t.textContent = (Math.min(t, r.done)).toFixed(1) + 's';
        r.b.style.setProperty('--pg', x.toFixed(3));
        r.el.classList.toggle('done', t >= r.done);
      });
    }
    if (reduce) { paint(99); return; }
    let t0 = 0, raf = 0, running = false;
    function frame(now){
      if (!t0) t0 = now;
      let t = (now - t0) / 1000;
      if (t > END) { t0 = now; t = 0; }
      paint(t); raf = requestAnimationFrame(frame);
    }
    paint(0);
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !running) { running = true; t0 = 0; raf = requestAnimationFrame(frame); }
      else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); paint(0); }
    }), {threshold:.35}).observe(tile);
  })();
  /* v22 services: cards rise in once */
  (function(){
    const sec = $('#services'), cards = $$('.sx-card');
    if (!sec || !cards.length || reduce || !('IntersectionObserver' in window)) return;
    sec.classList.add('sx-js');
    const ob = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ob.unobserve(e.target); } }), {threshold: .1});
    cards.forEach(c => ob.observe(c));
  })();
  /* v22 audit: the two cards slide in side by side, scores count up */
  (function(){
    const box = $('#vsx'); if (!box) return;
    const nums = $$('[data-n]', box);
    if (reduce || !('IntersectionObserver' in window)) { box.classList.remove('pre'); return; }
    nums.forEach(n => { n.textContent = '0'; });
    const ob = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      ob.disconnect();
      box.classList.remove('pre');
      const t0 = performance.now();
      nums.forEach(n => {
        const to = +n.dataset.n, delay = n.closest('.new') ? 650 : 50;
        const step = now => {
          const t = Math.min(1, Math.max(0, (now - t0 - delay) / 1400));
          n.textContent = Math.round(to * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }), {threshold: .15});
    ob.observe(box);
  })();

  /* vein check scroll story */
  const story = $('#story'), sstage = $('#storyStage'), panels = $('#panels');
  const caps = $$('.cap'), tabs = $$('.steps button'), rls = $$('[data-rl]');
  const rails = [0,1,2,3].map(i => $('#r' + i));
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  // each value: [start, end] in overall progress
  const keys = {
    spider:[.03,.09], vari:[.09,.15], swell:[.15,.21],
    heavy:[.28,.34], ache:[.34,.40], cramp:[.40,.46],
    fam:[.53,.59], stand:[.59,.65]
  };
  let lastStep = -1;
  function storyUpdate(){
    const r = story.getBoundingClientRect();
    const total = story.offsetHeight - sstage.offsetHeight;
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
    const step = Math.min(3, Math.floor(p * 4 + 1e-6));
    const vals = {};
    for (const k in keys){ vals[k] = ss(keys[k][0], keys[k][1], p); sstage.style.setProperty('--' + k + '-p', vals[k].toFixed(3)); }
    $$('[data-opt]', sstage).forEach(o => o.classList.toggle('on', (vals[o.dataset.opt] || 0) > .5));
    $$('[data-tag]', sstage).forEach(t => {
      const k = t.dataset.tag, show = (vals[k] || 0) > .5;
      const group = ['spider','vari','swell'].includes(k) ? 0 : 1;
      const vis = step === 3 ? show : step === group ? show : false;
      t.classList.toggle('on', vis);
    });
    rails.forEach((el, i) => el.style.setProperty('--f', Math.min(1, Math.max(0, p * 4 - i)).toFixed(3)));
    if (step !== lastStep){
      lastStep = step;
      panels.style.transform = 'translateX(' + (-25 * step) + '%)';
      caps.forEach((c, i) => c.classList.toggle('on', i === step));
      tabs.forEach((t, i) => { t.classList.toggle('on', i === step); t.setAttribute('aria-selected', i === step); });
      rls.forEach((t, i) => t.classList.toggle('on', i === step));
      $('#stepCount').textContent = (step + 1) + ' of 4';
      sstage.classList.toggle('hist', step === 2);
    }
    story.classList.toggle('live', r.top < innerHeight && r.bottom > 0 && !reduce);
  }
  tabs.forEach(t => t.addEventListener('click', () => {
    const i = +t.dataset.go;
    const total = story.offsetHeight - sstage.offsetHeight;
    const y = story.getBoundingClientRect().top + scrollY + total * (i / 4 + .22);
    scrollTo({top: y, behavior: reduce ? 'auto' : 'smooth'});
  }));

  /* specialty showcases (v9): vein = app flow that plays on scroll; aesthetics = one big page that scrolls */
  const shows = $$('[data-show]').map(el => {
    const app = $('.hc-app', el);
    return {el, app, scr: $('.hc-scr', el), view: $('.aes-view', el), shot: $('.aes-shot', el),
      screens: app ? $$('.hc-s', app) : [], rail: app ? $$('.hc-rail i', app) : [], steps: $$('.hc-steps li', el),
      count: app ? $('.hc-count em', app) : null, tap: app ? $('.hc-tap', app) : null, k: 1, key: ''};
  });
  function fitShows(){
    shows.forEach(s => { if (s.app) { s.k = s.scr.clientWidth / 390; s.app.style.transform = 'scale(' + s.k + ')'; } showSet(s, s.p || 0, true); });
  }
  function moveTap(s, target){
    if (!target) { s.tap.classList.remove('show'); s.tapT = null; return; }
    if (s.tapT === target) return;
    s.tapT = target;
    const a = s.app.getBoundingClientRect(), r = target.getBoundingClientRect();
    s.tap.style.left = ((r.right - a.left) / s.k - 48) + 'px';
    s.tap.style.top = ((r.top + r.height / 2 - a.top) / s.k) + 'px';
    s.tap.classList.add('show'); s.tap.classList.remove('hit'); void s.tap.offsetWidth; s.tap.classList.add('hit');
  }
  function veinSet(s, p){
    /* 5 screens across p .12 to .9: intro, signs, symptoms, history, result */
    const t = reduce ? .999 : Math.max(0, Math.min(.999, (p - .12) / .78));
    const pos = t * 5, step = Math.floor(pos), sub = pos - step;
    let target = null;
    s.screens.forEach((sc, i) => {
      sc.classList.toggle('cur', i === step); sc.classList.toggle('past', i < step);
      const opts = $$('.hc-opt:not(.off)', sc);
      opts.forEach((o, k) => {
        const on = i < step || (i === step && sub > .16 + k * .2);
        if (on && !o.classList.contains('on') && i === step) target = o;
        o.classList.toggle('on', on);
      });
      const ready = i === 0 || i < step || (i === step && sub > .16 + opts.length * .2);
      sc.classList.toggle('ready', ready);
      const press = i === step && i < 4 && sub > .88;
      sc.classList.toggle('press', press);
      if (press) target = $('.hc-btn', sc);
    });
    if (!target && step > 0 && step < 4) {
      const ons = $$('.hc-opt.on', s.screens[step]);
      target = sub > .88 ? $('.hc-btn', s.screens[step]) : (ons[ons.length - 1] || null);
    }
    if (step === 0 && sub > .75) target = $('.hc-btn', s.screens[0]);
    if (!reduce) moveTap(s, target); else moveTap(s, null);
    s.app.dataset.step = step;
    if (p > .06) s.app.classList.add('lit');
    s.rail.forEach((r, i) => r.classList.toggle('done', i < step || (i === step - 1)));
    if (s.count) s.count.textContent = Math.max(1, Math.min(4, step));
    s.steps.forEach((li, i) => { li.classList.toggle('cur', i + 1 === step); li.classList.toggle('done', i + 1 < step); });
  }
  function showSet(s, p, force){
    s.p = p;
    s.el.style.setProperty('--p', p.toFixed(4));
    if (p > .06) s.el.classList.add('on');
    if (s.app) { veinSet(s, p); return; }
    if (s.shot) {
      const t = reduce ? 0 : Math.max(0, Math.min(1, (p - .22) / .7));
      const ease = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const maxD = Math.max(0, s.shot.offsetHeight - s.view.clientHeight);
      s.shot.style.transform = 'translateY(' + (-maxD * ease).toFixed(1) + 'px)';
    }
  }
  function showUpdate(){
    const vh = innerHeight;
    shows.forEach(s => {
      if (reduce) { if (s.p !== 1) showSet(s, 1); return; }
      const r = s.el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      const total = r.height - vh;
      const p = Math.max(0, Math.min(1, (vh * .6 - r.top) / (total + vh * .6)));
      showSet(s, p);
    });
  }
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(fitShows); shows.forEach(s => ro.observe(s.scr || s.view)); }
  shows.forEach(s => { if (s.shot && !s.shot.complete) s.shot.addEventListener('load', () => showSet(s, s.p || 0)); });
  fitShows(); showUpdate();
  /* v17: area-of-concern picker on the iAesthetic photo (example content) */
  (function(){
    const app = $('#pkApp'); if (!app) return;
    const stage = $('.pk-stage', app), cam = $('.pk-cam', app), box = $('.pk-pts', app), tap = $('.pk-tap', app);
    const card = $('.pk-card', app), cT = $('.pk-t', card), cD = $('.pk-d', card), cTx = $('.pk-tx', card);
    const chips = {face: $('.pk-chips[data-for="face"]', app), body: $('.pk-chips[data-for="body"]', app)};
    const tog = $$('.pk-tog button', app);
    /* dot positions are the iAesthetic build's, as % of the full photo; our photo is cropped to x 22.03% to 79.99% */
    const X = x => ((x - 22.03) / 57.96 * 100).toFixed(2) + '%';
    const AR = 1445 / 1662;
    const VIEW = {body: {z: 1, cx: .5, cy: .5}, face: {z: 2.5, cx: .49, cy: .2}};
    const A = {
      face: [
        {k:'forehead', n:'Forehead', x:49.77, y:14.99, d:'Lines from frowning and raising your brows.', t:['Wrinkle relaxers','Skin resurfacing']},
        {k:'eyes', n:'Eyes', x:52.83, y:19.24, d:"Crow's feet, hollows and tired-looking eyes.", t:['Wrinkle relaxers','Under-eye filler']},
        {k:'midface', n:'Nose & Mid-Face', x:49.6, y:22.09, d:'Lost volume and texture through the center of the face.', t:['Dermal filler','Chemical peel']},
        {k:'cheeks', n:'Cheeks', x:46.83, y:22.74, d:'Lost volume, sun spots and redness.', t:['Cheek filler','IPL photofacial']},
        {k:'lips', n:'Lips', x:49.73, y:25.49, d:'Fullness, shape and fine lines around the mouth.', t:['Lip filler','Lip hydration']},
        {k:'jaw', n:'Jaw & Chin', x:49.73, y:28.49, d:'Definition along the jawline and chin.', t:['Jawline filler','Fat reduction']},
        {k:'neck', n:'Neck & Décolleté', x:51.5, y:31.98, d:'Crepey skin, lines and sun damage.', t:['RF skin tightening','Microneedling']}
      ],
      body: [
        {k:'arms', n:'Arms', x:34.53, y:23.19, d:'Loose skin and stubborn fat on the upper arms.', t:['Body contouring','Skin tightening']},
        {k:'underarms', n:'Underarms', x:60.5, y:31.98, d:'Sweating and unwanted hair.', t:['Sweat reduction','Laser hair removal']},
        {k:'abdomen', n:'Abdomen', x:52.67, y:59.97, d:'Stubborn fat and loose skin.', t:['Fat reduction','Skin tightening']},
        {k:'flanks', n:'Waist & Flanks', x:45.2, y:59.97, d:"Love handles that won't budge with diet and exercise.", t:['Fat reduction','Body contouring']},
        {k:'hips', n:'Hips & Glutes', x:41.87, y:75.81, d:'Shape, lift and smoother-looking skin.', t:['Body contouring','Cellulite treatment']},
        {k:'thighs', n:'Thighs & Legs', x:45.07, y:90, d:'Cellulite, spider veins and unwanted hair.', t:['Spider vein treatment','Cellulite treatment']}
      ]
    };
    const arrow = '<svg aria-hidden="true"><use href="#i-arrow"/></svg>';
    let view = 'body', user = false, timer = null, si = 0;
    function mk(cls, a, label){
      const b = document.createElement('button');
      b.type = 'button'; b.className = cls; b.setAttribute('aria-label', label);
      b.style.left = X(a.x); b.style.top = a.y + '%';
      box.appendChild(b); return b;
    }
    Object.keys(A).forEach(v => A[v].forEach((a, i) => {
      a.v = v; a.pt = mk('pk-pt', a, a.n); a.pt.style.setProperty('--d', (i * .45) + 's');
      const c = document.createElement('button');
      c.type = 'button'; c.className = 'pk-chip'; c.textContent = a.n; c.setAttribute('aria-pressed', 'false');
      chips[v].appendChild(c); a.chip = c;
      [a.pt, c].forEach(el => el.addEventListener('click', () => { stopAuto(); pick(v, a); }));
    }));
    const zoomPt = mk('pk-pt pk-zoom', {x:49.83, y:23.49}, 'Zoom in to the face');
    zoomPt.addEventListener('click', () => { stopAuto(); pick('face', A.face[0]); });
    function place(instant){
      const W = stage.clientWidth, H = stage.clientHeight; if (!W || !H) return;
      const cw = H * AR, ch = H, v = VIEW[view], s = v.z;
      let tx = W / 2 - v.cx * cw * s, ty = H / 2 - v.cy * ch * s;
      ty = Math.min(0, Math.max(H - ch * s, ty));
      tx = cw * s > W ? Math.min(0, Math.max(W - cw * s, tx)) : (W - cw * s) / 2;
      if (instant) cam.style.transition = 'none';
      cam.style.width = cw + 'px'; cam.style.height = ch + 'px';
      cam.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + s + ')';
      cam.style.setProperty('--iz', (1 / s).toFixed(4));
      if (instant) { void cam.offsetWidth; cam.style.transition = ''; }
    }
    function setView(v, instant){
      view = v;
      tog.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
      Object.keys(A).forEach(k => { chips[k].hidden = k !== v; A[k].forEach(a => { a.pt.classList.toggle('off', k !== v); a.pt.tabIndex = k === v ? 0 : -1; }); });
      zoomPt.classList.toggle('off', v !== 'body'); zoomPt.tabIndex = v === 'body' ? 0 : -1;
      stage.dataset.view = v;
      place(instant || reduce);
    }
    function pick(v, a){
      if (view !== v) setView(v);
      A[v].forEach(x => { x.pt.classList.toggle('on', x === a); x.chip.setAttribute('aria-pressed', String(x === a)); });
      cT.textContent = a.n; cD.textContent = a.d;
      cTx.innerHTML = a.t.map(t => '<li><span>' + t + '</span>' + arrow + '</li>').join('');
      card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
    }
    tog.forEach(b => b.addEventListener('click', () => { stopAuto(); pick(b.dataset.v, A[b.dataset.v][0]); }));
    function moveTap(a){
      tap.style.left = a.pt.style.left; tap.style.top = a.pt.style.top;
      tap.classList.add('show'); tap.classList.remove('hit'); void tap.offsetWidth; tap.classList.add('hit');
    }
    const seq = [['face','forehead'],['face','eyes'],['face','cheeks'],['face','lips'],['face','neck'],['body','abdomen'],['body','flanks'],['body','thighs']];
    function step(){
      const [v, k] = seq[si++ % seq.length], a = A[v].find(x => x.k === k);
      const go = () => { moveTap(a); timer = setTimeout(() => { pick(v, a); timer = setTimeout(step, 2300); }, 650); };
      if (view !== v) { tap.classList.remove('show'); setView(v); timer = setTimeout(go, 1150); } else go();
    }
    function startAuto(){ if (user || reduce || timer) return; timer = setTimeout(step, 900); }
    function pauseAuto(){ clearTimeout(timer); timer = null; }
    function stopAuto(){ if (user) return; user = true; pauseAuto(); tap.classList.remove('show'); card.setAttribute('aria-live', 'polite'); }
    setView('body', true); pick('body', A.body[2]);
    if ('ResizeObserver' in window) new ResizeObserver(() => place(true)).observe(stage);
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? startAuto() : pauseAuto()), {threshold: .4}).observe(app);
  })();
  /* v10 hero: neural network canvas + AI answer demo loop */
  (function(){
    const cv = $('#ahNet'), demo = $('#ahDemo');
    if (!cv || !demo) return;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, pts = [], mx = -999, my = -999, raf = 0, vis = true;
    function size(){
      const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, W * H / 11000));
      pts = Array.from({length: n}, () => ({x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28, r: Math.random() * 1.4 + .6, g: Math.random() < .14}));
    }
    function draw(){
      ctx.clearRect(0, 0, W, H);
      const L = 140;
      for (let i = 0; i < pts.length; i++){
        const a = pts[i];
        if (!reduce){ a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1; }
        for (let j = i + 1; j < pts.length; j++){
          const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
          if (d < L){ ctx.strokeStyle = 'rgba(120,165,255,' + (.16 * (1 - d / L)).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        const md = Math.hypot(a.x - mx, a.y - my);
        if (md < 180){ ctx.strokeStyle = 'rgba(160,200,255,' + (.35 * (1 - md / 180)).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke(); }
        ctx.fillStyle = a.g ? 'rgba(150,210,90,.9)' : 'rgba(190,215,255,.75)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
      }
      if (!reduce && vis) raf = requestAnimationFrame(draw);
    }
    const box = cv.parentElement;
    box.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    box.addEventListener('pointerleave', () => { mx = my = -999; });
    size(); draw();
    addEventListener('resize', () => { size(); if (reduce) draw(); });
    new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; cancelAnimationFrame(raf); if (vis && !reduce) raf = requestAnimationFrame(draw); })).observe(box);

    /* the demo: question types, AI reads, answer streams, practice card lands */
    const Q = 'Who’s the best vein specialist near me that takes my insurance?';
    const A = 'Based on what their site says, <b>Your Practice</b> looks like a strong fit. Board-certified vein specialists, your insurance plan listed, and same-week visits you can book online.';
    const qEl = $('#ahQ'), aEl = $('#ahA'), reads = $$('.ah-read', demo), meter = $('#ahMeter');
    const words = A.split(/(<b>.*?<\/b>|\s+)/).filter(w => w && w.trim());
    aEl.innerHTML = words.map(w => '<span class="w">' + w + '</span>').join(' ');
    const ws = $$('.w', aEl);
    const wait = ms => new Promise(r => setTimeout(r, ms));
    let alive = true;
    function setReads(n){ reads.forEach((r, i) => r.classList.toggle('on', i < n)); if (meter) meter.style.width = (n / reads.length * 100) + '%'; }
    function show(){ demo.dataset.st = 3; qEl.textContent = Q; ws.forEach(w => w.classList.add('in')); setReads(reads.length); }
    if (reduce) { show(); return; }
    async function loop(){
      while (alive){
        demo.dataset.st = 0; qEl.textContent = ''; ws.forEach(w => w.classList.remove('in')); setReads(0);
        await wait(1400);
        for (let i = 1; i <= Q.length; i++){ qEl.textContent = Q.slice(0, i); await wait(28 + Math.random() * 30); }
        await wait(350);
        demo.dataset.st = 1;
        if (!reads.length) await wait(1500);
        for (let i = 1; i <= reads.length; i++){ await wait(380); setReads(i); }
        await wait(300);
        demo.dataset.st = 2;
        for (const w of ws){ w.classList.add('in'); await wait(55); }
        await wait(250);
        demo.dataset.st = 3;
        await wait(5200);
      }
    }
    demo.dataset.st = 0;
    loop();
  })();
  /* v10 vein showcase: the app plays on its own; steps are tappable */
  (function(){
    const el = $('[data-vein]'); if (!el) return;
    const app = $('.hc-app', el), scr = $('.hc-scr', el), screens = $$('.hc-s', app), rail = $$('.hc-rail i', app);
    const steps = $$('.hc-steps li', el), count = $('.hc-count em', app), tap = $('.hc-tap', app), playBtn = $('.hc-play', el), ctlT = $('.hc-ctl span', el);
    const DUR = [2600, 3600, 3600, 3200, 5600];
    const legs = $('.hc-legs', app), legsN = legs && $('.hl-count b', legs), legsW = legs && $('.hl-count span', legs);
    function legSync(){
      if (!legs) return;
      const on = $$('.hc-opt.on', legs.parentNode).map(o => o.dataset.sg);
      ['sp', 'vr', 'sw', 'sk'].forEach(c => legs.classList.toggle('on-' + c, on.includes(c)));
      const n = String(on.length);
      if (legsN.textContent !== n) { legsN.textContent = n; legsW.textContent = on.length === 1 ? 'sign' : 'signs'; }
    }
    let k = 1, step = 0, t0 = performance.now(), paused = false, vis = false, raf = 0, tapT = null, held = 0;
    function fit(){ k = scr.clientWidth / 390; app.style.transform = 'scale(' + k + ')'; }
    function moveTap(target){
      if (!target) { tap.classList.remove('show'); tapT = null; return; }
      if (tapT === target) return;
      tapT = target;
      const a = app.getBoundingClientRect(), r = target.getBoundingClientRect();
      tap.style.left = ((r.right - a.left) / k - 48) + 'px';
      tap.style.top = ((r.top + r.height / 2 - a.top) / k) + 'px';
      tap.classList.add('show'); tap.classList.remove('hit'); void tap.offsetWidth; tap.classList.add('hit');
    }
    function render(sub){
      let target = null;
      screens.forEach((sc, i) => {
        sc.classList.toggle('cur', i === step); sc.classList.toggle('past', i < step);
        const opts = $$('.hc-opt:not(.off)', sc);
        opts.forEach((o, j) => {
          const on = i < step || (i === step && sub > .14 + j * .2);
          if (on && !o.classList.contains('on') && i === step) target = o;
          o.classList.toggle('on', on);
        });
        sc.classList.toggle('ready', i === 0 || i < step || (i === step && sub > .14 + opts.length * .2));
        const press = i === step && i < 4 && sub > .86;
        sc.classList.toggle('press', press);
        if (press) target = $('.hc-btn', sc);
      });
      legSync();
      if (!target && step > 0 && step < 4) { const ons = $$('.hc-opt.on', screens[step]); target = ons[ons.length - 1] || null; }
      if (step === 0 && sub > .7) target = $('.hc-btn', screens[0]);
      moveTap(reduce || paused ? null : target);
      app.dataset.step = step; app.classList.add('lit');
      rail.forEach((r, i) => r.classList.toggle('done', i < step));
      count.textContent = Math.max(1, Math.min(4, step));
      steps.forEach((li, i) => { li.classList.toggle('cur', i + 1 === step); li.classList.toggle('done', i + 1 < step); li.style.setProperty('--f', i + 1 === step ? Math.min(1, sub).toFixed(3) : 0); });
    }
    function tick(now){
      raf = 0;
      if (!paused){
        let el2 = now - t0;
        if (el2 >= DUR[step]) { step = (step + 1) % 5; t0 = now; el2 = 0; }
        render(el2 / DUR[step]);
      }
      if (vis && !paused) raf = requestAnimationFrame(tick);
    }
    function go(i){ step = i; t0 = performance.now(); render(0); if (paused) render(1); start(); }
    function start(){ if (!raf && vis && !paused && !reduce) raf = requestAnimationFrame(tick); }
    function setPaused(v){
      paused = v; el.classList.toggle('hc-paused', v);
      playBtn.setAttribute('aria-label', v ? 'Play the vein check' : 'Pause the vein check');
      ctlT.textContent = v ? 'Paused. Tap a step to look around.' : 'Playing. Tap a step to jump in.';
      if (v) { held = performance.now() - t0; render(1); } else { t0 = performance.now() - Math.min(held, DUR[step] - 1); start(); }
    }
    steps.forEach((li, i) => $('button', li).addEventListener('click', () => { go(i + 1); }));
    playBtn.addEventListener('click', () => setPaused(!paused));
    new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; if (vis) { t0 = performance.now() - (held || 0); start(); } else { held = performance.now() - t0; cancelAnimationFrame(raf); raf = 0; } }), {threshold: .35}).observe(el);
    if ('ResizeObserver' in window) new ResizeObserver(() => { fit(); render(paused ? 1 : 0); }).observe(scr);
    fit();
    if (reduce) { paused = true; el.classList.add('hc-paused'); step = 4; render(1); ctlT.textContent = 'Tap a step to look around.'; }
    else render(0);
  })();

  /* two views: home and the vein check page */
  const home = $('#pageHome'), veinPage = $('#pageVein');
  let wasVein = false;
  function route(){
    const h = decodeURIComponent(location.hash.slice(1));
    const isVein = h === 'vein-check';
    home.hidden = isVein; veinPage.hidden = !isVein;
    if (isVein) scrollTo({top:0, behavior:'instant'});
    else {
      const el = h && h !== 'vein-check' ? document.getElementById(h) : null;
      if (el) requestAnimationFrame(() => el.scrollIntoView({behavior: wasVein || reduce ? 'instant' : 'smooth'}));
      else if (wasVein) scrollTo({top:0, behavior:'instant'});
    }
    wasVein = isVein; lastStep = -1;
    requestAnimationFrame(() => { onNav(); storyUpdate(); });
  }
  addEventListener('hashchange', route);
  route();

  let ticking = false;
  const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { onNav(); storyUpdate(); showUpdate(); ticking = false; }); };
  addEventListener('scroll', onScroll, {passive:true});
  addEventListener('resize', onScroll);
  onNav(); storyUpdate(); showUpdate();

  return () => {
    dead = true;
    timers.forEach(id => W.clearTimeout(id));
    obs.forEach(o => o.disconnect());
    listeners.forEach(([t, f, o]) => W.removeEventListener(t, f, o));
  };
}

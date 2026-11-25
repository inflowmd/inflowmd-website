/* eslint-disable */
// Runs the Solutions page's animations (ported from the approved concept).
// Every timer, frame, observer and window listener is tracked so the
// returned cleanup stops all of it when the page unmounts.
export function startSolutions() {
  var W = window, root = document.querySelector('.isol');
  if (!root) return function () {};
  var dead = false, timerSet = new Set(), obs = [], listeners = [], mqs = [];
  var setTimeout = function (f, ms) { var id = W.setTimeout(function () { timerSet.delete(id); if (!dead) f(); }, ms); timerSet.add(id); return id; };
  var clearTimeout = function (id) { timerSet.delete(id); W.clearTimeout(id); };
  var requestAnimationFrame = function (f) { return dead ? 0 : W.requestAnimationFrame(function (t) { if (!dead) f(t); }); };
  var IntersectionObserver = class extends W.IntersectionObserver { constructor(cb, o) { super(cb, o); obs.push(this); } };
  var ResizeObserver = W.ResizeObserver ? class extends W.ResizeObserver { constructor(cb) { super(cb); obs.push(this); } } : undefined;
  var addEventListener = function (t, f, o) { W.addEventListener(t, f, o); listeners.push([t, f, o]); };

  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');
  function $(s,r){return (r||root).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||root).querySelectorAll(s))}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  var vh=window.innerHeight;

  /* Hero entrance */
  if(!reduce){ $$('.hin').forEach(function(el){el.classList.add('pre')}); requestAnimationFrame(function(){requestAnimationFrame(function(){ $$('.hin').forEach(function(el){el.classList.remove('pre')}) })}); }

  /* Reveals below the fold */
  $$('.rv').forEach(function(el){ if(!reduce && el.getBoundingClientRect().top>vh*.9) el.classList.add('pre') });
  var rio=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){e.target.classList.remove('pre');rio.unobserve(e.target)} })},{rootMargin:'0px 0px -10% 0px'});
  $$('.rv').forEach(function(el){rio.observe(el)});

  /* Scaled sample sites */
  function fitSites(){ $$('[data-site]').forEach(function(v){ v.firstElementChild.style.setProperty('--s', v.clientWidth/1100) }) }

  /* Scene canvases scale to their box */
  var scenes=$$('.scene');
  function fitScenes(){ scenes.forEach(function(s){ var w=s.clientWidth; if(w) $('.canvas',s).style.setProperty('--k',w/520) }) }

  /* AI answer streams word by word: wrap text words once */
  $$('[data-stream]').forEach(function(p){ if(p.querySelector('.w')) return; var n=0; Array.prototype.slice.call(p.childNodes).forEach(function(node){
    if(node.nodeType===3){ var f=document.createDocumentFragment(); node.textContent.split(/(\s+)/).forEach(function(t){ if(!t) return; if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return} var sp=document.createElement('span'); sp.className='w'; sp.style.setProperty('--w',n++); sp.textContent=t; f.appendChild(sp) }); p.replaceChild(f,node) }
    else { node.classList.add('w'); node.style.setProperty('--w',n++) }
  }) });

  /* Scene playback */
  var timers=[[],[],[],[]];
  function later(i,ms,fn){ timers[i].push(setTimeout(fn,ms)) }
  function count(el,to,pre,ms){ var t0=performance.now(); (function f(t){ var k=clamp((t-t0)/ms,0,1), e=k>=1?1:1-Math.pow(2,-10*k); el.textContent=(pre||'')+Math.round(to*e); if(k<1) requestAnimationFrame(f) })(t0) }
  var states=['play','ranked','tap','open','pick','sent','leadin','lit','newrev','drawn'];
  function play(i){
    var c=$('.canvas',scenes[i]); stop(i);
    if(reduce){ c.classList.add.apply(c.classList,states); var n=$('[data-count]',c); if(n) n.textContent='213'; return; }
    requestAnimationFrame(function(){ c.classList.add('play') });
    if(i===0){ later(0,1200,function(){ var li=$$('.res li',c); li[0].style.setProperty('--i',1); li[1].style.setProperty('--i',2); li[2].style.setProperty('--i',0); c.classList.add('ranked') }) }
    if(i===1){ later(1,1300,function(){c.classList.add('tap')}); later(1,1650,function(){c.classList.remove('tap');c.classList.add('open')}); later(1,2900,function(){c.classList.add('pick')}); later(1,3900,function(){c.classList.add('sent')}); later(1,4700,function(){c.classList.add('leadin')}) }
    if(i===2){ later(2,1000,function(){c.classList.add('lit')}); later(2,2000,function(){c.classList.add('newrev'); $('[data-count]',c).textContent='213'}) }
    if(i===3){ later(3,600,function(){ c.classList.add('drawn'); $$('[data-to]',c).forEach(function(n){count(n,+n.dataset.to,n.dataset.pre,1800)}) }) }
  }
  function stop(i){ timers[i].forEach(clearTimeout); timers[i]=[] }
  function reset(i){
    stop(i); var c=$('.canvas',scenes[i]);
    states.forEach(function(s){c.classList.remove(s)});
    if(i===0){ $$('.res li',c).forEach(function(li,j){li.style.setProperty('--i',j)}) }
    if(i===2){ $('[data-count]',c).textContent='212' }
  }

  /* Desktop: sticky stage. Phone/tablet portrait: scenes sit inside each step. */
  var mq=window.matchMedia('(max-width:960px)'), vbox=$('#vbox'), steps=$$('.step'), slots=$$('.slot'), fill=$('#progFill'), story=$('#story');
  var active=-1, inline=null, played=[false,false,false,false], sio=null;
  function place(){
    var m=mq.matches; if(m===inline) return; inline=m;
    if(sio){sio.disconnect();sio=null}
    scenes.forEach(function(s,i){ (m?slots[i]:vbox).appendChild(s); reset(i); played[i]=false });
    active=-1;
    if(m){
      scenes.forEach(function(s){s.classList.add('on')});
      sio=new IntersectionObserver(function(es){es.forEach(function(e){ var i=scenes.indexOf(e.target); if(e.isIntersecting && !played[i]){played[i]=true;play(i)} })},{threshold:.45});
      scenes.forEach(function(s){sio.observe(s)});
    } else {
      scenes.forEach(function(s){s.classList.remove('on')});
    }
    fitScenes(); onScroll();
  }
  function setActive(i){
    if(i===active) return;
    var prev=active; active=i;
    steps.forEach(function(s,j){s.classList.toggle('on',j===i)});
    scenes.forEach(function(s,j){s.classList.toggle('on',j===i)});
    if(prev>=0){ var p=prev; setTimeout(function(){ if(active!==p) reset(p) },900) }
    play(i);
  }

  /* Smooth (lerped) scroll-linked values */
  var pTarget=0,pNow=0, parT=0,parNow=0, raf=null;
  var hstage=$('#hstage'), par=$$('[data-p]');
  function onScroll(){
    vh=window.innerHeight;
    if(!inline){
      var mid=vh*.5, idx=0;
      steps.forEach(function(s,j){ if(s.getBoundingClientRect().top<mid) idx=j });
      if(story.getBoundingClientRect().top<vh*.6) setActive(idx);
      var r=story.getBoundingClientRect(); pTarget=clamp((mid-r.top)/(r.height-vh*.5),0,1);
      if(r.top>vh*.6 && active===-1){ scenes[0].classList.add('on') }
    }
    var hr=hstage.getBoundingClientRect(); parT=clamp((vh-hr.top)/(vh+hr.height),0,1);
    if(!raf) raf=requestAnimationFrame(tick);
  }
  function tick(){
    raf=null;
    pNow+=(pTarget-pNow)*.12; parNow+=(parT-parNow)*.1;
    if(fill) fill.style.setProperty('--p',pNow.toFixed(4));
    if(!reduce) par.forEach(function(el){
      var y=(parNow-.5)*parseFloat(el.dataset.p)*-600;
      el.style.translate = el.classList.contains('hwin') ? ('0 '+y.toFixed(1)+'px') : ('0 '+y.toFixed(1)+'px');
    });
    if(Math.abs(pTarget-pNow)>.0005 || Math.abs(parT-parNow)>.0005) raf=requestAnimationFrame(tick);
  }

  /* Ring draws in once */
  var ring=$('#ring'); var ro=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ ring.classList.add('in'); ro.disconnect() } },{threshold:.4}); ro.observe(ring);

  /* Ring: tap a stage (or walk the loop). Each stage lights the arc it feeds into; all four close the loop. */
  var names=['Get found','Convert','Earn trust','Measure'], cur=-1, seen=[false,false,false,false], ctr=$('.rg-ctr',ring), ctrT;
  var qs=$$('.rg-q',ring), ns=$$('.rg-node',ring), ps=$$('.rp'), sts=$$('.rstep'), cols=["#5B8DEF", "#3FA0E6", "#7DBD45", "#93C84A"];
  function setCenter(sub,main){
    clearTimeout(ctrT);
    var t=ctr.querySelectorAll('text');
    if(reduce){ t[0].textContent=sub; t[1].textContent=main; return }
    ctr.classList.add('swap');
    ctrT=setTimeout(function(){ t[0].textContent=sub; t[1].textContent=main; ctr.classList.remove('swap') },380);
  }
  function go(i){
    if(i===cur) return;
    ring.classList.add('in','live');
    if(i===0 && (cur===-1 || cur===4)) seen=[false,false,false,false];
    if(i<4) seen[i]=true;
    cur=i;
    ring.classList.toggle('full',i===4);
    qs.forEach(function(q,k){ q.classList.toggle('on',k===i); q.classList.toggle('seen',seen[k]&&k!==i) });
    ns.forEach(function(n,k){ n.classList.toggle('on',k===i); n.classList.toggle('seen',seen[k]&&k!==i) });
    sts.forEach(function(n,k){ n.classList.toggle('on',k===i||i===4); n.classList.toggle('seen',seen[k]&&k!==i) });
    ring.style.setProperty('--sc', i<4 ? cols[i] : 'rgba(255,255,255,.5)');
    ps.forEach(function(p){ p.classList.toggle('on',+p.dataset.s===i) });
    if(i===4) setCenter('The result','More booked visits'); else setCenter('Stage '+(i+1)+' of 4',names[i]);
  }
  $$('[data-go]').forEach(function(b){ b.addEventListener('click',function(){ go(+b.dataset.go) }) });
  /* On a mouse or trackpad, hovering a stage moves to it (short intent delay so passing over doesn't flicker) */
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){ var ht;
    $$('[data-hv]').forEach(function(el){ el.addEventListener('mouseenter',function(){ clearTimeout(ht); ht=setTimeout(function(){ go(+el.dataset.go) },120) }); el.addEventListener('mouseleave',function(){ clearTimeout(ht) }) }); }

  function layout(){ fitSites(); place(); fitScenes(); onScroll(); }
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',layout);
  if(mq.addEventListener){ mq.addEventListener('change',layout); mqs.push([mq,layout]); }
  if(ResizeObserver){ var rz=new ResizeObserver(function(){fitSites();fitScenes()}); $$('[data-site]').forEach(function(v){rz.observe(v)}); scenes.forEach(function(s){rz.observe(s)}); rz.observe(vbox); }
  layout();
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ if(!dead){fitSites();fitScenes()} });

  return function () {
    dead = true;
    timerSet.forEach(function (id) { W.clearTimeout(id); });
    obs.forEach(function (o) { o.disconnect(); });
    listeners.forEach(function (l) { W.removeEventListener(l[0], l[1], l[2]); });
    mqs.forEach(function (m) { m[0].removeEventListener('change', m[1]); });
  };
}

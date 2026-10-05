/* ── PERFORMANCE-ADAPTIVE INTERACTIVE CANVAS FIELD ── */
(function(){
  const canvas=document.getElementById('pc'),hero=document.querySelector('.hero-section');
  if(!canvas||!hero||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let ctx;try{ctx=canvas.getContext('2d',{alpha:true,desynchronized:true})||canvas.getContext('2d')}catch(e){ctx=canvas.getContext('2d')}if(!ctx)return;
  const mobile=innerWidth<700,coarse=matchMedia('(pointer:coarse)').matches,saveData=navigator.connection?.saveData===true,lowPower=(navigator.hardwareConcurrency||4)<=2;
  const baseQuality=saveData||lowPower?.48:mobile?.62:1,targetFps=lowPower?30:mobile?45:60,minFrame=1000/targetFps;
  const pointer={x:-9999,y:-9999,active:false,down:false,radius:mobile?105:170};const trail=[];const grid=new Map();
  const teal=[0,212,184],blue=[56,189,248];let W=0,H=0,dpr=1,particles=[],raf=0,running=false,last=0,time=0,slowFrames=0,quality=baseQuality,glow=!mobile&&!lowPower&&!saveData;
  function resize(){const r=hero.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,mobile?1.15:1.35);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
  function makeParticle(){const z=Math.random()*.8+.2;return{x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*(.18+z*.38),vy:(Math.random()-.5)*(.18+z*.38),z,r:Math.random()*(1.25+z*1.7)+.35,phase:Math.random()*Math.PI*2,twinkle:.5+Math.random()*.8}}
  function reset(){resize();const target=Math.round(Math.min(mobile?42:72,Math.max(mobile?16:24,(W*H/18500)*quality)));particles=Array.from({length:target},makeParticle);trail.length=0;quality=baseQuality;glow=!mobile&&!lowPower&&!saveData}
  function rgba(c,a){return `rgba(${c[0]},${c[1]},${c[2]},${a})`}
  function pointerMove(e){const r=hero.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;pointer.active=true;trail.push({x:pointer.x,y:pointer.y,life:1});if(trail.length>12)trail.shift()}
  hero.addEventListener('pointermove',pointerMove,{passive:true});hero.addEventListener('pointerenter',()=>pointer.active=true,{passive:true});hero.addEventListener('pointerleave',()=>{pointer.active=false;pointer.down=false},{passive:true});hero.addEventListener('pointerdown',e=>{pointer.down=true;pointerMove(e)},{passive:true});hero.addEventListener('pointerup',()=>pointer.down=false,{passive:true});
  function update(dt){const influence=pointer.down?1.35:1;particles.forEach(p=>{const dx=p.x-pointer.x,dy=p.y-pointer.y,d=Math.sqrt(dx*dx+dy*dy)||1;if(pointer.active&&d<pointer.radius){const force=(1-d/pointer.radius)*.018*influence;p.vx+=(dx/d)*force;p.vy+=(dy/d)*force}p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.vx*=.999;p.vy*=.999;if(p.x<-20)p.x=W+20;if(p.x>W+20)p.x=-20;if(p.y<-20)p.y=H+20;if(p.y>H+20)p.y=-20});trail.forEach(t=>t.life-=dt*3);while(trail[0]?.life<=0)trail.shift()}
  function cell(x,y){return `${Math.floor(x/108)}:${Math.floor(y/108)}`}
  function buildGrid(){grid.clear();particles.forEach((p,i)=>{const k=cell(p.x,p.y);let b=grid.get(k);if(!b)grid.set(k,b=[]);b.push(i)})}
  function drawLinks(){const seen=new Set();particles.forEach((a,i)=>{const cx=Math.floor(a.x/108),cy=Math.floor(a.y/108);for(let gx=cx-1;gx<=cx+1;gx++)for(let gy=cy-1;gy<=cy+1;gy++){const bucket=grid.get(`${gx}:${gy}`);if(!bucket)continue;bucket.forEach(j=>{if(j<=i)return;const key=i<j?`${i}:${j}`:`${j}:${i}`;if(seen.has(key))return;seen.add(key);const b=particles[j],dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy;if(d2<11500){const d=Math.sqrt(d2);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=rgba(teal,(1-d/108)*.11*(a.z+b.z)/2);ctx.lineWidth=.5;ctx.stroke()}})}})}
  function drawBackground(){if(!glow)return;const g=ctx.createRadialGradient(W*.72,H*.28,0,W*.72,H*.28,Math.max(W,H)*.7);g.addColorStop(0,'rgba(0,212,184,.07)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);if(pointer.active){ctx.beginPath();ctx.arc(pointer.x,pointer.y,28+Math.sin(time*2)*3,0,Math.PI*2);ctx.strokeStyle=rgba(teal,.1);ctx.lineWidth=1;ctx.stroke()}}
  function draw(){if(!running)return;const now=performance.now();if(now-last<minFrame){raf=requestAnimationFrame(draw);return}const dt=Math.min(.04,(now-last||16)/1000);last=now;time+=dt;if(dt>.028){slowFrames++;if(slowFrames===8){glow=false;if(particles.length>24)particles.length=Math.max(24,Math.floor(particles.length*.72));slowFrames=0}}else if(slowFrames>0)slowFrames--;ctx.clearRect(0,0,W,H);drawBackground();update(dt);buildGrid();drawLinks();particles.forEach(p=>{const tw=.58+Math.sin(time*p.twinkle+p.phase)*.18;ctx.fillStyle=rgba(p.z>.62?teal:blue,.55*tw);ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();if(glow){ctx.fillStyle=rgba(teal,.09*tw);ctx.beginPath();ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2);ctx.fill()}});if(trail.length>1){ctx.beginPath();trail.forEach((t,i)=>i?ctx.lineTo(t.x,t.y):ctx.moveTo(t.x,t.y));ctx.strokeStyle=rgba(teal,.14);ctx.lineWidth=1;ctx.stroke()}raf=requestAnimationFrame(draw)}
  function start(){if(running||document.hidden)return;running=true;if(!particles.length)reset();last=performance.now();raf=requestAnimationFrame(draw)}function stop(){running=false;cancelAnimationFrame(raf);ctx.clearRect(0,0,W,H)}
  const observer=new IntersectionObserver(([e])=>e.isIntersecting?start():stop(),{threshold:.02});observer.observe(hero);document.addEventListener('visibilitychange',()=>document.hidden?stop():start());let resizeRaf=0;addEventListener('resize',()=>{if(!running||resizeRaf)return;resizeRaf=requestAnimationFrame(()=>{resizeRaf=0;reset()})},{passive:true});requestAnimationFrame(()=>{reset();start()});
})();
/* ── 3D POINTER DEPTH ── */
(function(){
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine=window.matchMedia('(pointer:fine)');
  if(reduce.matches)return;
  const coarse=window.matchMedia('(pointer:coarse)');
  const tablet=coarse.matches && window.innerWidth>=701;
  function addTouchDepth(){
    document.querySelectorAll('.hero-card,.svc-card,.b2b-card,.price-card,.cert-card,.testi-card,.gc-card,.emirate-card,.contact-method,.contact-method-card,.contact-step,.service-detail-card,.client-card').forEach(card=>{
      card.setAttribute('data-tilt','');
      card.addEventListener('pointerdown',e=>{
        const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
        card.style.setProperty('--touch-rx',((.5-y)*(tablet?4:2)).toFixed(2)+'deg');
        card.style.setProperty('--touch-ry',((x-.5)*(tablet?4:2)).toFixed(2)+'deg');
        card.classList.add('touch-depth');
      },{passive:true});
      const release=()=>{card.classList.remove('touch-depth');card.style.setProperty('--touch-rx','0deg');card.style.setProperty('--touch-ry','0deg')};
      card.addEventListener('pointerup',release,{passive:true}); card.addEventListener('pointercancel',release,{passive:true}); card.addEventListener('pointerleave',release,{passive:true});
    });
  }
  if(coarse){addTouchDepth();return;}
  if(!fine.matches)return;
  const root=document.documentElement; let raf=0,px=50,py=50;
  window.addEventListener('pointermove',e=>{
    px=e.clientX/window.innerWidth*100; py=e.clientY/window.innerHeight*100;
    if(!raf)raf=requestAnimationFrame(()=>{root.style.setProperty('--pointer-x',px+'%');root.style.setProperty('--pointer-y',py+'%');raf=0;});
  },{passive:true});
  const tiltSelectors='[data-tilt]';
  function attach(card){
    if(card.dataset.tiltReady)return; card.dataset.tiltReady='1';
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      card.style.setProperty('--rx',((.5-y)*7).toFixed(2)+'deg'); card.style.setProperty('--ry',((x-.5)*7).toFixed(2)+'deg');
      card.style.setProperty('--gx',(x*100).toFixed(1)+'%'); card.style.setProperty('--gy',(y*100).toFixed(1)+'%');
    },{passive:true});
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');card.style.setProperty('--gx','50%');card.style.setProperty('--gy','50%')},{passive:true});
  }
  function addTilt(){
    document.querySelectorAll('.hero-card,.svc-card,.b2b-card,.price-card,.cert-card,.testi-card,.gc-card,.emirate-card,.contact-method,.contact-method-card,.contact-step,.service-detail-card,.client-card').forEach(card=>{card.setAttribute('data-tilt','');attach(card);});
  }
  addTilt();
  const hero=document.querySelector('.hero-section,.contact-hero,.error-hero,.page-hero');
  if(hero)hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;hero.style.setProperty('--hero-rx',((.5-y)*2).toFixed(2)+'deg');hero.style.setProperty('--hero-ry',((x-.5)*2).toFixed(2)+'deg')},{passive:true});
})();
/* ── CINEMATIC MOTION SYSTEM ── */
(function(){
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=window.matchMedia('(pointer:fine)').matches;
  document.documentElement.classList.add('motion-ready');
  const revealables=document.querySelectorAll('main section,main article,.hero-card,.svc-card,.b2b-card,.client-card,.service-detail-card,.contact-method-card,.contact-step,.value-grid article,.performance-grid>div,.detail-highlight,.detail-service-grid li,.detail-benefits article,.map-detail,.indicator-item,.clients-note');
  revealables.forEach((el,i)=>{el.classList.add('motion-reveal');el.style.setProperty('--motion-index',i%8);});
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('motion-visible');reveal.unobserve(entry.target)}}),{threshold:.1,rootMargin:'0px 0px -8%'});
  revealables.forEach(el=>reveal.observe(el));
  document.querySelectorAll('#hero .motion-reveal,#hero .hero-card,#hero .hero-text').forEach(el=>el.classList.add('motion-visible'));
  document.querySelectorAll('.hero-card,.svc-card,.b2b-card,.client-card,.service-detail-card,.contact-method-card,.value-grid article,.detail-highlight').forEach(el=>el.setAttribute('data-motion-card',''));
  if(!reduce&&fine){
    const orb=document.createElement('div');orb.className='motion-orb';document.body.appendChild(orb);
    let mx=innerWidth/2,my=innerHeight/2,ox=mx,oy=my,active=false;
    window.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;active=true;orb.classList.add('motion-active')},{passive:true});
    window.addEventListener('pointerleave',()=>{active=false;orb.classList.remove('motion-active')},{passive:true});
    const follow=()=>{ox+=(mx-ox)*.12;oy+=(my-oy)*.12;orb.style.left=ox+'px';orb.style.top=oy+'px';requestAnimationFrame(follow)};follow();
    document.querySelectorAll('[data-motion-card]').forEach(card=>{
      card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;card.style.setProperty('--spot-x',(x*100)+'%');card.style.setProperty('--spot-y',(y*100)+'%');card.style.transform=`perspective(900px) rotateX(${(0.5-y)*5}deg) rotateY(${(x-0.5)*5}deg) translateY(-6px)`;card.classList.add('motion-hover')},{passive:true});
      card.addEventListener('pointerleave',()=>{card.style.transform='';card.classList.remove('motion-hover')},{passive:true});
    });
    document.querySelectorAll('.btn-primary,.btn-secondary,.btn-wa,.nav-cta').forEach(btn=>{btn.addEventListener('pointermove',e=>{const r=btn.getBoundingClientRect();btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.05}px,${(e.clientY-r.top-r.height/2)*.05}px)`},{passive:true});btn.addEventListener('pointerleave',()=>btn.style.transform='')});
  }
  document.querySelectorAll('section').forEach(section=>{section.classList.add('motion-section');const line=document.createElement('i');line.className='motion-line';section.appendChild(line)});
  const transition=document.createElement('div');
  transition.className='page-transition';
  transition.setAttribute('aria-hidden','true');
  transition.innerHTML='<div class=page-transition__noise></div><div class=page-transition__scan></div><div class=page-transition__brand><span class=page-transition__logo>EC<span>O</span></span><span class=page-transition__rule></span><span class=page-transition__label>Environmental · UAE</span></div><div class=page-transition__status>Loading next view<span class=page-transition__dots>···</span></div><div class=page-transition__progress></div>';
  document.body.appendChild(transition);
  requestAnimationFrame(()=>{
    transition.classList.add('is-ready','is-entering');
    setTimeout(()=>transition.classList.remove('is-entering'),760);
  });
  window.ecoNavigate=function(href){
    if(!href)return;
    if(reduce){location.href=href;return}
    transition.classList.remove('is-entering');transition.classList.add('is-leaving');
    setTimeout(()=>{location.href=href},560);
  };
  document.querySelectorAll('a[href]').forEach(a=>{const href=a.getAttribute('href');if(!href||href.startsWith('#')||href.startsWith('http')||href.startsWith('tel:')||href.startsWith('mailto:')||a.target==='_blank'||a.hasAttribute('download'))return;a.addEventListener('click',e=>{if(reduce)return;e.preventDefault();window.ecoNavigate(href)})});
  window.addEventListener('pageshow',()=>{transition.classList.remove('is-leaving');transition.classList.add('is-entering');setTimeout(()=>transition.classList.remove('is-entering'),720)},{once:true});
  try{document.querySelectorAll('[data-target]').forEach(el=>{if(!el.dataset.motionNumber){el.dataset.motionNumber='1';el.classList.add('motion-number')}})}catch(e){}
})();
/* ── SUBTLE INTERACTION SOUND SYSTEM ── */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const AudioAPI=window.AudioContext||window.webkitAudioContext; if(!AudioAPI)return;
  let audio=null,master=null,armed=false,lastTone=0,lastParticle=0,lastX=-999,lastY=-999;
  function arm(){
    if(!audio){audio=new AudioAPI();master=audio.createGain();master.gain.value=.045;master.connect(audio.destination)}
    if(audio.state==='suspended')audio.resume();armed=true;
  }
  function tone(kind){
    if(!armed||!audio||audio.state!=='running')return;
    const now=performance.now(); if(now-lastTone<55)return; lastTone=now;
    const spec={hover:[520,650,.045,'sine'],click:[280,620,.11,'sine'],particle:[360,520,.075,'triangle'],toggle:[420,760,.13,'sine']}[kind]||[420,600,.08,'sine'];
    const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime;
    osc.type=spec[3];osc.frequency.setValueAtTime(spec[0],t);osc.frequency.exponentialRampToValueAtTime(spec[1],t+spec[2]*.7);
    gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.22,t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+spec[2]);osc.connect(gain);gain.connect(master);osc.start(t);osc.stop(t+spec[2]+.02);
  }
  const interactive=document.querySelectorAll('.btn-primary,.btn-secondary,.btn-wa,.nav-cta,.lang-btn,.theme-toggle,#robin-btn,.hbg,[data-motion-card],.indicator-item,.map-emirate');
  interactive.forEach(el=>{
    el.addEventListener('pointerdown',arm,{passive:true});
    el.addEventListener('pointerenter',()=>tone('hover'),{passive:true});
    el.addEventListener('click',()=>tone(el.matches('.theme-toggle,.lang-btn')?'toggle':'click'));
  });
  document.addEventListener('pointerdown',arm,{passive:true,once:true});
  const hero=document.querySelector('.hero-section');
  if(hero){
    hero.addEventListener('pointerdown',e=>{arm();const r=hero.getBoundingClientRect();lastX=e.clientX-r.left;lastY=e.clientY-r.top;tone('particle')},{passive:true});
    hero.addEventListener('pointermove',e=>{if(!armed)return;const r=hero.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,dx=x-lastX,dy=y-lastY; if(dx*dx+dy*dy>700&&performance.now()-lastParticle>180){lastParticle=performance.now();lastX=x;lastY=y;tone('particle')}},{passive:true});
  }
  window.ecoSound={enable:arm,mute:()=>{if(master)master.gain.setTargetAtTime(0,audio.currentTime,.03)},unmute:()=>{if(master)master.gain.setTargetAtTime(.045,audio.currentTime,.03)}};
})();
/* ── LAYERED 3D PARALLAX DEPTH ── */
(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=matchMedia('(pointer:fine)').matches;
  const coarse=matchMedia('(pointer:coarse)').matches;
  if(reduce)return;
  const cards=document.querySelectorAll('.hero-card,.service-detail-card,.client-card,.contact-method-card,.detail-highlight,.value-grid article,.emirate-card');
  const hero=document.querySelector('.hero-section,.contact-hero,.page-hero,.error-hero');
  function setLayer(el,depth){el.classList.add('parallax-layer');el.style.setProperty('--parallax-depth',depth)}
  cards.forEach(card=>{
    card.style.setProperty('--parallax-x','0px');card.style.setProperty('--parallax-y','0px');
    const children=[...card.children].filter(el=>!el.classList.contains('motion-line'));
    children.forEach((el,i)=>setLayer(el,(i%3+1)*.65));
    const reset=()=>{card.style.setProperty('--parallax-x','0px');card.style.setProperty('--parallax-y','0px');card.classList.remove('parallax-active')};
    if(fine){
      card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.setProperty('--parallax-x',`${(-x*12).toFixed(2)}px`);card.style.setProperty('--parallax-y',`${(-y*12).toFixed(2)}px`);card.classList.add('parallax-active')},{passive:true});
      card.addEventListener('pointerleave',reset,{passive:true});
    }else if(coarse){
      card.addEventListener('pointerdown',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.setProperty('--parallax-x',`${(-x*5).toFixed(2)}px`);card.style.setProperty('--parallax-y',`${(-y*5).toFixed(2)}px`);card.classList.add('parallax-active')},{passive:true});
      card.addEventListener('pointerup',reset,{passive:true});card.addEventListener('pointercancel',reset,{passive:true});
    }
  });
  if(hero&&fine){
    const layers=[hero.querySelector('.hero-text'),hero.querySelector('.hero-cards'),hero.querySelector('.contact-hero-inner'),hero.querySelector('.page-hero-inner'),hero.querySelector('.error-inner')].filter(Boolean);
    layers.forEach((el,i)=>setLayer(el,(i+1)*.7));
    let raf=0,x=0,y=0;
    hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();x=(e.clientX-r.left)/r.width-.5;y=(e.clientY-r.top)/r.height-.5;if(!raf)raf=requestAnimationFrame(()=>{hero.style.setProperty('--scene-x',`${x*18}px`);hero.style.setProperty('--scene-y',`${y*12}px`);raf=0})},{passive:true});
    hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--scene-x','0px');hero.style.setProperty('--scene-y','0px')},{passive:true});
  }
})();
/* ── INTERACTIVE CUSTOM CURSOR ── */
(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=matchMedia('(pointer:fine)').matches;
  if(reduce||!fine)return;
  const cursor=document.createElement('div');
  cursor.className='eco-cursor';cursor.setAttribute('aria-hidden','true');
  cursor.innerHTML='<span class="eco-cursor__dot"></span><span class="eco-cursor__ring"></span><span class="eco-cursor__label"></span>';
  document.body.appendChild(cursor);document.body.classList.add('has-custom-cursor');
  const dot=cursor.querySelector('.eco-cursor__dot'),ring=cursor.querySelector('.eco-cursor__ring'),label=cursor.querySelector('.eco-cursor__label');
  let x=-100,y=-100,tx=x,ty=y,raf=0,visible=false;
  function render(){tx+=(x-tx)*.22;ty+=(y-ty)*.22;cursor.style.transform=`translate3d(${tx}px,${ty}px,0)`;raf=requestAnimationFrame(render)}
  render();
  function setState(name,text){cursor.dataset.state=name||'';label.textContent=text||''}
  document.addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;if(!visible){visible=true;cursor.classList.add('is-visible')}},{passive:true});
  document.addEventListener('pointerover',e=>{const target=e.target.closest('a,button,[data-tilt],.parallax-layer,canvas#pc');if(!target)return;if(target.matches('canvas#pc'))setState('particle','FIELD');else if(target.matches('button'))setState('button','OPEN');else if(target.matches('[data-tilt],.parallax-layer'))setState('depth','3D');else setState('link','VIEW')},{passive:true});
  document.addEventListener('pointerout',e=>{if(!e.relatedTarget||!e.target.closest('a,button,[data-tilt],.parallax-layer,canvas#pc'))setState('','')},{passive:true});
  document.addEventListener('pointerdown',()=>{cursor.classList.add('is-pressed')},{passive:true});
  document.addEventListener('pointerup',()=>{cursor.classList.remove('is-pressed')},{passive:true});
  document.addEventListener('pointerleave',()=>{cursor.classList.remove('is-visible')},{passive:true});
})();

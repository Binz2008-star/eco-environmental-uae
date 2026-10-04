/* ── LAZY CHATBOT LOADER ── */
let chatbotLoading=null;
function loadChatbot(){
  const button=document.getElementById('robin-btn');
  if(typeof window.toggleRobin==='function'){window.toggleRobin();return;}
  if(button)button.style.opacity='1';
  if(!chatbotLoading){
    chatbotLoading=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='assets/js/chatbot.js'; script.defer=true;
      script.onload=()=>{if(typeof window.toggleRobin==='function')window.toggleRobin();resolve();};
      script.onerror=reject; document.body.appendChild(script);
    });
  }
}
/* ── NAV ── */
const nav=document.getElementById('mainNav');
if(nav)window.addEventListener('scroll',()=>nav.classList.toggle('sc',scrollY>55),{passive:true});
/* ── HAMBURGER ── */
const hbg=document.getElementById('hbg');
const drawer=document.getElementById('drawer');
if(hbg)hbg.addEventListener('click',()=>{
  const o=drawer.classList.toggle('o');
  hbg.classList.toggle('o',o);
  hbg.setAttribute('aria-expanded',o);
  document.body.style.overflow=o?'hidden':'';
});
document.querySelectorAll('.dlink').forEach(a=>a.addEventListener('click',()=>{
  drawer.classList.remove('o');hbg.classList.remove('o');
  document.body.style.overflow='';
}));
/* ── SCROLL REVEAL ── */
const revObs=new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('v'),i*55);revObs.unobserve(e.target);}});
},{threshold:0.08});
document.querySelectorAll('.reveal,.reveal-left').forEach(el=>revObs.observe(el));
/* ── COUNTER ── */
function animateCounters(){
  document.querySelectorAll('[data-target]').forEach(el=>{
    const target=+el.dataset.target;let current=+(el.dataset.start ?? el.textContent) || 0;
    const step=(target-current)/30;
    const timer=setInterval(()=>{current=Math.min(current+step,target);el.textContent=Math.round(current).toLocaleString('en-US');if(current>=target)clearInterval(timer);},30);
  });
}
const counterObs=new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting){animateCounters();counterObs.disconnect();}
},{threshold:0.3});
const heroSection=document.querySelector('.hero-section');
if(heroSection)counterObs.observe(heroSection);
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
  const observer=new IntersectionObserver(([e])=>e.isIntersecting?start():stop(),{threshold:.02});observer.observe(hero);document.addEventListener('visibilitychange',()=>document.hidden?stop():start());addEventListener('resize',()=>{if(running)reset()},{passive:true});reset();start();
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
/* ── MODAL ── */
let selSvc='';
let lastFocusedElement=null;
function openModal(){
  lastFocusedElement=document.activeElement;
  const modal=document.getElementById('modalOverlay');
  modal.classList.add('show');
  document.body.style.overflow='hidden';
  goStep(1);
  setTimeout(()=>modal.querySelector('button, input, select, textarea')?.focus(),0);
}
function closeModal(){
  document.getElementById('modalOverlay').classList.remove('show');
  document.body.style.overflow='';
  lastFocusedElement?.focus?.();
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && document.getElementById('modalOverlay')?.classList.contains('show'))closeModal();
});
function goStep(n){document.querySelectorAll('.modal-step').forEach(s=>s.classList.remove('active'));document.getElementById('mStep'+n).classList.add('active');}
function pickSvc(s){selSvc=s;document.getElementById('mSvcTxt').textContent=s;goStep(2);}
function safeQuote(){if(typeof gtagQuote==='function')gtagQuote();}
function safeWA(){if(typeof gtagWA==='function')gtagWA();}
function sendModal(){
  const name=document.getElementById('mName').value.trim();
  if(!name){
    const el=document.getElementById('mName');
    el.style.borderColor='#ef4444';el.placeholder='Please enter your name';el.focus();
    return;
  }
  safeQuote();safeWA();
  goStep(3);
  let txt='Hello ECO Environmental,\n\nService: '+selSvc+'\nName: '+name+'\n\nPlease send me information and pricing.';
  setTimeout(()=>{window.open('https://wa.me/971522233989?text='+encodeURIComponent(txt),'_blank');closeModal();},1800);
}
const modalOverlay=document.getElementById('modalOverlay'); if(modalOverlay)modalOverlay.addEventListener('click',function(e){if(e.target===this)closeModal();});
/* ── ARABIC LOCALIZATION ── */
let isAR=false;
const arOriginals=[];
function setLang(selector,ar,en,html=false){
  document.querySelectorAll(selector).forEach((el,i)=>{
    if(!arOriginals.some(x=>x.el===el))arOriginals.push({el,en:html?el.innerHTML:el.textContent});
    const original=arOriginals.find(x=>x.el===el);
    const value=isAR?(Array.isArray(ar)?(ar[i]??ar[ar.length-1]):ar):(en!==null&&en!==undefined?(Array.isArray(en)?(en[i]??en[en.length-1]):en):original?.en);
    if(html)el.innerHTML=value??'';else el.textContent=value??'';
  });
}
function toggleLang(){
  isAR=!isAR;
  document.documentElement.setAttribute('dir',isAR?'rtl':'ltr');
  document.documentElement.setAttribute('lang',isAR?'ar':'en');
  document.body.classList.toggle('arabic-ui',isAR);
  const btn=document.getElementById('langBtn');
  if(btn){btn.textContent=isAR?'EN':'العربية';btn.setAttribute('aria-label',isAR?'Switch language to English':'التبديل إلى اللغة الإنجليزية');}
  setLang('.nav-links a',['عن ECO','الجهات والمؤسسات','الخدمات','عملاؤنا','الأسعار','نطاق التغطية','الاعتمادات','اطلب عرضًا'],null);
  setLang('.drawer .dl',['عن ECO','الجهات والمؤسسات','الخدمات','عملاؤنا','الأسعار','نطاق التغطية','الاعتمادات','اتصل بنا'],null);
  setLang('.drawer-cta','اطلب عرضًا مجانيًا',null); setLang('.nav-cta','اطلب عرضًا',null);
  setLang('.hero-badge','معتمد من البلديات · الإمارات السبع · منذ 2016',null);
  setLang('#hero h1','حماية<br>مياه الإمارات.<br><em>باحترافية.</em>',null,true);
  setLang('.hero-desc','من تنظيف مصائد الشحوم والامتثال للبلديات إلى تنظيف خزانات وسفن الخدمة البحرية — ECO Environmental شريككم البيئي الموثوق في دولة الإمارات، مع تقارير ميدانية موثقة بعد كل زيارة.',null);
  setLang('.hero-btns .btn-primary','اطلب عرضًا مجانيًا ←',null,true); setLang('.hero-btns .btn-secondary','تعرّف على خدماتنا',null);
  setLang('.hc-label',['عملاء نشطون','سنوات خبرة','الإمارات المشمولة','توثيق ميداني'],null); setLang('.hc-sub',['في جميع الإمارات','في خدمة الإمارات','تغطية كاملة','بعد كل زيارة'],null);
  setLang('#about .label','من نحن',null); setLang('#about h2','شريك بيئي<br><em>بمعايير حكومية.</em>',null,true);
  setLang('#b2b .label','القطاع المؤسسي والشركات',null); setLang('#b2b h2','مصمم للمنشآت<br><em>التي لا تحتمل التعطل.</em>',null,true);
  setLang('#services .label','خدماتنا',null); setLang('#services h2','ست خدمات.<br><em>شريك واحد.</em>',null,true);
  setLang('#impact .label','أثر موثق',null); setLang('#impact h2','أرقام<br><em>تصنع الفرق.</em>',null,true);
  setLang('#pricing .label','أسعار واضحة',null); setLang('#pricing h2','توريد وتركيب<br><em>مصائد الشحوم</em>',null,true);
  setLang('#testimonials .label','آراء العملاء',null); setLang('#testimonials h2','ماذا يقول<br><em>عملاؤنا؟</em>',null,true);
  setLang('#coverage .label','تغطية وطنية',null); setLang('#coverage h2','الإمارات السبع.<br><em>اتصال واحد.</em>',null,true);
  setLang('#certs .label','الاعتمادات',null); setLang('#certs h2','معتمدون وفق<br><em>أعلى المعايير.</em>',null,true);
  setLang('#contact .label','تواصل معنا',null); setLang('#contact h2','عرض سعر مجاني.<br><em>استجابة سريعة.</em>',null,true);
  setLang('#process .label','كيف نعمل',null); setLang('#process h2','من الاتصال الأول إلى<br><em>شهادة الامتثال.</em>',null,true);
  setLang('#gocanvas .label','التوثيق الميداني',null); setLang('#gocanvas h2','كل زيارة<br><em>موثقة بالكامل.</em>',null,true);
  setLang('#faq .label','الأسئلة الشائعة',null); setLang('#faq h2','إجابات عن<br><em>أسئلتكم.</em>',null,true);
  const serviceNames=['تنظيف وصيانة مصائد الشحوم','توريد وتركيب مصائد الشحوم','المعالجة البيولوجية GES','الغسيل بالضغط العالي','جمع وإعادة تدوير الزيوت المستعملة','تنظيف السفن والخزانات البحرية'];
  const serviceDesc=['تنظيف دوري موثق لمصائد الشحوم مع صور قبل وبعد وتقارير ميدانية معتمدة.','نماذج UPVC معتمدة من البلديات، مع معاينة الموقع والتركيب والضمان.','حل بيولوجي آمن يقلل تراكم الدهون والروائح ويطيل عمر شبكات التصريف.','تنظيف صناعي للمنشآت والمستودعات والواجهات وخطوط التصريف بالماء الساخن.','جمع مجدول للزيوت المستعملة في جميع الإمارات وتحويلها إلى وقود حيوي مع شهادة إعادة تدوير.','فرق متخصصة لتنظيف الخزانات البحرية والـ ballast وغرف المحركات في موانئ الدولة.'];
  setLang('#services .svc-card h3',serviceNames,null); setLang('#services .svc-card p',serviceDesc,null);
  setLang('#wName + label','اسم المنشأة / الشركة',null); setLang('label[for="wName"]','الاسم / الشركة',null); setLang('label[for="wPhone"]','الهاتف / واتساب *',null); setLang('label[for="wSvc"]','الخدمة المطلوبة',null); setLang('label[for="wMsg"]','رسالتك (اختياري)',null); setLang('.wa-form h3','أرسل عبر واتساب',null); setLang('.form-sub','سنفتح محادثة واتساب فورًا.',null); setLang('.btn-wa','إرسال عبر واتساب ←',null,true);
  const q=['كم تكلفة تنظيف مصيدة الشحوم؟','هل أنتم معتمدون من بلدية عجمان ودبي؟','ما وقت الاستجابة للطوارئ؟','ماذا يتضمن تقرير GoCanvas الميداني؟','ما حجم مصيدة الشحوم المناسب لمنشأتي؟','هل تخدمون جميع الإمارات؟','ماذا يتضمن عقد الصيانة السنوي؟'];
  const a=['تبدأ الأسعار من 2,500 درهم للحجم D، و4,500 للحجم A، و6,000 للحجم B، ومن 8,000 للحجم C، إضافة إلى ضريبة القيمة المضافة. تواصل معنا للحصول على عرض مجاني.','نعم. نحن معتمدون من بلدية عجمان وبلدية دبي ومتوافقون مع متطلبات هيئة البيئة في أبوظبي، مع شهادتي ISO 14001 وISO 9001.','نضمن استجابة خلال 60–120 دقيقة في جميع الإمارات، على مدار الساعة طوال أيام الأسبوع.','يتضمن صور قبل وبعد، توقيع الفني، التاريخ والوقت، نوع وحجم المصيدة، الكمية التي تمت إزالتها، حالة الامتثال وموعد الخدمة التالية.','الحجم D للأكشاك والمقاهي، وA للمطاعم الصغيرة، وB للمطاعم المتوسطة، وC للمطابخ الكبيرة والفنادق. أرسل الرخصة التجارية وسنساعدك مجانًا.','نعم، نغطي أبوظبي ودبي والشارقة وعجمان وأم القيوين ورأس الخيمة والفجيرة، مع خدمة طوارئ على مدار الساعة.','يشمل الزيارات المجدولة، الاستجابة للطوارئ، التخلص من المخلفات، تقارير الامتثال ومدير حساب مخصص.'];
  setLang('.faq-q',q.map(x=>x+' +'),null); setLang('.faq-a p',a,null);
  try{localStorage.setItem('eco-lang',isAR?'ar':'en')}catch(e){}
}
/* Arabic persistence is initialized by the route-aware layer below. */
/* ── WA FORM ── */
function sendWA(){
  const name=document.getElementById('wName').value.trim();
  const phone=document.getElementById('wPhone')?document.getElementById('wPhone').value.trim():'';
  const svc=document.getElementById('wSvc').value;
  const msg=document.getElementById('wMsg').value.trim();
  if(!phone){
    const el=document.getElementById('wPhone');
    if(el){el.style.borderColor='#ef4444';el.setAttribute('aria-invalid','true');el.focus();el.placeholder='Required — enter your number';}
    const error=document.getElementById('phoneError');
    if(error)error.textContent='Please enter a phone or WhatsApp number.';
    return;
  }
  const phoneEl=document.getElementById('wPhone');
  phoneEl?.removeAttribute('aria-invalid');
  const phoneError=document.getElementById('phoneError');
  if(phoneError)phoneError.textContent='';
  safeWA();
  let txt='Hello ECO Environmental,\n\n';
  if(name)txt+='Name/Company: '+name+'\n';
  txt+='Phone/WhatsApp: '+phone+'\n';
  if(svc)txt+='Service: '+svc+'\n';
  if(msg)txt+='\nDetails: '+msg;
  txt+='\n\nI would like a free quote.';
  window.open('https://wa.me/971522233989?text='+encodeURIComponent(txt),'_blank');
}
/* ── INPUT ENABLE ── */
const rInp=document.getElementById('r-inp'), rSend=document.getElementById('r-send'); if(rInp&&rSend)rInp.addEventListener('input',function(){rSend.disabled=!this.value.trim();});
/* ── PAGE PROGRESS ── */
const progBar=document.getElementById('page-progress');
if(progBar)window.addEventListener('scroll',()=>{const pct=(scrollY/(document.body.scrollHeight-innerHeight))*100;progBar.style.width=Math.min(pct,100)+'%';},{passive:true});
/* ── BACK TO TOP ── */
const btt=document.getElementById('btt');
if(btt)window.addEventListener('scroll',()=>{btt.classList.toggle('show',scrollY>400);},{passive:true});
/* ── PROGRESS BARS ── */
const progObs=new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting){document.querySelectorAll('.prog-bar').forEach(bar=>{bar.style.width=bar.dataset.width+'%';});progObs.disconnect();}
},{threshold:0.3});
const progSection=document.getElementById('progressBars');
if(progSection)progObs.observe(progSection);
/* ── FAQ ── */
function toggleFaq(btn){
  const item=btn.closest('.faq-item');
  const isOpen=item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i=>{
    i.classList.remove('open');
    const b=i.querySelector('.faq-q'); const a=i.querySelector('.faq-a');
    if(b)b.setAttribute('aria-expanded','false'); if(a)a.hidden=true;
  });
  if(!isOpen){
    item.classList.add('open');
    const a=item.querySelector('.faq-a');
    btn.setAttribute('aria-expanded','true'); if(a)a.hidden=false;
  }
}
/* ── DARK/LIGHT MODE ── */
let isLight=false;
function toggleTheme(){
  isLight=!isLight;
  document.body.classList.toggle('light-mode',isLight);
  const theme=document.getElementById('themeToggle');
  if(theme){theme.classList.toggle('light-mode',isLight);
  theme.setAttribute('aria-pressed',String(isLight));}
  localStorage.setItem('eco-theme',isLight?'light':'dark');
}
if(localStorage.getItem('eco-theme')==='light')toggleTheme();
/* ── COOKIE CONSENT: handled in analytics.js (ads load only after Accept) ── */
/* ── VISITOR COUNTER ── */
// Disabled: the previous Counter API endpoint returned HTTP 410.
/* ── INTERACTIVE COVERAGE MAP ── */
const mapSlugs={'Abu Dhabi':'abu-dhabi','Dubai':'dubai','Sharjah':'sharjah','Ajman':'ajman','Umm Al Quwain':'umm-al-quwain','Ras Al Khaimah':'ras-al-khaimah','Fujairah':'fujairah'};
const mapDetails={
  'Abu Dhabi':['Abu Dhabi','Full coverage · Environmental and marine services'],
  'Dubai':['Dubai','Full coverage · Municipality-focused service support'],
  'Sharjah':['Sharjah','Urban & industrial coverage'],
  'Ajman':['Ajman','Headquartered · Full UAE coordination'],
  'Umm Al Quwain':['Umm Al Quwain','Full coverage · Scheduled service available'],
  'Ras Al Khaimah':['Ras Al Khaimah','Full coverage · Scheduled service available'],
  'Fujairah':['Fujairah','Full coverage · Maritime facilities serviced']
};
function selectEmirate(name){
  document.querySelectorAll('.map-emirate').forEach(el=>el.classList.toggle('active',el.dataset.emirate===name));
  const detail=mapDetails[name]||[name,'Coverage available across the UAE'];
  const nameEl=document.getElementById('mapDetailName'); const statusEl=document.getElementById('mapDetailStatus');
  if(nameEl)nameEl.textContent=detail[0]; if(statusEl)statusEl.textContent=detail[1];
  const linkEl=document.getElementById('mapDetailLink');
  if(linkEl)linkEl.href='emirates/'+(mapSlugs[name]||'ajman')+'.html';
}
document.querySelectorAll('.map-emirate').forEach(el=>{
  el.addEventListener('click',()=>{selectEmirate(el.dataset.emirate);(window.ecoNavigate||((href)=>window.location.href=href))('emirates/'+mapSlugs[el.dataset.emirate]+'.html');});
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectEmirate(el.dataset.emirate);(window.ecoNavigate||((href)=>window.location.href=href))('emirates/'+mapSlugs[el.dataset.emirate]+'.html');}});
});
/* ── ENVIRONMENTAL INDICATOR SELECTOR ── */
const indicatorDetails={
  water:['50,000 litres','of water protected daily across the seven Emirates.','82%'],
  uco:['10,000 litres','of used cooking oil recycled monthly into biofuel.','64%'],
  sewage:['30%','average sewage maintenance cost reduction for program clients.','30%'],
  'water-use':['40%','water consumption reduction at facilities using biological treatment.','40%']
};
document.querySelectorAll('.indicator-item').forEach(btn=>btn.addEventListener('click',()=>{
  const key=btn.dataset.indicator; const data=indicatorDetails[key]; if(!data)return;
  document.querySelectorAll('.indicator-item').forEach(item=>{item.classList.remove('active');item.setAttribute('aria-pressed','false');});
  btn.classList.add('active');btn.setAttribute('aria-pressed','true');
  const focus=document.getElementById('indicatorFocus');
  if(focus){focus.querySelector('strong').textContent=data[0];focus.querySelector('p').textContent=data[1];focus.querySelector('.focus-bar span').style.width=data[2];}
}));

/* ── SITE-WIDE INTERNAL PAGE LOCALIZATION ── */
const ecoInternalOriginals=[];
function ecoText(sel, ar, html=false){
  document.querySelectorAll(sel).forEach((el,i)=>{
    if(!ecoInternalOriginals.some(x=>x.el===el))ecoInternalOriginals.push({el,en:html?el.innerHTML:el.textContent,html});
    const v=Array.isArray(ar)?(ar[i]??ar[ar.length-1]):ar;
    if(html)el.innerHTML=v; else el.textContent=v;
  });
}
function ecoRestore(){ecoInternalOriginals.forEach(x=>{if(x.html)x.el.innerHTML=x.en;else x.el.textContent=x.en})}
function localizeCommon(){
  ecoText('.nav-links a',['عن ECO','الخدمات','عملاؤنا','نطاق التغطية','اطلب عرضًا']);
  ecoText('.drawer .dl',['عن ECO','الخدمات','عملاؤنا','نطاق التغطية','اتصل بنا']);
  ecoText('.drawer-cta','اطلب عرضًا مجانيًا'); ecoText('.nav-cta','اطلب عرضًا');
  ecoText('footer .footer-brand p','شركة ECO لخدمات حماية البيئة ذ.م.م — نحمي مياه الإمارات بخدمات بيئية مستدامة منذ عام 2016.');
  ecoText('footer .footer-col h5',['استكشف','تواصل معنا']);
  ecoText('footer .footer-bottom a','سياسة الخصوصية'); ecoText('.sticky-cta .btn-primary','اطلب عرضًا مجانيًا ←');
}
function localizeInternal(){
  localizeCommon();
  const body=document.body;
  if(body.classList.contains('about-page')){
    ecoText('.about-hero .label','من نحن · منذ 2016'); ecoText('.about-hero h1','العمل البيئي<br><em>بمسؤولية وشفافية.</em>',true); ecoText('.about-hero p','من عجمان إلى الإمارات السبع، تساعد ECO Environmental المنشآت على الحفاظ على الامتثال والنظافة والاستعداد للخطوة التالية.'); ecoText('.about-hero-stats span',['سنوات في خدمة<br>الإمارات','منشأة نشطة<br>مدعومة','إمارات<br>مشمولة'],true);
    ecoText('.about-story-copy .label','معيار ECO'); ecoText('.about-story-copy h2','شريك محلي<br><em>بانضباط يوازي المعايير الحكومية.</em>',true); ecoText('.about-story-copy p',['تأسست ECO Technology Environmental Protection Services عام 2016 ويقع مقرها في عجمان. نحن مورد معتمد من بلدية عجمان، ومعتمدون لدى بلدية دبي ومتوافقون مع المتطلبات البيئية في أبوظبي.','لا نكتفي بالتنظيف لمرة واحدة؛ بل نساعد المطاعم والفنادق والمنشآت الصناعية ومراكز التسوق والعمليات البحرية على بناء إجراءات بيئية موثوقة، من الامتثال لمصائد الشحوم إلى تنظيف الخزانات البحرية وإعادة تدوير زيوت الطهي المستعملة.','نحرص بعد كل زيارة على تقديم سجل واضح يشمل صور ما قبل وبعد، وبيانات الفني، ووقت الخدمة، والكمية التي تمت إزالتها، وحالة الامتثال والإجراء التالي المقترح.']); ecoText('.about-story-cta','تحدث مع فريقنا ←');
    ecoText('.about-values .label','ما الذي يوجّهنا'); ecoText('.about-values h2','موثوقون في التصميم.<br><em>مسؤولون في كل قرار.</em>',true); ecoText('.about-section-heading > p','يجمع عملنا بين المسؤولية البيئية والانضباط التشغيلي والتنفيذ العملي للخدمة.'); ecoText('.value-grid h3',['الامتثال أولًا','توثيق بعد كل زيارة','تفكير طويل الأمد']); ecoText('.value-grid p',['نطابق العمل الميداني مع متطلبات منشأتك والبلديات والمفتشين.','تجعل وثائق GoCanvas العمل المنجز واضحًا وقابلًا للتتبع والمراجعة.','نبني إجراءات تقلل المخاطر وتحسن استرداد الموارد وتحافظ على استمرارية التشغيل.']);
    ecoText('.about-recognition .label','المجتمع والقيادة'); ecoText('.about-recognition h2','جذورنا في عجمان.<br><em>وحضورنا في الإمارات.</em>',true); ecoText('.about-recognition p','يتشكل عملنا بجهود الأشخاص والمؤسسات التي تبني إمارات أنظف وأكثر مرونة. شاركت ECO في مؤتمر عجمان البيئي وتواصل تطوير مبادرات عملية للامتثال الرقمي.'); ecoText('.about-recognition .btn-secondary','تعرّف على عملائنا ←'); ecoText('.about-performance .label','وعدنا التشغيلي'); ecoText('.about-performance h2','الجودة تظهر<br><em>في التفاصيل.</em>',true); ecoText('.about-performance .about-section-heading > p','تساعد المعايير الواضحة فرقنا على تقديم نتائج متسقة عبر مختلف أنواع المنشآت والإمارات.'); ecoText('.about-cta .label','مستعدون للعمل معًا؟'); ecoText('.about-cta h2','اجعل الامتثال البيئي<br><em>أمرًا أقل إزعاجًا.</em>',true); ecoText('.about-cta .btn-primary','ابدأ استشارة مجانية ←');
  } else if(body.classList.contains('services-page')){
    ecoText('.services-hero .label','ماذا نقدم · جميع الإمارات'); ecoText('.services-hero h1','شريك واحد<br><em>للعمل الذي يصنع الفرق.</em>',true); ecoText('.services-hero p','من الامتثال لمصائد الشحوم إلى تنظيف الخزانات البحرية، تمنح ECO Environmental المنشآت فريقًا موثوقًا لتشغيل أنظف وتقارير أوضح.'); ecoText('.services-hero-proof span','6 خطوط خدمة أساسية<br>في الإمارات السبع',true); ecoText('.services-list .label','خدماتنا'); ecoText('.services-list h2','حلول عملية.<br><em>وتنفيذ موثق.</em>',true); ecoText('.services-list .services-heading > p','نحدد نطاق كل خدمة وفق منشأتك ومتطلبات البلدية والأدلة التي يحتاجها فريقك بعد إنجاز العمل.'); ecoText('.service-detail-card h3',['تنظيف وصيانة مصائد الشحوم','توريد وتركيب مصائد الشحوم','المعالجة البيولوجية GES','الغسيل بالضغط العالي','جمع وإعادة تدوير الزيوت المستعملة','تنظيف السفن والخزانات البحرية']); ecoText('.service-detail-card .service-card-link','اطلب هذه الخدمة ←'); ecoText('.service-process .label','كيف ننفذ العمل'); ecoText('.service-process h2','واضح من أول اتصال<br><em>حتى تقرير الإغلاق.</em>',true); ecoText('.service-process .services-heading > p','إيقاع تشغيلي بسيط يجعل العمل متوقعًا وسجلات الامتثال جاهزة.'); ecoText('.service-process h3',['نفهم الموقع','ننّفذ بأمان','نوثق النتيجة']); ecoText('.services-sectors .label','مصمم لعملياتك'); ecoText('.services-sectors h2','من المطابخ إلى<br><em>المنشآت الصناعية.</em>',true); ecoText('.services-cta .label','تحتاج نطاقًا مخصصًا؟'); ecoText('.services-cta h2','أخبرنا بما يحتاجه<br><em>موقعك الآن.</em>',true); ecoText('.services-cta p','شارك نوع منشأتك ومتطلبات الخدمة، وسنساعدك في اختيار نقطة البداية المناسبة.'); ecoText('.services-cta .btn-primary','اطلب عرضًا مجانيًا ←');
  } else if(body.classList.contains('contact-page')){
    ecoText('.contact-hero .label','تواصل معنا · جميع الإمارات'); ecoText('.contact-hero h1','عرض سعر مجاني.<br><em>استجابة سريعة.</em>',true); ecoText('.contact-hero p','أخبرنا بما تحتاجه منشأتك. يرد فريقنا خلال ساعات ونقدم معاينات مجانية للمواقع في الإمارات السبع.'); ecoText('.contact-hero-actions .btn-primary','اطلب عرضًا ←'); ecoText('.contact-hero-actions .btn-secondary','اتصل على +971 52 223 3989'); ecoText('.contact-availability strong','متاحون الآن'); ecoText('.contact-availability > span:last-child','خط طوارئ 24/7 · استجابة خلال ساعات'); ecoText('.contact-info .label','تحدث مع ECO'); ecoText('.contact-info h2','لنجعل<br><em>الخطوة التالية بسيطة.</em>',true); ecoText('.contact-info > p','اختر القناة المناسبة لك. للحصول على عرض سريع، أرسل تفاصيل منشأتك عبر واتساب.'); ecoText('.contact-method-card small',['الهاتف','واتساب','البريد الإلكتروني']); ecoText('.contact-method-card strong',['+971 52 223 3989','تحدث مع فريقنا','robenedwan@gmail.com']); ecoText('.contact-form-card .label','ابدأ محادثة'); ecoText('.contact-form-card h2','أرسل بياناتك<br><em>عبر واتساب.</em>',true); ecoText('.contact-form-card p','سنفتح رسالة واتساب معدة مسبقًا تتضمن طلبك.'); ecoText('label[for="wName"]','الاسم / الشركة'); ecoText('label[for="wPhone"]','الهاتف / واتساب *'); ecoText('label[for="wSvc"]','الخدمة المطلوبة'); ecoText('label[for="wMsg"]','الرسالة (اختياري)'); ecoText('.btn-wa','إرسال عبر واتساب ←'); ecoText('.form-note','تُستخدم بياناتك فقط للرد على هذا الاستفسار.'); ecoText('.contact-reassurance .label','ماذا يحدث بعد ذلك؟'); ecoText('.contact-reassurance h2','من الطلب<br><em>إلى خطة العمل.</em>',true); ecoText('.contact-step strong',['نراجع طلبك','نقترح نطاق الخدمة','نحدد موعد الزيارة']); ecoText('.contact-bottom-cta .label','تحتاج استجابة فورية؟'); ecoText('.contact-bottom-cta h2','اتصل أو راسلنا<br><em>مباشرة الآن.</em>',true); ecoText('.contact-bottom-cta .btn-primary','افتح واتساب ←'); ecoText('.contact-bottom-cta .btn-secondary','اتصل بالفريق');
  } else if(body.classList.contains('emirate-page')){
    const name=document.querySelector('.detail-hero h1')?.textContent.split('.')[0].trim()||'الإمارة'; const arName={'Abu Dhabi':'أبوظبي','Dubai':'دبي','Sharjah':'الشارقة','Ajman':'عجمان','Umm Al Quwain':'أم القيوين','Ras Al Khaimah':'رأس الخيمة','Fujairah':'الفجيرة'}[name]||name;
    ecoText('.detail-nav nav a',['أبوظبي','دبي','الشارقة','عجمان','اطلب عرضًا']); ecoText('.detail-nav-cta','اطلب عرضًا'); ecoText('.breadcrumb','← الإمارات السبع'); ecoText('.detail-hero .label','خدمات بيئية محلية'); ecoText('.detail-hero h1',`${arName}. <em>نغطيها بالكامل.</em>`,true); ecoText('.detail-lead',`تقدم ECO Environmental خدمات بيئية موثوقة في ${arName}، مع تنسيق سريع وتقارير ميدانية موثقة للمنشآت المحلية.`); ecoText('.detail-actions .btn-primary',`اطلب عرض ${arName} ←`); ecoText('.detail-actions .btn-secondary','اتصل على +971 52 223 3989'); ecoText('.detail-meta span',['تغطية كاملة','خط طوارئ 24/7','تقارير GoCanvas']); ecoText('.detail-wrap .label',['تركيزنا على الخدمة المحلية','معيار الاستجابة','الخدمات المتاحة','للمشغلين المحليين','استكشف تغطية الإمارات','مستعد لجدولة الخدمة؟']); ecoText('.detail-wrap h2',['شريك واحد.<br><em>كل زيارة موثقة.</em>','امتثال بلا تخمينات.','المزيد من الإمارات.<br><em>شريك واحد.</em>',`احمِ عملياتك في ${arName}.`],true); ecoText('.detail-wrap h3',['تقييم الموقع','خدمة مجدولة','إغلاق موثق']);
  } else if(body.classList.contains('error-page')){
    ecoText('.error-code','خطأ 404 / الصفحة غير موجودة'); ecoText('.error-copy .label','المسار غير متاح'); ecoText('.error-copy h1','هذه الصفحة اتخذت<br><em>منعطفًا خاطئًا.</em>',true); ecoText('.error-copy p','الصفحة المطلوبة غير موجودة أو ربما تم نقلها. دعنا نعيدك إلى خدمات الدعم البيئي الموثوقة في الإمارات.'); ecoText('.error-actions .btn-primary','العودة إلى الصفحة الرئيسية ←'); ecoText('.error-actions .btn-secondary','استكشف عملاءنا');
  } else if(body.classList.contains('clients-page') || document.querySelector('.clients-hero')){
    ecoText('.clients-hero .label','شبكة العملاء · الإمارات'); ecoText('.clients-hero h1','موثوقون لدى فرق<br><em>تحافظ على حركة الإمارات.</em>',true); ecoText('.clients-hero p','منظمات مختارة موثقة في أرشيف خدمات وعقود ومشاريع ECO Environmental، عبر قطاعات الضيافة والتجزئة وتصنيع الأغذية وإدارة العقارات.'); ecoText('.clients-hero-proof span','منشأة نشطة<br>في الإمارات السبع',true); ecoText('.clients-section .label','عملاء مختارون'); ecoText('.clients-section h2','علاقات مبنية على<br><em>عمل موثوق.</em>',true); ecoText('.clients-heading > p','تعرّف هذه الشعارات بمنظمات لديها استفسارات أو عروض أو تقارير خدمة أو مراسلات تعاقدية موثقة في أرشيف الشركة. يختلف نطاق وتوقيت التعاون من عميل لآخر.'); ecoText('.clients-note p','تبحث عن شريك بيئي ملتزم لمنشأتك؟ نخدم الإمارات السبع بتقارير ميدانية متوافقة مع متطلبات البلديات.'); ecoText('.clients-note .btn-primary','ابدأ محادثة ←');
  }
}
const ecoOriginalToggle=toggleLang;
function toggleLang(){
  if(document.body.classList.contains('about-page')||document.body.classList.contains('services-page')||document.body.classList.contains('contact-page')||document.body.classList.contains('emirate-page')||document.body.classList.contains('error-page')||document.querySelector('.clients-hero')){
    const ar=document.documentElement.lang!=='ar'; document.documentElement.lang=ar?'ar':'en'; document.documentElement.dir=ar?'rtl':'ltr'; document.body.classList.toggle('arabic-ui',ar); const b=document.getElementById('langBtn'); if(b){b.textContent=ar?'EN':'AR';b.setAttribute('aria-label',ar?'Switch language to English':'Switch language to Arabic')}; if(ar)localizeInternal();else ecoRestore(); try{localStorage.setItem('eco-lang',ar?'ar':'en')}catch(e){}; return;
  }
  ecoOriginalToggle();
}
try{if(document.getElementById('langBtn')&&localStorage.getItem('eco-lang')==='ar'&&!document.body.classList.contains('home-page'))toggleLang()}catch(e){}
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

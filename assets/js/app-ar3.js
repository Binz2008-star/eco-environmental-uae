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
window.addEventListener('scroll',()=>nav.classList.toggle('sc',scrollY>55),{passive:true});
/* ── HAMBURGER ── */
const hbg=document.getElementById('hbg');
const drawer=document.getElementById('drawer');
hbg.addEventListener('click',()=>{
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
/* ── PARTICLE CANVAS (runs only while Hero is visible) ── */
(function(){
  const canvas=document.getElementById('pc');
  const particleHero=document.querySelector('.hero-section');
  if(!canvas||!particleHero||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const ctx=canvas.getContext('2d'); let W,H,particles=[],rafId=0,running=false;
  const N=window.innerWidth<600?18:36, TEAL='rgba(0,212,184,';
  function resize(){W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight;}
  function Particle(){this.x=Math.random()*W;this.y=Math.random()*H;this.vx=(Math.random()-.5)*.3;this.vy=(Math.random()-.5)*.3;this.r=Math.random()*1.8+.8;}
  function reset(){resize();particles=[];for(let i=0;i<N;i++)particles.push(new Particle());}
  function draw(){
    if(!running)return;
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>{const dx=-9999-p.x,dy=-9999-p.y; p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=TEAL+'.5)';ctx.fill();});
    for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d2=dx*dx+dy*dy;if(d2<10000){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=TEAL+(1-Math.sqrt(d2)/100)*.12+')';ctx.lineWidth=.5;ctx.stroke();}}
    rafId=requestAnimationFrame(draw);
  }
  function start(){if(running)return;running=true;if(!particles.length)reset();draw();}
  function stop(){running=false;cancelAnimationFrame(rafId);ctx.clearRect(0,0,W,H);}
  window.addEventListener('resize',()=>{if(running)resize()},{passive:true});
  const observer=new IntersectionObserver(([entry])=>entry.isIntersecting?start():stop(),{threshold:0.05}); observer.observe(particleHero); start();
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
document.getElementById('modalOverlay').addEventListener('click',function(e){if(e.target===this)closeModal();});
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
try{if(document.getElementById('langBtn') && localStorage.getItem('eco-lang')==='ar')toggleLang()}catch(e){}
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
document.getElementById('r-inp').addEventListener('input',function(){document.getElementById('r-send').disabled=!this.value.trim();});
/* ── PAGE PROGRESS ── */
const progBar=document.getElementById('page-progress');
window.addEventListener('scroll',()=>{const pct=(scrollY/(document.body.scrollHeight-innerHeight))*100;progBar.style.width=Math.min(pct,100)+'%';},{passive:true});
/* ── BACK TO TOP ── */
const btt=document.getElementById('btt');
window.addEventListener('scroll',()=>{btt.classList.toggle('show',scrollY>400);},{passive:true});
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
  theme.classList.toggle('light-mode',isLight);
  theme.setAttribute('aria-pressed',String(isLight));
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
  el.addEventListener('click',()=>{selectEmirate(el.dataset.emirate);window.location.href='emirates/'+mapSlugs[el.dataset.emirate]+'.html';});
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectEmirate(el.dataset.emirate);window.location.href='emirates/'+mapSlugs[el.dataset.emirate]+'.html';}});
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

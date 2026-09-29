/* ══════════════════════════════════════
ROBIN AI — ECO Environmental Assistant
SECURITY: No API key in browser.
Set WORKER_URL to your deployed Cloudflare Worker.
See cloudflare-worker.js for deployment instructions.
Without WORKER_URL, the local fallback runs automatically.
══════════════════════════════════════ */
const WORKER_URL=''; // e.g. 'https://eco-ai.your-subdomain.workers.dev'

const panel=document.getElementById('robin-panel');
const msgs=document.getElementById('r-msgs');
const qk=document.getElementById('r-quick');
const inp=document.getElementById('r-inp');
let chatHistory=[],isTyping=false,robinOpen=false;

function localFallback(text){
  const t=text.toLowerCase();
  const isAR=/[\u0600-\u06FF]/.test(text);
  const clients=['berber','vocca','sabbir','karak al madina','kismath','al tawazon','golden pak','baladi','public cook','dastar khan','wacup','haweli','al mashreq','biryani bhavan','chandni chowk','sawad','rajab','al sorour','al ghawas','yalla pizza','lazzat','themar al bahar','blue marine','marsa ajman','rotana','ramada','lulu','al bwardy'];
  for(const c of clients){if(t.includes(c)){return isAR?'نعم، هذا العميل ضمن قاعدة عملائنا الكرام \u2713\n\u0646\u0642\u062f\u0645 \u062e\u062f\u0645\u0627\u062a \u0645\u0646\u062a\u0638\u0645\u0629 \u0645\u0639 \u062a\u0642\u0627\u0631\u064a\u0631 GoCanvas.\n\u2139\ufe0f +971 52 223 3989':'Yes, confirmed in our client records \u2713\nWe provide regular services with GoCanvas field reports.\n\u2139\ufe0f +971 52 223 3989';}}
  if(t.includes('\u0633\u0639\u0631')||t.includes('price')||t.includes('cost')||t.includes('\u0643\u0645')||t.includes('\u062a\u0643\u0644\u0641')){return isAR?'\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u062a\u0631\u0643\u064a\u0628:\n\u2022 \u062d\u062c\u0645 D: 2,500 \u062f\u0631\u0647\u0645\n\u2022 \u062d\u062c\u0645 A: 4,500 \u062f\u0631\u0647\u0645\n\u2022 \u062d\u062c\u0645 B: 6,000 \u062f\u0631\u0647\u0645 \u2b50\n\u2022 \u062d\u062c\u0645 C: \u0645\u0646 8,000 \u062f\u0631\u0647\u0645\n(+ 5% VAT)':'Installation prices:\n\u2022 Size D: AED 2,500\n\u2022 Size A: AED 4,500\n\u2022 Size B: AED 6,000 \u2b50\n\u2022 Size C: From AED 8,000\n(All + 5% VAT)';}
  if(t.includes('amc')||t.includes('\u0639\u0642\u062f')||t.includes('\u0633\u0646\u0648\u064a')||t.includes('annual')){return isAR?'\u0639\u0642\u0648\u062f \u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u0627\u0644\u0633\u0646\u0648\u064a\u0629 \u062a\u0628\u062f\u0623 \u0645\u0646 **48,000 \u062f\u0631\u0647\u0645/\u0633\u0646\u0629**.\n\u062a\u0634\u0645\u0644: 24\u201336 \u0632\u064a\u0627\u0631\u0629\u060c \u0637\u0648\u0627\u0631\u0626  60\u2013120 \u062f\u0642\u064a\u0642\u0629\u060c \u062a\u0642\u0627\u0631\u064a\u0631 \u0641\u0635\u0644\u064a\u0629.\n\u0647\u0644 \u062a\u0631\u064a\u062f \u0639\u0631\u0636 \u0633\u0639\u0631?':'AMC starts from **AED 48,000/year**.\nIncludes: 24\u201336 visits, 60\u2013120 min emergency, quarterly reports.\nShall I prepare a quote?';}
  if(t.includes('hello')||t.includes('hi')||t.includes('\u0645\u0631\u062d\u0628')||t.includes('\u0627\u0644\u0633\u0644\u0627\u0645')){return isAR?'\u0623\u0647\u0644\u0627\u064b! \ud83d\udc4b \u0623\u0646\u0627 Robin \u0645\u0633\u0627\u0639\u062f\u0643 \u0641\u064a ECO Environmental.\n\u0643\u064a\u0641 \u0623\u0633\u062a\u0637\u064a\u0639 \u0645\u0633\u0627\u0639\u062f\u062a\u0643?':'Hello! \ud83d\udc4b I\'m Robin, ECO Environmental\'s AI assistant.\nHow can I help you today?';}
  return isAR?'\u0634\u0643\u0631\u0627\u064b \u0644\u062a\u0648\u0627\u0635\u0644\u0643 \u0645\u0639 ECO Environmental! \ud83c\udf3f\n\ud83d\udcde +971 52 223 3989\n\ud83d\udcac \u0648\u0627\u062a\u0633\u0627\u0628 \u0645\u062a\u0627\u062d \u0627\u0644\u0622\u0646':'Thanks for contacting ECO Environmental! \ud83c\udf3f\n\ud83d\udcde +971 52 223 3989\n\ud83d\udcac WhatsApp available now';
}

function toggleRobin(){
  robinOpen=!robinOpen;
  panel.classList.toggle('open',robinOpen);
  if(robinOpen&&chatHistory.length===0){
    setTimeout(()=>addMsg('bot','\ud83d\udc4b \u0645\u0631\u062d\u0628\u0627\u064b! \u0623\u0646\u0627 **Robin**\u060c \u0645\u0633\u0627\u0639\u062f\u0643 \u0641\u064a ECO Environmental.\n\nHello! I\'m Robin, ECO\'s AI assistant.\n\n\u0643\u064a\u0641 \u0623\u0633\u062a\u0637\u064a\u0639 \u0645\u0633\u0627\u0639\u062f\u062a\u0643\u061f / How can I help?'),350);
    setTimeout(()=>setQuick(['\ud83e\uddf9 \u062a\u0646\u0638\u064a\u0641 \u0645\u0635\u0627\u0626\u062f \u0627\u0644\u0634\u062d\u0648\u0645','\ud83d\udcb0 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 / Pricing','\ud83d\udccb \u0639\u0642\u062f AMC','\ud83d\udea2 \u062e\u062f\u0645\u0627\u062a \u0628\u062d\u0631\u064a\u0629','\ud83d\udcde \u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627']),750);
  }
}
/* Safe rendering: text nodes only; **bold** becomes <strong>. Newlines rely on white-space:pre-wrap. */
function renderSafe(el,text){
  String(text).split(/\*\*(.*?)\*\*/g).forEach((part,i)=>{
    if(!part)return;
    if(i%2){const b=document.createElement('strong');b.textContent=part;el.appendChild(b);}
    else el.appendChild(document.createTextNode(part));
  });
}
function addMsg(role,text){
  const div=document.createElement('div');div.className='r-msg '+role;
  const bubble=document.createElement('div');bubble.className='r-bubble';
  renderSafe(bubble,text);
  if(role==='bot'){const av=document.createElement('div');av.className='r-mini-av';av.textContent='R';div.appendChild(av);}
  div.appendChild(bubble);msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
}
function showTyping(){
  const d=document.createElement('div');d.className='r-msg bot';d.id='r-typing-ind';
  const av=document.createElement('div');av.className='r-mini-av';av.textContent='R';
  const b=document.createElement('div');b.className='r-bubble';
  b.innerHTML='<div class="r-typing"><span></span><span></span><span></span></div>';
  d.appendChild(av);d.appendChild(b);msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}
function hideTyping(){const t=document.getElementById('r-typing-ind');if(t)t.remove();}
function setQuick(items){
  qk.innerHTML='';
  items.forEach(q=>{
    const btn=document.createElement('button');btn.className='r-qbtn';btn.textContent=q;
    btn.onclick=()=>{qk.innerHTML='';handleUserMsg(q);};qk.appendChild(btn);
  });
}
async function sendMsg(){const text=inp.value.trim();if(!text||isTyping)return;inp.value='';handleUserMsg(text);}
async function handleUserMsg(text){
  if(isTyping)return;
  qk.innerHTML='';addMsg('usr',text);chatHistory.push({role:'user',content:text});
  isTyping=true;showTyping();
  const lc=text.toLowerCase();
  try{
    if(!WORKER_URL)throw new Error('no_worker');
    const res=await fetch(WORKER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:chatHistory.slice(-14)})});
    const data=await res.json();hideTyping();
    if(data.error)throw new Error(data.error.message);
    const reply=data.content?.[0]?.text||localFallback(text);
    addMsg('bot',reply);chatHistory.push({role:'assistant',content:reply});
  }catch(e){
    hideTyping();const reply=localFallback(text);
    addMsg('bot',reply);chatHistory.push({role:'assistant',content:reply});
  }
  if(lc.includes('pric')||lc.includes('\u0633\u0639\u0631')||lc.includes('\u0643\u0645')){setQuick(['\u062d\u062c\u0645 A — 4,500 \u062f\u0631\u0647\u0645','\u062d\u062c\u0645 B — 6,000 \u062f\u0631\u0647\u0645 \u2b50','\u062d\u062c\u0645 C — 8,000+','\ud83d\udcde \u0639\u0631\u0636 \u0633\u0639\u0631 \u0645\u062c\u0627\u0646\u064a']);}
  else if(lc.includes('amc')||lc.includes('\u0639\u0642\u062f')){setQuick(['\ud83d\udcb0 \u0623\u0633\u0639\u0627\u0631 AMC','\ud83d\udccb \u0645\u0627 \u064a\u0634\u0645\u0644\u0647 \u0627\u0644\u0639\u0642\u062f','\ud83d\udcde \u0637\u0644\u0628 \u0639\u0631\u0636 AMC']);}
  else{setQuick(['\ud83d\udcb0 \u0627\u0644\u0623\u0633\u0639\u0627\u0631','\ud83d\udcde \u0627\u062a\u0635\u0644 \u0628\u0646\u0627','\ud83d\udcac \u0648\u0627\u062a\u0633\u0627\u0628','\ud83d\udccb \u0639\u0642\u062f AMC']);}
  isTyping=false;
}
document.addEventListener('click',e=>{
  if(e.target.classList.contains('r-qbtn')){
    const t=e.target.textContent;
    if(t.includes('\u0627\u062a\u0635\u0644')||t.includes('\ud83d\udcde')){window.location.href='tel:+971522233989';return;}
    if(t.includes('\u0648\u0627\u062a\u0633\u0627\u0628')||t.includes('WhatsApp')){window.open('https://wa.me/971522233989','_blank');return;}
    if(t.includes('\u0639\u0631\u0636')||t.includes('AMC')){window.open('https://wa.me/971522233989?text='+encodeURIComponent('\u0645\u0631\u062d\u0628\u0627\u060c \u0623\u0648\u062f \u0639\u0631\u0636 \u0633\u0639\u0631 / Hello, I would like a free quote.'),'_blank');return;}
  }
});
setTimeout(()=>{
  const btn=document.getElementById('robin-btn');if(btn)btn.style.opacity='1';
  if(!sessionStorage.getItem('robin_seen')&&window.innerWidth>768){sessionStorage.setItem('robin_seen','1');setTimeout(()=>toggleRobin(),7000);}
},3000);

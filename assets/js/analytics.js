window.dataLayer=window.dataLayer||[];
window.gtag=window.gtag||function(){dataLayer.push(arguments);};
let ecoAdsLoaded=false;
function loadAds(){
  if(ecoAdsLoaded)return;
  ecoAdsLoaded=true;
  gtag('js',new Date());
  gtag('config','AW-11097082238');
  const s=document.createElement('script');
  s.async=true;
  s.src='https://www.googletagmanager.com/gtag/js?id=AW-11097082238';
  document.head.appendChild(s);
}
function gtagWA(){if(ecoAdsLoaded)gtag('event','conversion',{'send_to':'AW-11097082238','event_category':'engagement','event_label':'whatsapp_click'});}
function gtagQuote(){if(ecoAdsLoaded)gtag('event','conversion',{'send_to':'AW-11097082238','event_category':'lead','event_label':'quote_request'});}
function dismissCookie(accepted){
  localStorage.setItem('eco-v2-cookie',accepted?'accepted':'declined');
  const bar=document.getElementById('cookie');
  if(bar){bar.hidden=true;bar.style.display='none';}
  if(accepted)loadAds();
}
(function initCookie(){
  const choice=localStorage.getItem('eco-v2-cookie');
  if(choice){
    const bar=document.getElementById('cookie');
    if(bar){bar.hidden=true;bar.style.display='none';}
    if(choice==='accepted')loadAds();
  } else {
    const reveal=()=>{
      const bar=document.getElementById('cookie');
      if(bar){bar.hidden=false;bar.style.display='flex';}
    };
    // Consent is non-critical UI; keep it out of the first mobile paint/LCP window.
    if('requestIdleCallback' in window){
      requestIdleCallback(reveal,{timeout:5000});
    }else{
      setTimeout(reveal,4500);
    }
  }
})();

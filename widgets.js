(()=>{
'use strict';

const shell=document.querySelector('.shell');
const splashStarted=performance.now();
let dashboardRevealed=false;

function installSplash(){
 if(document.getElementById('appBootSplash'))return;
 const style=document.createElement('style');
 style.id='app-boot-splash-style';
 style.textContent=`
 #appBootSplash{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#0d0d0f;color:#f4eee8;opacity:1;visibility:visible;transition:opacity .32s ease,visibility .32s ease;font-family:Poppins,system-ui,-apple-system,sans-serif}
 #appBootSplash.hide{opacity:0;visibility:hidden;pointer-events:none}
 .app-boot-inner{display:grid;justify-items:center;gap:15px;padding:28px;text-align:center}
 .app-boot-logo{width:76px;height:76px;object-fit:contain;filter:drop-shadow(0 10px 28px rgba(0,0,0,.28));animation:bootLogo 1.8s ease-in-out infinite}
 .app-boot-title{font-size:15px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:#f4eee8}
 .app-boot-sub{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#8f8780}
 .app-boot-bar{width:150px;height:3px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.09);margin-top:4px}
 .app-boot-bar i{display:block;width:42%;height:100%;border-radius:inherit;background:#d8b08b;animation:bootBar 1.05s ease-in-out infinite}
 @keyframes bootBar{0%{transform:translateX(-110%)}55%{transform:translateX(110%)}100%{transform:translateX(260%)}}
 @keyframes bootLogo{0%,100%{transform:translateY(0);opacity:.92}50%{transform:translateY(-3px);opacity:1}}
 @media(prefers-reduced-motion:reduce){.app-boot-logo,.app-boot-bar i{animation:none}.app-boot-bar i{width:100%}}
 `;
 document.head.appendChild(style);
 const splash=document.createElement('div');
 splash.id='appBootSplash';
 splash.setAttribute('role','status');
 splash.setAttribute('aria-label','Loading Dahlman Dashboard');
 splash.innerHTML=`<div class="app-boot-inner"><img class="app-boot-logo" src="/assets/icon-192-ivory.png" alt=""><div class="app-boot-title">Dahlman Dashboard</div><div class="app-boot-sub">Loading your dashboard</div><div class="app-boot-bar"><i></i></div></div>`;
 document.body.appendChild(splash);
}
function hideDashboardDuringBoot(){
 installSplash();
 if(!shell)return;
 shell.style.visibility='hidden';
 shell.style.opacity='0';
 shell.style.transition='opacity .18s ease';
}
function revealDashboard(){
 if(dashboardRevealed)return;
 dashboardRevealed=true;
 const elapsed=performance.now()-splashStarted;
 const delay=Math.max(0,650-elapsed);
 setTimeout(()=>{
  if(shell){
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    shell.style.visibility='visible';
    shell.style.opacity='1';
    setTimeout(()=>{
     shell.style.removeProperty('visibility');
     shell.style.removeProperty('opacity');
     shell.style.removeProperty('transition');
    },220);
   }));
  }
  const splash=document.getElementById('appBootSplash');
  if(splash){splash.classList.add('hide');setTimeout(()=>splash.remove(),380)}
 },delay);
}
hideDashboardDuringBoot();
const bootFallback=setTimeout(revealDashboard,6500);

const places={norway:{lat:59.9139,lon:10.7522,tz:'Europe/Oslo'},cebu:{lat:10.3157,lon:123.8854,tz:'Asia/Manila'}};
const labels={0:['Clear','☀️'],1:['Mostly clear','🌤️'],2:['Partly cloudy','⛅'],3:['Cloudy','☁️'],45:['Fog','🌫️'],48:['Fog','🌫️'],51:['Drizzle','🌦️'],53:['Drizzle','🌦️'],55:['Heavy drizzle','🌧️'],61:['Light rain','🌦️'],63:['Rain','🌧️'],65:['Heavy rain','🌧️'],71:['Snow','🌨️'],73:['Snow','🌨️'],75:['Heavy snow','❄️'],80:['Showers','🌦️'],81:['Showers','🌧️'],82:['Heavy showers','⛈️'],95:['Thunderstorm','⛈️'],96:['Thunderstorm','⛈️'],99:['Thunderstorm','⛈️']};
function clocks(){const n=new Date();for(const [key,p] of Object.entries(places)){const el=document.getElementById(key==='norway'?'norwayClock':'cebuClock');if(el)el.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:p.tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(n)}}
async function weather(key){const p=places[key],r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,weather_code,is_day&timezone=${encodeURIComponent(p.tz)}`);if(!r.ok)throw Error('weather');const c=(await r.json()).current,[text,day]=labels[c.weather_code]||['Weather','🌡️'];const icon=c.is_day?day:(c.weather_code<=2?'🌙':day);document.getElementById(`${key}Icon`)?.replaceChildren(icon);document.getElementById(`${key}Temp`)?.replaceChildren(`${Math.round(c.temperature_2m)}°`);document.getElementById(`${key}Weather`)?.replaceChildren(text)}
async function refresh(){const s=document.getElementById('weatherUpdated');try{await Promise.all([weather('norway'),weather('cebu')]);if(s)s.textContent='Updated '+new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}catch{if(s)s.textContent='Weather unavailable'}}
function script(src){return new Promise(resolve=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=()=>resolve(true);s.onerror=()=>resolve(false);document.body.appendChild(s)})}
const renderTargetIds=['dateList','nextDate','nextCountdown','homeDaysSince'];
function ensureRenderTargets(){for(const id of renderTargetIds){if(document.getElementById(id))continue;const el=document.createElement('div');el.id=id;el.hidden=true;el.setAttribute('aria-hidden','true');el.dataset.compatTarget='true';document.body.appendChild(el)}}
function watchRenderTargets(){ensureRenderTargets();const observer=new MutationObserver(()=>ensureRenderTargets());observer.observe(document.documentElement,{childList:true,subtree:true});window.__renderTargetObserver=observer}
function installRuntimeStyles(){if(document.getElementById('runtime-style-fixes'))return;const style=document.createElement('style');style.id='runtime-style-fixes';style.textContent=`
.v8-carousel,.image-carousel,.carousel-widget,[data-carousel-widget]{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
.chart-legend{display:flex;flex-wrap:wrap;gap:8px 14px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(216,176,139,.12)}
.chart-legend span{display:inline-flex;align-items:center;gap:7px;color:var(--muted);font-size:11px;line-height:1.4}
.chart-legend i{display:block;width:8px;height:8px;border-radius:50%;flex:0 0 8px}
@media(max-width:700px){.chart-legend{display:grid;grid-template-columns:1fr 1fr;gap:9px}}
@media(max-width:430px){.chart-legend{grid-template-columns:1fr}}
`;document.head.appendChild(style)}
clocks();setInterval(clocks,1000);refresh();setInterval(refresh,900000);installRuntimeStyles();watchRenderTargets();
(async()=>{
 try{
  await script('/public-sync.js?v=32');ensureRenderTargets();
  await script('/dashboard-unified.js?v=32');ensureRenderTargets();
  await script('/goals.js?v=32');ensureRenderTargets();
  await script('/dashboard-fixes.js?v=32');ensureRenderTargets();
  await script('/daily-routine.js?v=32');ensureRenderTargets();
  await script('/gym-radar-mobile-fix.js?v=4');ensureRenderTargets();
  await script('/bm-casino.js?v=4');ensureRenderTargets();
  await script('/hero-background-picker.js?v=4');ensureRenderTargets();
  await new Promise(resolve=>setTimeout(resolve,140));
 }finally{
  clearTimeout(bootFallback);
  revealDashboard();
 }
})();
})();

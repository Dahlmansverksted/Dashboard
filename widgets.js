(()=>{
const css=`
.world-widget{margin-top:15px;padding:20px;border:1px solid rgba(255,255,255,.12);border-radius:22px;background:linear-gradient(145deg,rgba(25,25,28,.78),rgba(12,12,14,.68));backdrop-filter:blur(18px);box-shadow:0 18px 50px rgba(0,0,0,.24)}
.world-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.place-card{padding:18px;border-radius:18px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.08)}
.place-head{display:flex;align-items:center;gap:11px}.place-head .flag{font-size:29px}.place-head b,.place-head small{display:block}.place-head small{color:var(--muted);margin-top:2px}.clock{font-size:clamp(38px,5vw,64px);font-weight:900;letter-spacing:-.06em;line-height:1;margin:22px 0 14px}.weather-line{display:flex;align-items:center;gap:9px}.weather-line>span:first-child{font-size:25px}.weather-line>b{font-size:23px}.weather-line>span:last-child{color:var(--muted);font-size:13px}.weather-updated{color:var(--muted);font-size:11px}
@media(max-width:700px){.world-grid{grid-template-columns:1fr}.world-widget{padding:15px}.clock{font-size:46px}.weather-updated{display:none}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

const places={norway:{lat:59.9139,lon:10.7522,tz:'Europe/Oslo'},cebu:{lat:10.3157,lon:123.8854,tz:'Asia/Manila'}};
const weatherText={0:['Clear','☀️'],1:['Mostly clear','🌤️'],2:['Partly cloudy','⛅'],3:['Cloudy','☁️'],45:['Fog','🌫️'],48:['Fog','🌫️'],51:['Light drizzle','🌦️'],53:['Drizzle','🌦️'],55:['Heavy drizzle','🌧️'],61:['Light rain','🌦️'],63:['Rain','🌧️'],65:['Heavy rain','🌧️'],71:['Light snow','🌨️'],73:['Snow','🌨️'],75:['Heavy snow','❄️'],80:['Rain showers','🌦️'],81:['Rain showers','🌧️'],82:['Heavy showers','⛈️'],95:['Thunderstorm','⛈️'],96:['Thunderstorm','⛈️'],99:['Thunderstorm','⛈️']};
function updateClocks(){const now=new Date(),no=document.getElementById('norwayClock'),ph=document.getElementById('cebuClock');if(no)no.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:places.norway.tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);if(ph)ph.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:places.cebu.tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now)}
async function getWeather(key){const p=places[key],url=`https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,weather_code,is_day&timezone=${encodeURIComponent(p.tz)}`;const r=await fetch(url);if(!r.ok)throw new Error('Weather request failed');const j=await r.json(),c=j.current,[label,dayIcon]=weatherText[c.weather_code]||['Weather','🌡️'],icon=c.is_day?dayIcon:(c.weather_code<=2?'🌙':dayIcon),iconEl=document.getElementById(`${key}Icon`),tempEl=document.getElementById(`${key}Temp`),weatherEl=document.getElementById(`${key}Weather`);if(iconEl)iconEl.textContent=icon;if(tempEl)tempEl.textContent=`${Math.round(c.temperature_2m)}°`;if(weatherEl)weatherEl.textContent=label}
async function refreshWeather(){const status=document.getElementById('weatherUpdated');try{await Promise.all([getWeather('norway'),getWeather('cebu')]);if(status)status.textContent='Updated '+new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}catch(e){console.error(e);if(status)status.textContent='Weather unavailable'}}
updateClocks();setInterval(updateClocks,1000);refreshWeather();setInterval(refreshWeather,15*60*1000);

function addCss(href){return new Promise(resolve=>{const el=document.createElement('link');el.rel='stylesheet';el.href=href;el.onload=resolve;el.onerror=resolve;document.head.appendChild(el)})}
function addScript(src){return new Promise(resolve=>{const el=document.createElement('script');el.src=src;el.async=false;el.onload=resolve;el.onerror=resolve;document.body.appendChild(el)})}

(async()=>{
  await addScript('public-sync.js?v=20260729-1');
  await addScript('slideshow-v3.js?v=20260730-2');
  await addCss('dashboard-v4.css?v=20260730-3');
  await addScript('dashboard-v4.js?v=20260730-3');
  await addCss('dashboard-v5.css?v=20260730-1');
  await addScript('dashboard-v5.js?v=20260730-1');
  await addCss('dashboard-v6.css?v=20260731-2');
  await addScript('dashboard-v6.js?v=20260731-2');
})();
})();
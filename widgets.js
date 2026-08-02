(()=>{
'use strict';
const places={norway:{lat:59.9139,lon:10.7522,tz:'Europe/Oslo'},cebu:{lat:10.3157,lon:123.8854,tz:'Asia/Manila'}};
const labels={0:['Clear','☀️'],1:['Mostly clear','🌤️'],2:['Partly cloudy','⛅'],3:['Cloudy','☁️'],45:['Fog','🌫️'],48:['Fog','🌫️'],51:['Drizzle','🌦️'],53:['Drizzle','🌦️'],55:['Heavy drizzle','🌧️'],61:['Light rain','🌦️'],63:['Rain','🌧️'],65:['Heavy rain','🌧️'],71:['Snow','🌨️'],73:['Snow','🌨️'],75:['Heavy snow','❄️'],80:['Showers','🌦️'],81:['Showers','🌧️'],82:['Heavy showers','⛈️'],95:['Thunderstorm','⛈️'],96:['Thunderstorm','⛈️'],99:['Thunderstorm','⛈️']};
function clocks(){const n=new Date();for(const [key,p] of Object.entries(places)){const el=document.getElementById(key==='norway'?'norwayClock':'cebuClock');if(el)el.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:p.tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(n)}}
async function weather(key){const p=places[key],r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,weather_code,is_day&timezone=${encodeURIComponent(p.tz)}`);if(!r.ok)throw Error('weather');const c=(await r.json()).current,[text,day]=labels[c.weather_code]||['Weather','🌡️'];const icon=c.is_day?day:(c.weather_code<=2?'🌙':day);document.getElementById(`${key}Icon`)?.replaceChildren(icon);document.getElementById(`${key}Temp`)?.replaceChildren(`${Math.round(c.temperature_2m)}°`);document.getElementById(`${key}Weather`)?.replaceChildren(text)}
async function refresh(){const s=document.getElementById('weatherUpdated');try{await Promise.all([weather('norway'),weather('cebu')]);if(s)s.textContent='Updated '+new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}catch{if(s)s.textContent='Weather unavailable'}}
function script(src){return new Promise(resolve=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=resolve;document.body.appendChild(s)})}
function ensureRenderTargets(){for(const id of ['nextDate','nextCountdown']){if(document.getElementById(id))continue;const el=document.createElement('div');el.id=id;el.hidden=true;el.setAttribute('aria-hidden','true');el.dataset.compatTarget='true';document.body.appendChild(el)}}
function installChartStyles(){if(document.getElementById('chart-legend-fix'))return;const style=document.createElement('style');style.id='chart-legend-fix';style.textContent=`
.chart-legend{display:flex;flex-wrap:wrap;gap:8px 14px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(216,176,139,.12)}
.chart-legend span{display:inline-flex;align-items:center;gap:7px;color:var(--muted);font-size:11px;line-height:1.4}
.chart-legend i{display:block;width:8px;height:8px;border-radius:50%;flex:0 0 8px}
@media(max-width:700px){.chart-legend{display:grid;grid-template-columns:1fr 1fr;gap:9px}}
@media(max-width:430px){.chart-legend{grid-template-columns:1fr}}
`;document.head.appendChild(style)}
clocks();setInterval(clocks,1000);refresh();setInterval(refresh,900000);
(async()=>{await script('/public-sync.js?v=16');ensureRenderTargets();installChartStyles();await script('/dashboard-unified.js?v=16');await script('/goals.js?v=16')})();
})();
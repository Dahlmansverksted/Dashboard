(()=>{
'use strict';
const LOGO='/assets/icon-192-ivory.png?v=11';
const LOGO_FALLBACK='/assets/dahlmans-logo-192.png?v=11';
const PHOTOS=Array.from({length:9},(_,i)=>`/assets/background-${String(i+1).padStart(2,'0')}.jpg`);
const PAGE_TITLE='Welcome Mr. and Mrs. Dahlman';

function ensureHead(){
 document.title=PAGE_TITLE;
 const upsert=(rel,href,type)=>{let el=document.querySelector(`link[rel="${rel}"]`);if(!el){el=document.createElement('link');el.rel=rel;document.head.appendChild(el)}el.href=href;if(type)el.type=type};
 upsert('icon','/assets/favicon.ico?v=11','image/x-icon');
 upsert('apple-touch-icon','/assets/icon-192-ivory.png?v=11','image/png');
 upsert('manifest','/manifest.json?v=11');
 if(!document.getElementById('v8-critical-fixes')){
   const style=document.createElement('style');
   style.id='v8-critical-fixes';
   style.textContent=`
     .shell>aside{overflow-x:hidden!important;min-width:0!important}
     .shell>aside nav{overflow-x:hidden!important;overflow-y:auto!important;min-width:0!important;max-width:100%!important;scrollbar-width:thin}
     .shell>aside .nav{min-width:0!important;max-width:100%!important;width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important}
     .shell>aside .brand{min-width:0!important;overflow:hidden!important}
     .shell>aside .brand span{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
     .shell>aside .brand-logo{display:block!important;flex:0 0 46px!important;width:46px!important;height:46px!important;object-fit:contain!important;border-radius:12px!important;background:transparent!important}
     .v8-calendar-combined{min-height:0!important}
     .v8-calendar-combined-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}
     .v8-calendar-part{min-width:0;padding:4px 2px}
     .v8-calendar-part+.v8-calendar-part{border-left:1px solid rgba(216,176,139,.16);padding-left:20px}
     .v8-calendar-part-title{margin:0 0 10px;color:var(--oak2,#c89b73);font-size:10px;letter-spacing:.15em;font-weight:500;text-transform:uppercase}
     .v8-calendar-combined #nextCountdown{margin-top:0}
     @media(max-width:700px){
       .shell>aside .brand-logo{width:42px!important;height:42px!important;flex-basis:42px!important}
       .v8-calendar-combined-grid{grid-template-columns:1fr;gap:16px}
       .v8-calendar-part+.v8-calendar-part{border-left:0;border-top:1px solid rgba(216,176,139,.16);padding-left:2px;padding-top:18px}
     }
   `;
   document.head.appendChild(style);
 }
}
function ensureDaily(){
 if(typeof data==='undefined')return;
 data.daily=Array.isArray(data.daily)?data.daily:[];
 const title='Wash face';
 const found=data.daily.find(x=>String(x.title||'').trim().toLowerCase()==='wash face');
 if(found){found.id='daily-wash-face';found.title=title}else data.daily.push({id:'daily-wash-face',title});
}
function brand(){
 const b=document.querySelector('.brand');
 if(b){
   b.innerHTML=`<img class="brand-logo" src="${LOGO}" alt="Dahlmans Verksted"><span><strong>Dashboard</strong></span>`;
   const img=b.querySelector('.brand-logo');
   if(img)img.onerror=()=>{if(!img.dataset.fallback){img.dataset.fallback='1';img.src=LOGO_FALLBACK}};
 }
 const calc=document.querySelector('.nav[data-page="calculator"] span');if(calc)calc.textContent='Dahlmans Verksted';
 const title=document.getElementById('title');if(title)title.textContent='';
}
function removeQuickAdd(){
 const quick=document.getElementById('quick');
 if(quick)quick.remove();
}
function mergeDateIntoWeather(){
 const today=document.getElementById('today');
 const world=document.querySelector('#dashboard .world-widget');
 const textWrap=world?.querySelector('.head>div');
 if(!today||!textWrap)return;
 today.classList.add('world-date');
 if(today.parentElement!==textWrap)textWrap.insertBefore(today,textWrap.querySelector('h3')||null);
 const eyebrow=textWrap.querySelector('small');if(eyebrow)eyebrow.textContent='DATE · TIME · WEATHER';
 const heading=textWrap.querySelector('h3');if(heading)heading.textContent='Norway and Philippines';
}
function mergeCalendarWidgets(){
 const daysCard=document.querySelector('#dashboard .card.snus');
 const countdown=document.getElementById('nextCountdown');
 const countdownCard=countdown?.closest('article.card');
 if(!daysCard||!countdown||!countdownCard||daysCard===countdownCard)return;
 const head=daysCard.querySelector(':scope>.head');
 if(!head)return;
 daysCard.classList.add('v8-calendar-combined');
 const headText=head.querySelector('div');
 const eyebrow=headText?.querySelector('small');
 const heading=headText?.querySelector('h3');
 if(eyebrow)eyebrow.textContent='CALENDAR';
 if(heading)heading.textContent='Calendar';
 let viewAll=head.querySelector('[data-go="dates"]');
 if(!viewAll){
   viewAll=countdownCard.querySelector('[data-go="dates"]');
   if(viewAll)head.appendChild(viewAll);
 }
 let grid=daysCard.querySelector(':scope>.v8-calendar-combined-grid');
 if(!grid){
   grid=document.createElement('div');
   grid.className='v8-calendar-combined-grid';
   const daysPart=document.createElement('section');
   daysPart.className='v8-calendar-part v8-calendar-days';
   daysPart.innerHTML='<h4 class="v8-calendar-part-title">Days since</h4>';
   [...daysCard.children].filter(el=>el!==head&&el!==grid).forEach(el=>daysPart.appendChild(el));
   const countdownPart=document.createElement('section');
   countdownPart.className='v8-calendar-part v8-calendar-countdown';
   countdownPart.innerHTML='<h4 class="v8-calendar-part-title">Next countdown</h4>';
   countdownPart.appendChild(countdown);
   grid.append(daysPart,countdownPart);
   daysCard.appendChild(grid);
 }
 countdownCard.remove();
}
function ensureCarousel(){
 const page=document.getElementById('dashboard'),hero=page?.querySelector('.hero');if(!page||!hero)return;
 const heroTitle=hero.querySelector('h2');if(heroTitle)heroTitle.textContent='Welcome';
 let wrap=page.querySelector('.v8-home-top');
 if(!wrap){wrap=document.createElement('div');wrap.className='v8-home-top';hero.parentNode.insertBefore(wrap,hero);wrap.appendChild(hero)}
 let carousel=wrap.querySelector('.v8-carousel');
 if(!carousel){carousel=document.createElement('section');carousel.className='v8-carousel';carousel.innerHTML='<img alt="Our moments" class="active"><img alt="Our moments"><span>OUR MOMENTS</span>';wrap.appendChild(carousel);let idx=0,layer=0;const imgs=[...carousel.querySelectorAll('img')];imgs[0].src=PHOTOS[0];imgs[1].src=PHOTOS[1];PHOTOS.forEach(src=>{const i=new Image();i.src=src});setInterval(()=>{const next=(idx+1)%PHOTOS.length,incoming=imgs[1-layer],outgoing=imgs[layer];incoming.src=PHOTOS[next]+'?v=11';incoming.onload=()=>{incoming.classList.add('active');outgoing.classList.remove('active');idx=next;layer=1-layer}},12000)}
}
function mobileMenu(){
 document.querySelectorAll('.legacy-bottom-nav,.bottom-nav,#bottomNav').forEach(x=>x.remove());
 if(document.getElementById('v8MenuBtn'))return;
 const btn=document.createElement('button');btn.id='v8MenuBtn';btn.className='v8-menu-btn';btn.type='button';btn.textContent='☰';btn.setAttribute('aria-label','Open menu');
 const menu=document.createElement('div');menu.id='v8MobileMenu';menu.className='v8-mobile-menu';
 document.querySelectorAll('aside nav .nav[data-page]').forEach(n=>{const x=document.createElement('button');x.type='button';x.dataset.page=n.dataset.page;x.innerHTML=n.innerHTML;x.onclick=()=>{n.click();menu.classList.remove('open');btn.textContent='☰'};menu.appendChild(x)});
 btn.onclick=()=>{const o=menu.classList.toggle('open');btn.textContent=o?'×':'☰'};document.body.append(btn,menu);
}
function equalBudget(){
 const grid=document.getElementById('budgetExcel');if(!grid)return;grid.classList.add('v8-budget-grid');
 const panels=[...grid.children];if(panels.length>1){panels[0].classList.add('expense-panel');panels[1].classList.add('income-panel')}
}
function removeDuplicateNav(){
 document.querySelectorAll('body>nav,main+nav,.mobile-bottom-nav').forEach(el=>{if(!el.closest('aside'))el.remove()});
}
function apply(){ensureHead();ensureDaily();brand();removeQuickAdd();ensureCarousel();mergeDateIntoWeather();mergeCalendarWidgets();mobileMenu();equalBudget();removeDuplicateNav()}
const run=()=>requestAnimationFrame(apply);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
const oldRender=window.render;if(typeof oldRender==='function')window.render=function(){ensureDaily();const r=oldRender.apply(this,arguments);run();return r};
const oldMerge=window.mergeData;if(typeof oldMerge==='function')window.mergeData=function(a,b){const r=oldMerge(a,b);if(r){r.daily=Array.isArray(r.daily)?r.daily:[];if(!r.daily.some(x=>String(x.title||'').toLowerCase()==='wash face'))r.daily.push({id:'daily-wash-face',title:'Wash face'})}return r};
new MutationObserver(()=>{clearTimeout(window.__v8t);window.__v8t=setTimeout(apply,60)}).observe(document.body,{childList:true,subtree:true});
setTimeout(apply,500);setTimeout(apply,1800);
})();
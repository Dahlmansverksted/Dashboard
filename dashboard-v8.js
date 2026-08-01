(()=>{
'use strict';
const LOGO='/assets/dahlmans-logo.svg';
const PHOTOS=Array.from({length:9},(_,i)=>`/assets/background-${String(i+1).padStart(2,'0')}.jpg`);
const PAGE_TITLE='Welcome Mr. and Mrs. Dahlman';

function ensureHead(){
 document.title=PAGE_TITLE;
 const upsert=(rel,href,type)=>{let el=document.querySelector(`link[rel="${rel}"]`);if(!el){el=document.createElement('link');el.rel=rel;document.head.appendChild(el)}el.href=href;if(type)el.type=type};
 upsert('icon','/assets/dahlmans-logo-192.png?v=9','image/png');
 upsert('apple-touch-icon','/assets/dahlmans-logo-192.png?v=9');
 upsert('manifest','/manifest.json?v=9');
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
 if(b)b.innerHTML=`<img class="brand-logo" src="${LOGO}" alt="Dahlmans Verksted"><span><strong>Dashboard</strong></span>`;
 const calc=document.querySelector('.nav[data-page="calculator"] span');if(calc)calc.textContent='Dahlmans Verksted';
 const title=document.getElementById('title');if(title)title.textContent='';
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
function ensureCarousel(){
 const page=document.getElementById('dashboard'),hero=page?.querySelector('.hero');if(!page||!hero)return;
 const heroTitle=hero.querySelector('h2');if(heroTitle)heroTitle.textContent='Welcome';
 let wrap=page.querySelector('.v8-home-top');
 if(!wrap){wrap=document.createElement('div');wrap.className='v8-home-top';hero.parentNode.insertBefore(wrap,hero);wrap.appendChild(hero)}
 let carousel=wrap.querySelector('.v8-carousel');
 if(!carousel){carousel=document.createElement('section');carousel.className='v8-carousel';carousel.innerHTML='<img alt="Our moments" class="active"><img alt="Our moments"><span>OUR MOMENTS</span>';wrap.appendChild(carousel);let idx=0,layer=0;const imgs=[...carousel.querySelectorAll('img')];imgs[0].src=PHOTOS[0];imgs[1].src=PHOTOS[1];PHOTOS.forEach(src=>{const i=new Image();i.src=src});setInterval(()=>{const next=(idx+1)%PHOTOS.length,incoming=imgs[1-layer],outgoing=imgs[layer];incoming.src=PHOTOS[next]+'?v=9';incoming.onload=()=>{incoming.classList.add('active');outgoing.classList.remove('active');idx=next;layer=1-layer}},12000)}
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
function apply(){ensureHead();ensureDaily();brand();ensureCarousel();mergeDateIntoWeather();mobileMenu();equalBudget();removeDuplicateNav()}
const run=()=>requestAnimationFrame(apply);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
const oldRender=window.render;if(typeof oldRender==='function')window.render=function(){ensureDaily();const r=oldRender.apply(this,arguments);run();return r};
const oldMerge=window.mergeData;if(typeof oldMerge==='function')window.mergeData=function(a,b){const r=oldMerge(a,b);if(r){r.daily=Array.isArray(r.daily)?r.daily:[];if(!r.daily.some(x=>String(x.title||'').toLowerCase()==='wash face'))r.daily.push({id:'daily-wash-face',title:'Wash face'})}return r};
new MutationObserver(()=>{clearTimeout(window.__v8t);window.__v8t=setTimeout(apply,60)}).observe(document.body,{childList:true,subtree:true});
setTimeout(apply,500);setTimeout(apply,1800);
})();
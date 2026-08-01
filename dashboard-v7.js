(()=>{
const LOGO='assets/dahlmans-logo.svg';
const WELCOME='Welcome Mr. and Mrs. Dahlman';

function ensureWashFace(){
  if(typeof data==='undefined')return false;
  data.daily=Array.isArray(data.daily)?data.daily:[];
  const matches=data.daily.filter(x=>String(x.title||'').trim().toLowerCase()==='wash face');
  if(matches.length){
    matches[0].id='daily-wash-face';matches[0].title='Wash face';
    if(matches.length>1)data.daily=data.daily.filter((x,i)=>String(x.title||'').trim().toLowerCase()!=='wash face'||x===matches[0]);
    return false;
  }
  data.daily.push({id:'daily-wash-face',title:'Wash face'});
  return true;
}

function applyBranding(){
  document.title=WELCOME;
  let icon=document.querySelector('link[rel~="icon"]');
  if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon)}
  icon.type='image/svg+xml';icon.href=LOGO+'?v=8';
  const brand=document.querySelector('.brand');
  if(brand)brand.innerHTML=`<img src="${LOGO}" alt="Dahlmans Verksted"><span><strong>Dashboard</strong></span>`;
  const title=document.getElementById('title');if(title)title.textContent=WELCOME;
  const hero=document.querySelector('#dashboard .hero h2');if(hero)hero.textContent='GRIND NEVER STOPS';
  const calc=document.querySelector('.nav[data-page="calculator"] span');if(calc)calc.textContent='Dahlmans Verksted';
  if(typeof names!=='undefined'&&names){names.dashboard=WELCOME;names.calculator='Dahlmans Verksted'}
  ensureCarousel();installMobileMenu();
}

function ensureCarousel(){
  const dashboard=document.getElementById('dashboard'),hero=dashboard?.querySelector('.hero');
  if(!dashboard||!hero)return;
  let grid=dashboard.querySelector('.home-top-grid');
  if(!grid){grid=document.createElement('div');grid.className='home-top-grid';hero.parentNode.insertBefore(grid,hero);grid.appendChild(hero)}
  let photo=grid.querySelector('.photo-widget');
  if(!photo){
    photo=document.createElement('div');photo.className='photo-widget';
    photo.innerHTML=Array.from({length:9},(_,i)=>`<img src="assets/background-${String(i+1).padStart(2,'0')}.jpg?v=8" class="${i===0?'active':''}" alt="">`).join('')+'<div class="photo-label">OUR MOMENTS</div>';
    grid.appendChild(photo);
  }
  photo.style.display='block';photo.hidden=false;
}

function installMobileMenu(){
  if(document.getElementById('mobileMenuButton'))return;
  const b=document.createElement('button');b.id='mobileMenuButton';b.className='mobile-menu-toggle';b.type='button';b.textContent='☰';b.setAttribute('aria-label','Open navigation');
  const menu=document.createElement('div');menu.id='mobileNavMenu';menu.className='mobile-nav-menu';
  document.querySelectorAll('aside nav .nav[data-page]').forEach(n=>{const x=document.createElement('button');x.type='button';x.dataset.mobilePage=n.dataset.page;x.innerHTML=n.innerHTML;x.onclick=()=>{n.click();menu.classList.remove('open');b.textContent='☰'};menu.appendChild(x)});
  b.onclick=()=>{const open=menu.classList.toggle('open');b.textContent=open?'×':'☰'};
  document.body.append(b,menu);
}

function stabilizeDaily(){
  const added=ensureWashFace();
  if(typeof renderDaily==='function')renderDaily();
  if(added&&typeof save==='function'){
    try{save('Daily routine updated')}catch{}
  }
}

const oldRenderDaily=window.renderDaily;
if(typeof oldRenderDaily==='function')window.renderDaily=function(){ensureWashFace();return oldRenderDaily()};
const oldRender=window.render;
if(typeof oldRender==='function')window.render=function(){ensureWashFace();const result=oldRender();requestAnimationFrame(()=>{applyBranding();ensureWashFace();if(typeof oldRenderDaily==='function')oldRenderDaily()});return result};
const oldNav=window.nav;
if(typeof oldNav==='function')window.nav=function(p){oldNav(p);setTimeout(()=>{applyBranding();const t=document.getElementById('title');if(t)t.textContent=p==='dashboard'?WELCOME:(p==='calculator'?'Dahlmans Verksted':t.textContent)},0)};

applyBranding();stabilizeDaily();
setTimeout(()=>{applyBranding();stabilizeDaily()},400);
setTimeout(()=>{applyBranding();stabilizeDaily()},1600);
})();
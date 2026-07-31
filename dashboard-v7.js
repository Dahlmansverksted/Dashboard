(()=>{
const LOGO='assets/dahlmans-logo.svg';
function apply(){
 document.title='Dashboard';
 let icon=document.querySelector('link[rel~="icon"]');if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon)}icon.type='image/svg+xml';icon.href=LOGO+'?v=7';
 const brand=document.querySelector('.brand');if(brand){brand.innerHTML=`<img src="${LOGO}" alt="Dahlmans Verksted"><span><strong>Dashboard</strong></span>`}
 const title=document.getElementById('title');if(title)title.textContent='';
 const hero=document.querySelector('#dashboard .hero h2');if(hero)hero.textContent='GRIND NEVER STOPS';
 const calc=document.querySelector('.nav[data-page="calculator"] span');if(calc)calc.textContent='Dahlmans Verksted';
 if(typeof names!=='undefined'&&names){names.dashboard='';names.calculator='Dahlmans Verksted'}
 installMobileMenu();
}
function installMobileMenu(){
 if(document.getElementById('mobileMenuButton'))return;
 const b=document.createElement('button');b.id='mobileMenuButton';b.className='mobile-menu-toggle';b.type='button';b.textContent='☰';b.setAttribute('aria-label','Open navigation');
 const menu=document.createElement('div');menu.id='mobileNavMenu';menu.className='mobile-nav-menu';
 document.querySelectorAll('aside nav .nav[data-page]').forEach(n=>{const x=document.createElement('button');x.type='button';x.dataset.mobilePage=n.dataset.page;x.innerHTML=n.innerHTML;x.onclick=()=>{n.click();menu.classList.remove('open');b.textContent='☰'};menu.appendChild(x)});
 b.onclick=()=>{const open=menu.classList.toggle('open');b.textContent=open?'×':'☰'};
 document.body.append(b,menu);
}
const oldNav=window.nav;try{nav=function(p){oldNav(p);setTimeout(()=>{const t=document.getElementById('title');if(t)t.textContent=p==='dashboard'?'':(p==='calculator'?'Dahlmans Verksted':t.textContent)},0)}}catch{}
apply();setTimeout(apply,300);setTimeout(apply,1200);
})();
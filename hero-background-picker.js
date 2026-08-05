(()=>{
'use strict';

const IMAGES=Array.from({length:9},(_,i)=>`/assets/background-${String(i+1).padStart(2,'0')}.jpg`);
const DEFAULT_IMAGE=IMAGES[0];
let applying=false;

function currentImage(){
 const chosen=typeof data==='object'&&data?data.heroBackground:null;
 return IMAGES.includes(chosen)?chosen:DEFAULT_IMAGE;
}

function removeCarousel(){
 document.querySelectorAll('.v8-carousel,.image-carousel,.carousel-widget,[data-carousel-widget]').forEach(el=>el.remove());
}

function ensurePicker(){
 let dialog=document.getElementById('heroBackgroundDialog');
 if(dialog)return dialog;
 dialog=document.createElement('dialog');
 dialog.id='heroBackgroundDialog';
 dialog.className='hero-background-dialog';
 dialog.innerHTML=`
  <form method="dialog" class="hero-background-form">
   <div class="modal-head"><div><small>WELCOME BACKGROUND</small><h3>Choose a photo</h3></div><button value="cancel" aria-label="Close">×</button></div>
   <div class="hero-background-grid">
    ${IMAGES.map((src,i)=>`<button type="button" class="hero-background-option" data-hero-image="${src}" aria-label="Use background ${i+1}"><img src="${src}" alt="Background ${i+1}" loading="lazy"><span>Photo ${i+1}</span></button>`).join('')}
   </div>
  </form>`;
 document.body.appendChild(dialog);
 dialog.addEventListener('click',event=>{
  const option=event.target.closest('[data-hero-image]');
  if(!option)return;
  const src=option.dataset.heroImage;
  if(typeof data==='object'&&data){
   data.heroBackground=src;
   if(typeof save==='function')save('Welcome background changed');
   else localStorage.setItem('dahlman_hero_background',src);
  }
  applyHero();
  dialog.close();
 });
 return dialog;
}

function ensureButton(hero){
 let button=hero.querySelector('#changeHeroBackground');
 if(button)return button;
 button=document.createElement('button');
 button.id='changeHeroBackground';
 button.type='button';
 button.className='hero-background-change';
 button.textContent='Change background';
 button.addEventListener('click',event=>{
  event.preventDefault();event.stopPropagation();
  const dialog=ensurePicker();
  dialog.querySelectorAll('[data-hero-image]').forEach(option=>option.classList.toggle('selected',option.dataset.heroImage===currentImage()));
  dialog.showModal();
 });
 hero.appendChild(button);
 return button;
}

function applyHero(){
 if(applying)return;
 applying=true;
 try{
  removeCarousel();
  const hero=document.querySelector('#dashboard .hero');
  if(!hero)return;
  let src=currentImage();
  if(typeof data==='object'&&data&&!data.heroBackground){
   const legacy=localStorage.getItem('dahlman_hero_background');
   if(IMAGES.includes(legacy)){data.heroBackground=legacy;src=legacy;try{if(typeof save==='function')save()}catch{}}
  }
  hero.classList.add('static-welcome-hero');
  hero.style.setProperty('--welcome-image',`url("${src}")`);
  ensureButton(hero);
  ensurePicker();
 }finally{applying=false}
}

function installStyles(){
 if(document.getElementById('hero-background-picker-style'))return;
 const style=document.createElement('style');
 style.id='hero-background-picker-style';
 style.textContent=`
 .v8-carousel,.image-carousel,.carousel-widget,[data-carousel-widget]{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
 #dashboard .static-welcome-hero{position:relative!important;isolation:isolate;overflow:hidden;min-height:340px!important;padding:38px 42px!important;display:flex!important;align-items:flex-end!important;background-image:linear-gradient(90deg,rgba(13,13,14,.82) 0%,rgba(13,13,14,.42) 55%,rgba(13,13,14,.20) 100%),var(--welcome-image)!important;background-size:cover!important;background-position:center 42%!important;background-repeat:no-repeat!important}
 #dashboard .static-welcome-hero::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.04) 20%,rgba(0,0,0,.48) 100%);pointer-events:none}
 #dashboard .static-welcome-hero>div{position:relative;z-index:1;max-width:min(700px,72%)}
 #dashboard .static-welcome-hero h2{font-size:clamp(32px,4.4vw,64px)!important;line-height:1!important;margin:.18em 0 .35em!important}
 #dashboard .static-welcome-hero .hero-stats{max-width:680px}
 .hero-background-change{position:absolute;right:22px;bottom:22px;z-index:3;padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.24);background:rgba(12,12,13,.58);color:#fff;backdrop-filter:blur(12px);box-shadow:0 8px 24px rgba(0,0,0,.18);font:inherit;font-size:11px;cursor:pointer}
 .hero-background-change:hover{background:rgba(12,12,13,.78)}
 .hero-background-dialog{width:min(760px,calc(100vw - 24px));max-height:min(82dvh,760px);padding:0;border:1px solid rgba(216,176,139,.18);border-radius:22px;background:#171719;color:#f5f1ec;box-shadow:0 28px 80px rgba(0,0,0,.45);overflow:hidden}
 .hero-background-dialog::backdrop{background:rgba(0,0,0,.68);backdrop-filter:blur(5px)}
 .hero-background-form{padding:18px;overflow:auto;max-height:82dvh}
 .hero-background-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
 .hero-background-option{position:relative;display:block;padding:0;overflow:hidden;border-radius:15px;border:2px solid transparent;background:#222225;color:#fff;cursor:pointer;aspect-ratio:16/10}
 .hero-background-option img{width:100%;height:100%;object-fit:cover;display:block}
 .hero-background-option span{position:absolute;left:8px;bottom:8px;padding:4px 7px;border-radius:8px;background:rgba(0,0,0,.58);font-size:10px}
 .hero-background-option.selected{border-color:#d8b08b;box-shadow:0 0 0 3px rgba(216,176,139,.15)}
 @media(max-width:800px){#dashboard .static-welcome-hero{min-height:300px!important;padding:30px!important}#dashboard .static-welcome-hero>div{max-width:78%}}
 @media(max-width:650px){#dashboard .static-welcome-hero{min-height:260px!important;padding:24px 18px 68px!important;background-position:center!important}#dashboard .static-welcome-hero>div{max-width:100%}.hero-background-change{right:14px;bottom:14px}.hero-background-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
 `;
 document.head.appendChild(style);
}

installStyles();
removeCarousel();
applyHero();
const observer=new MutationObserver(()=>{removeCarousel();clearTimeout(window.__heroPickerTimer);window.__heroPickerTimer=setTimeout(applyHero,20)});
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('resize',applyHero);
})();

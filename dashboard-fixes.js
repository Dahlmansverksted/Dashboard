(()=>{
'use strict';

const WASH_FACE={id:'daily-wash-face',title:'Wash face'};
const GROUPS=['Chest','Back','Shoulders','Biceps','Triceps','Other'];
const MUSCLES={
 'Bench Press':'Chest','Incline Dumbbell Press':'Chest',
 'Pullups':'Back','Cable Row':'Back',
 'Lateral Raise':'Shoulders','Overhead Barbell Press':'Shoulders',
 'Bicep Cable Curl':'Biceps','Bicep Barbell Curl':'Biceps','Bicep Dumbbell Curl':'Biceps','Cable Curl':'Biceps',
 'Tricep Cable Pushdown':'Triceps','Overhead Extension Bumper':'Triceps','Cable Pressdown':'Triceps'
};

function ensureWashFace(target=data){
 target.daily=Array.isArray(target.daily)?target.daily:[];
 const matches=target.daily.filter(x=>String(x?.title||'').trim().toLowerCase()==='wash face');
 let changed=false;
 if(!matches.length){target.daily.push({...WASH_FACE});changed=true}
 else{
  const keep=matches[0];
  if(keep.id!==WASH_FACE.id||keep.title!==WASH_FACE.title){keep.id=WASH_FACE.id;keep.title=WASH_FACE.title;changed=true}
  if(matches.length>1){target.daily=target.daily.filter(x=>x===keep||String(x?.title||'').trim().toLowerCase()!=='wash face');changed=true}
 }
 return changed;
}

function clearLegacyVersion(){
 try{
  ['dahlman_dashboard_v1','dahlman_dashboard_v2','dahlman_dashboard'].forEach(k=>localStorage.removeItem(k));
  if('caches' in window)caches.keys().then(keys=>Promise.all(keys.filter(k=>/dashboard|dahlman/i.test(k)).map(k=>caches.delete(k))));
  if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister()));
 }catch(e){console.warn('Legacy cleanup skipped',e)}
}

function installStyles(){
 if(document.getElementById('dashboard-fixes-style'))return;
 const s=document.createElement('style');s.id='dashboard-fixes-style';s.textContent=`
 body{background:radial-gradient(circle at 76% 2%,rgba(216,176,139,.34),transparent 38%),radial-gradient(circle at 12% 88%,rgba(155,105,68,.28),transparent 43%),#30251e!important}
 #backgroundSlideshow{background:radial-gradient(circle at 70% 0%,rgba(216,176,139,.30),transparent 42%),#30251e!important}
 .bg-overlay{background:linear-gradient(90deg,rgba(18,14,12,.42) 0,rgba(35,27,22,.25) 42%,rgba(43,32,26,.18) 72%,rgba(24,18,15,.34) 100%)!important}
 main{background:linear-gradient(135deg,rgba(67,49,38,.08),rgba(216,176,139,.025))}
 .muscle-card .muscle-chart-wrap{display:block!important;text-align:center}
 #muscleGroupChart{display:block;width:min(100%,620px)!important;height:auto!important;margin:8px auto 0}
 #muscleLegend{display:none!important}
 #dailyList{display:grid;gap:8px}
 .daily-action{width:100%;display:grid;grid-template-columns:22px minmax(0,1fr);gap:11px;align-items:center;text-align:left;padding:11px 12px;border:1px solid rgba(216,176,139,.13);border-radius:11px;background:rgba(247,243,238,.025);color:inherit;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-tap-highlight-color:transparent;transition:border-color .15s ease,background .15s ease,transform .08s ease}
 .daily-action:hover{border-color:rgba(216,176,139,.3);background:rgba(247,243,238,.045)}
 .daily-action:active{transform:scale(.995)}
 .daily-action .daily-box{width:20px;height:20px;border:1px solid rgba(247,243,238,.35);border-radius:6px;display:grid;place-items:center;line-height:1;font-size:13px;color:#17120f}
 .daily-action.done{color:var(--muted)}
 .daily-action.done .daily-box{background:var(--oak);border-color:var(--oak)}
 .daily-action.done .daily-box::after{content:'✓';font-weight:700}
 .daily-action.done .daily-label{text-decoration:line-through}
 @media(max-width:700px){.bg-overlay{background:rgba(28,21,17,.34)!important}.daily-action{min-height:46px}}
 `;document.head.appendChild(s);
}

function renderDailyStable(){
 ensureWashFace();
 const list=document.getElementById('dailyList');
 if(!list)return;
 const k=day();
 data.dailyDone[k]=Array.isArray(data.dailyDone[k])?data.dailyDone[k]:[];
 const done=data.dailyDone[k];
 list.innerHTML=data.daily.map(item=>{
  const completed=done.includes(item.id);
  return `<button type="button" class="daily-action ${completed?'done':''}" data-daily-action="${esc(item.id)}" aria-pressed="${completed}"><span class="daily-box" aria-hidden="true"></span><span class="daily-label">${esc(item.title)}</span></button>`;
 }).join('');
 const completedCount=data.daily.filter(item=>done.includes(item.id)).length;
 const progress=document.getElementById('dailyProgress');
 const count=document.getElementById('dailyCount');
 if(progress)progress.style.width=(data.daily.length?completedCount/data.daily.length*100:0)+'%';
 if(count)count.textContent=`${completedCount}/${data.daily.length}`;
}

let dailyBusy=false;
function toggleDailyButton(event){
 const button=event.target.closest('[data-daily-action]');
 if(!button||dailyBusy)return;
 event.preventDefault();
 event.stopPropagation();
 const id=button.dataset.dailyAction,k=day();
 data.dailyDone[k]=Array.isArray(data.dailyDone[k])?data.dailyDone[k]:[];
 const isDone=data.dailyDone[k].includes(id);
 data.dailyDone[k]=isDone?data.dailyDone[k].filter(x=>x!==id):[...new Set([...data.dailyDone[k],id])];
 button.classList.toggle('done',!isDone);
 button.setAttribute('aria-pressed',String(!isDone));
 const completedCount=data.daily.filter(item=>data.dailyDone[k].includes(item.id)).length;
 const progress=document.getElementById('dailyProgress');
 const count=document.getElementById('dailyCount');
 if(progress)progress.style.width=(data.daily.length?completedCount/data.daily.length*100:0)+'%';
 if(count)count.textContent=`${completedCount}/${data.daily.length}`;
 localStorage.setItem(KEY,JSON.stringify(data));
 dailyBusy=true;
 setTimeout(()=>{dailyBusy=false},120);
 if(typeof save==='function')save();
}

document.addEventListener('click',toggleDailyButton,true);

function muscleValues(){
 const totals=Object.fromEntries(GROUPS.map(g=>[g,0]));
 (data.workouts||[]).forEach(w=>(w.exercises||[]).forEach(e=>{
  const group=MUSCLES[e.name]||'Other';
  totals[group]+=Math.max(1,(e.sets||[]).length);
 }));
 return GROUPS.map(g=>totals[g]);
}
function point(cx,cy,r,index,count){const a=-Math.PI/2+index*Math.PI*2/count;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r]}
function polygon(ctx,pts){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath()}
function drawRadar(){
 const canvas=document.getElementById('muscleGroupChart');if(!canvas)return;
 const card=document.getElementById('muscleGroupCard');
 if(card){const small=card.querySelector('.head small'),title=card.querySelector('.head h3');if(small)small.textContent='TRAINING DISTRIBUTION';if(title)title.textContent='Muscle group balance'}
 const values=muscleValues(),max=Math.max(1,...values),dpr=devicePixelRatio||1;
 const cssW=Math.max(320,Math.min(canvas.parentElement?.clientWidth||620,620)),cssH=Math.round(cssW*.76);
 canvas.width=cssW*dpr;canvas.height=cssH*dpr;canvas.style.aspectRatio=`${cssW}/${cssH}`;
 const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,cssW,cssH);
 const cx=cssW/2,cy=cssH/2+5,r=Math.min(cssW,cssH)*.31,n=GROUPS.length;
 c.lineWidth=1;c.strokeStyle='rgba(216,176,139,.22)';
 for(let level=1;level<=5;level++){const rr=r*level/5;polygon(c,GROUPS.map((_,i)=>point(cx,cy,rr,i,n)));c.stroke()}
 c.strokeStyle='rgba(216,176,139,.13)';GROUPS.forEach((_,i)=>{const p=point(cx,cy,r,i,n);c.beginPath();c.moveTo(cx,cy);c.lineTo(...p);c.stroke()});
 const dataPts=values.map((v,i)=>point(cx,cy,r*(v/max),i,n));polygon(c,dataPts);c.fillStyle='rgba(216,176,139,.24)';c.fill();c.strokeStyle='#d8b08b';c.lineWidth=3;c.stroke();
 dataPts.forEach(p=>{c.beginPath();c.arc(p[0],p[1],4,0,Math.PI*2);c.fillStyle='#f0c79f';c.fill()});
 c.font=`500 ${Math.max(11,Math.round(cssW/48))}px Poppins, sans-serif`;c.fillStyle='#f7f3ee';c.textBaseline='middle';
 GROUPS.forEach((name,i)=>{const p=point(cx,cy,r+34,i,n),v=values[i],a=-Math.PI/2+i*Math.PI*2/n;c.textAlign=Math.cos(a)>.25?'left':Math.cos(a)<-.25?'right':'center';c.fillText(`${name} ${v}`,p[0],p[1])});
 if(!values.some(Boolean)){c.textAlign='center';c.fillStyle='#b8aea4';c.font='14px Poppins, sans-serif';c.fillText('No workout data yet',cx,cy)}
}

function applyFixes(){
 const changed=ensureWashFace();
 if(changed)localStorage.setItem(KEY,JSON.stringify(data));
 renderDailyStable();
 drawRadar();
}

clearLegacyVersion();installStyles();
if(typeof mergeData==='function'){
 const previousMergeData=mergeData;
 mergeData=function(a,b){const out=previousMergeData(a,b);ensureWashFace(out);return out};
}
ensureWashFace();
const originalRenderDaily=typeof renderDaily==='function'?renderDaily:null;
renderDaily=renderDailyStable;
if(typeof render==='function'){
 const previousRender=render;
 render=function(){ensureWashFace();const result=previousRender.apply(this,arguments);requestAnimationFrame(()=>requestAnimationFrame(applyFixes));return result};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(applyFixes,50));else setTimeout(applyFixes,50);
setTimeout(applyFixes,500);setTimeout(applyFixes,1800);
addEventListener('resize',()=>{clearTimeout(window.__radarResize);window.__radarResize=setTimeout(drawRadar,140)});
})();
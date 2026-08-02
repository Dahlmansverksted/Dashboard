(()=>{
'use strict';

const ROUTINE_ITEMS=[
 {id:'brush-teeth',title:'Brush teeth'},
 {id:'tell-janelle',title:'Tell Janelle she is beautiful'},
 {id:'eat-protein',title:'Eat enough protein'},
 {id:'exercise',title:'Exercise'},
 {id:'productive',title:'Do something productive'},
 {id:'wash-face',title:'Wash face'}
];
const OSLO_TZ='Europe/Oslo';
let lastOsloDate='';
let midnightTimer=null;
let saveLock=false;

function osloDate(now=new Date()){
 return new Intl.DateTimeFormat('en-CA',{
  timeZone:OSLO_TZ,year:'numeric',month:'2-digit',day:'2-digit'
 }).format(now);
}
function freshRoutine(date=osloDate()){
 return {date,items:ROUTINE_ITEMS.map(x=>({...x,done:false})),history:{}};
}
function normalizeRoutine(){
 const today=osloDate();
 let routine=data.dailyRoutine;
 if(!routine||typeof routine!=='object'||!Array.isArray(routine.items))routine=freshRoutine(today);
 routine.history=routine.history&&typeof routine.history==='object'?routine.history:{};
 if(routine.date!==today){
  if(routine.date&&Array.isArray(routine.items)){
   routine.history[routine.date]=routine.items.filter(x=>x.done).map(x=>x.id);
  }
  routine.date=today;
  routine.items=ROUTINE_ITEMS.map(x=>({...x,done:false}));
 }
 const oldById=new Map(routine.items.map(x=>[x.id,x]));
 routine.items=ROUTINE_ITEMS.map(base=>({...base,done:Boolean(oldById.get(base.id)?.done)}));
 data.dailyRoutine=routine;
 lastOsloDate=today;
 return routine;
}
function installStyle(){
 if(document.getElementById('daily-routine-style'))return;
 const style=document.createElement('style');
 style.id='daily-routine-style';
 style.textContent=`
 #dailyList{display:grid;gap:9px}
 .daily-routine-item{width:100%;display:grid;grid-template-columns:22px minmax(0,1fr);align-items:center;gap:11px;padding:11px 12px;border:1px solid rgba(216,176,139,.14);border-radius:12px;background:rgba(247,243,238,.035);color:var(--text);font:inherit;text-align:left;cursor:pointer;touch-action:manipulation;transition:border-color .14s ease,background .14s ease,transform .08s ease}
 .daily-routine-item:hover{border-color:rgba(216,176,139,.32);background:rgba(247,243,238,.06)}
 .daily-routine-item:active{transform:scale(.992)}
 .daily-routine-box{width:21px;height:21px;border:1px solid rgba(247,243,238,.34);border-radius:7px;display:grid;place-items:center;color:#17120f;font-size:13px;font-weight:700;transition:.14s ease}
 .daily-routine-item.done{color:var(--muted)}
 .daily-routine-item.done .daily-routine-box{background:var(--oak);border-color:var(--oak)}
 .daily-routine-item.done .daily-routine-title{text-decoration:line-through}
 .daily-routine-date{margin-top:11px;color:var(--muted);font-size:10px;letter-spacing:.08em;text-transform:uppercase}
 `;
 document.head.appendChild(style);
}
function renderRoutine(){
 const list=document.getElementById('dailyList');
 if(!list)return;
 const routine=normalizeRoutine();
 const done=routine.items.filter(x=>x.done).length;
 list.innerHTML=routine.items.map(item=>`<button type="button" class="daily-routine-item ${item.done?'done':''}" data-routine-item="${item.id}" aria-pressed="${item.done}"><span class="daily-routine-box">${item.done?'✓':''}</span><span class="daily-routine-title">${esc(item.title)}</span></button>`).join('')+`<div class="daily-routine-date">Resets at midnight · Norway time</div>`;
 const progress=document.getElementById('dailyProgress');if(progress)progress.style.width=`${done/routine.items.length*100}%`;
 const count=document.getElementById('dailyCount');if(count)count.textContent=`${done}/${routine.items.length}`;
}
function persist(message){
 try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}
 renderRoutine();
 if(typeof renderStatistics==='function')renderStatistics();
 if(saveLock)return;
 saveLock=true;
 try{if(typeof save==='function')save(message)}finally{setTimeout(()=>{saveLock=false},80)}
}
function toggle(id){
 const routine=normalizeRoutine(),item=routine.items.find(x=>x.id===id);if(!item)return;
 item.done=!item.done;
 persist();
}
function historyRows(){
 const routine=normalizeRoutine(),rows={...routine.history,[routine.date]:routine.items.filter(x=>x.done).map(x=>x.id)};
 return rows;
}
function routineStats(){
 const rows=historyRows(),dates=Object.keys(rows),total=Math.max(1,dates.length);
 return ROUTINE_ITEMS.map(item=>{const n=dates.filter(date=>(rows[date]||[]).includes(item.id)).length;return{title:item.title,n,pct:Math.round(n/total*100)}});
}
function installStatistics(){
 window.habitStats=routineStats;
 window.renderStatistics=function(){
  const completed=(data.tasks||[]).filter(x=>x.done).length,habits=routineStats(),days=Object.keys(historyRows()).length;
  const avg=days?Math.round(habits.reduce((sum,x)=>sum+x.pct,0)/habits.length):0;
  const grid=document.getElementById('statisticsGrid');if(grid)grid.innerHTML=`<article class="stat-tile"><small>WORKOUTS</small><b>${(data.workouts||[]).length}</b></article><article class="stat-tile"><small>TASKS DONE</small><b>${completed}</b></article><article class="stat-tile"><small>DAILY AVG</small><b>${avg}%</b></article><article class="stat-tile"><small>BUDGET ENTRIES</small><b>${(data.budget||[]).length}</b></article>`;
  const box=document.getElementById('habitStats');if(box)box.innerHTML=habits.map(x=>`<div class="habit-stat"><b>${esc(x.title)}</b><div class="habit-bar"><i style="width:${x.pct}%"></i></div><span>${x.n}/${days} · ${x.pct}%</span></div>`).join('');
 };
}
function scheduleMidnightCheck(){
 clearInterval(midnightTimer);
 midnightTimer=setInterval(()=>{
  const current=osloDate();
  if(current!==lastOsloDate){normalizeRoutine();persist('Daily Routine reset for a new day')}
 },15000);
}
function mergeRoutine(local,remote){
 const a=local?.dailyRoutine,b=remote?.dailyRoutine;
 if(!a)return b;if(!b)return a;
 if(a.date!==b.date)return a.date>b.date?a:b;
 const byId=new Map(ROUTINE_ITEMS.map(x=>[x.id,{...x,done:false}]));
 for(const source of [a.items||[],b.items||[]])for(const item of source){if(byId.has(item.id)&&item.done)byId.get(item.id).done=true}
 return {date:a.date,items:[...byId.values()],history:{...(a.history||{}),...(b.history||{})}};
}
function installMerge(){
 if(typeof mergeData!=='function'||mergeData.__dailyRoutineWrapped)return;
 const previous=mergeData;
 const wrapped=function(a,b){const out=previous(a,b);out.dailyRoutine=mergeRoutine(a,b);return out};
 wrapped.__dailyRoutineWrapped=true;mergeData=wrapped;
}
function removeLegacyState(){
 delete data.daily;
 delete data.dailyDone;
}
function start(){
 installStyle();installMerge();normalizeRoutine();removeLegacyState();installStatistics();
 window.renderDaily=renderRoutine;
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-routine-item]');if(!button)return;
  event.preventDefault();event.stopPropagation();toggle(button.dataset.routineItem);
 },true);
 const previousRender=window.render;
 if(typeof previousRender==='function')window.render=function(){
  // Temporary compatibility values keep the old renderer harmless while it runs.
  data.daily=[];data.dailyDone={};
  const result=previousRender.apply(this,arguments);
  removeLegacyState();
  renderRoutine();renderStatistics();
  return result;
 };
 renderRoutine();renderStatistics();scheduleMidnightCheck();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&osloDate()!==lastOsloDate){normalizeRoutine();persist()}});
}

start();
})();

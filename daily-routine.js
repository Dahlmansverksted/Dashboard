(()=>{
'use strict';

const STORAGE_KEY='dahlman_daily_routine_oslo_v1';
const OSLO_TZ='Europe/Oslo';
const ITEMS=[
 {id:'brush-teeth',title:'Brush teeth'},
 {id:'tell-janelle',title:'Tell Janelle she is beautiful'},
 {id:'eat-protein',title:'Eat enough protein'},
 {id:'exercise',title:'Exercise'},
 {id:'productive',title:'Do something productive'},
 {id:'wash-face',title:'Wash face'}
];
let state=null;
let lastDate='';

function osloDate(now=new Date()){
 return new Intl.DateTimeFormat('en-CA',{timeZone:OSLO_TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
function blank(date=osloDate()){
 return {date,done:[],history:{}};
}
function load(){
 try{
  const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY));
  return parsed&&typeof parsed==='object'?parsed:blank();
 }catch{return blank()}
}
function normalize(){
 const today=osloDate();
 state=state&&typeof state==='object'?state:load();
 state.done=Array.isArray(state.done)?state.done.filter(id=>ITEMS.some(x=>x.id===id)):[];
 state.history=state.history&&typeof state.history==='object'?state.history:{};
 if(state.date!==today){
  if(state.date)state.history[state.date]=[...new Set(state.done)];
  state.date=today;
  state.done=[];
 }
 lastDate=today;
 return state;
}
function store(){
 normalize();
 localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}
function installStyles(){
 if(document.getElementById('daily-routine-style'))return;
 const style=document.createElement('style');
 style.id='daily-routine-style';
 style.textContent=`
 #dailyList{display:grid;gap:9px}
 .daily-routine-item{appearance:none;width:100%;display:grid;grid-template-columns:22px minmax(0,1fr);align-items:center;gap:11px;padding:12px;border:1px solid rgba(216,176,139,.14);border-radius:12px;background:rgba(247,243,238,.035);color:var(--text);font:inherit;text-align:left;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-tap-highlight-color:transparent;transition:border-color .12s ease,background .12s ease,transform .06s ease}
 .daily-routine-item:hover{border-color:rgba(216,176,139,.32);background:rgba(247,243,238,.06)}
 .daily-routine-item:active{transform:scale(.992)}
 .daily-routine-box{width:21px;height:21px;border:1px solid rgba(247,243,238,.34);border-radius:7px;display:grid;place-items:center;color:#17120f;font-size:13px;font-weight:700}
 .daily-routine-item.done{color:var(--muted)}
 .daily-routine-item.done .daily-routine-box{background:var(--oak);border-color:var(--oak)}
 .daily-routine-item.done .daily-routine-title{text-decoration:line-through}
 .daily-routine-date{margin-top:8px;color:var(--muted);font-size:10px;letter-spacing:.08em;text-transform:uppercase}
 `;
 document.head.appendChild(style);
}
function renderRoutine(){
 const list=document.getElementById('dailyList');
 if(!list)return;
 normalize();
 const doneSet=new Set(state.done);
 list.innerHTML=ITEMS.map(item=>{
  const done=doneSet.has(item.id);
  return `<button type="button" class="daily-routine-item ${done?'done':''}" data-new-daily="${item.id}" aria-pressed="${done}"><span class="daily-routine-box">${done?'✓':''}</span><span class="daily-routine-title">${item.title}</span></button>`;
 }).join('')+'<div class="daily-routine-date">Resets at midnight · Norway time</div>';
 const count=state.done.length;
 const progress=document.getElementById('dailyProgress');
 if(progress)progress.style.width=`${count/ITEMS.length*100}%`;
 const counter=document.getElementById('dailyCount');
 if(counter)counter.textContent=`${count}/${ITEMS.length}`;
}
function toggle(id){
 normalize();
 const set=new Set(state.done);
 set.has(id)?set.delete(id):set.add(id);
 state.done=[...set];
 store();
 renderRoutine();
}
function stats(){
 normalize();
 const rows={...state.history,[state.date]:state.done};
 const dates=Object.keys(rows);
 const total=Math.max(1,dates.length);
 return ITEMS.map(item=>{
  const n=dates.filter(date=>(rows[date]||[]).includes(item.id)).length;
  return {title:item.title,n,pct:Math.round(n/total*100)};
 });
}
function renderRoutineStatistics(){
 const habits=stats();
 const days=Math.max(1,Object.keys({...state.history,[state.date]:state.done}).length);
 const avg=Math.round(habits.reduce((sum,x)=>sum+x.pct,0)/habits.length);
 const grid=document.getElementById('statisticsGrid');
 if(grid)grid.innerHTML=`<article class="stat-tile"><small>WORKOUTS</small><b>${(window.data?.workouts||[]).length}</b></article><article class="stat-tile"><small>TASKS DONE</small><b>${(window.data?.tasks||[]).filter(x=>x.done).length}</b></article><article class="stat-tile"><small>DAILY AVG</small><b>${avg}%</b></article><article class="stat-tile"><small>BUDGET ENTRIES</small><b>${(window.data?.budget||[]).length}</b></article>`;
 const box=document.getElementById('habitStats');
 if(box)box.innerHTML=habits.map(x=>`<div class="habit-stat"><b>${x.title}</b><div class="habit-bar"><i style="width:${x.pct}%"></i></div><span>${x.n}/${days} · ${x.pct}%</span></div>`).join('');
}

installStyles();
state=load();
normalize();
store();

// Replace the legacy renderer completely. No old Daily state is read or written.
window.renderDaily=renderRoutine;
try{renderDaily=renderRoutine}catch{}
window.habitStats=stats;

// Keep full-app renders harmless: they may call renderDaily, which now only redraws this widget.
const oldRenderStatistics=window.renderStatistics;
window.renderStatistics=renderRoutineStatistics;
try{renderStatistics=renderRoutineStatistics}catch{}

document.addEventListener('click',event=>{
 const button=event.target.closest('[data-new-daily]');
 if(!button)return;
 event.stopImmediatePropagation();
 toggle(button.dataset.newDaily);
},true);

renderRoutine();
renderRoutineStatistics();

setInterval(()=>{
 if(osloDate()!==lastDate){normalize();store();renderRoutine();renderRoutineStatistics()}
},10000);
document.addEventListener('visibilitychange',()=>{
 if(!document.hidden){normalize();store();renderRoutine();renderRoutineStatistics()}
});
window.addEventListener('focus',()=>{normalize();store();renderRoutine();renderRoutineStatistics()});
})();
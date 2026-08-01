(()=>{
'use strict';

const DAY_MS=86400000;
const startOfToday=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate(),12)};
const safeDate=s=>new Date(`${s}T12:00:00`);
const wholeDaysBetween=(a,b)=>Math.max(0,Math.floor((b-a)/DAY_MS));
const nextAnnualDate=s=>{const birth=safeDate(s),today=startOfToday();let next=new Date(today.getFullYear(),birth.getMonth(),birth.getDate(),12);if(next<today)next.setFullYear(next.getFullYear()+1);return next};
const ageOnDate=(birth,today=startOfToday())=>{let age=today.getFullYear()-birth.getFullYear();const before=today.getMonth()<birth.getMonth()||(today.getMonth()===birth.getMonth()&&today.getDate()<birth.getDate());return age-(before?1:0)};
const detail=(label,value,extra='')=>`<div class="v9-detail-row ${extra}"><span>${label}</span><b>${value}</b></div>`;

function birthdayCard(x){
 const birth=safeDate(x.date),today=startOfToday(),next=nextAnnualDate(x.date);
 const age=Math.max(0,ageOnDate(birth,today));
 const lived=wholeDaysBetween(birth,today).toLocaleString('en-GB');
 const until=Math.max(0,Math.ceil((next-today)/DAY_MS)).toLocaleString('en-GB');
 return `<article class="date-card v9-date-card birthday-card">
   <button class="delete" data-del-date="${x.id}">×</button>
   <div class="v9-date-details">
    ${detail('Date:',fmt(x.date))}
    ${detail('Age:',`${age} years`)}
    ${detail('Days lived:',lived)}
    ${detail('Next birthday:',`${until} days`)}
    ${detail('Name:',esc(x.title),'v9-name')}
   </div>
   <p class="v9-card-kind">Birthday</p>
  </article>`;
}

function standardDateCard(x){
 const recurring=x.recurring||x.type==='Birthday';
 const next=recurring?nextAnnualDate(x.date):safeDate(x.date);
 const remaining=Math.ceil((next-startOfToday())/DAY_MS);
 const timing=remaining>=0?`${remaining.toLocaleString('en-GB')} days remaining`:`${Math.abs(remaining).toLocaleString('en-GB')} days ago`;
 return `<article class="date-card v9-date-card">
   <button class="delete" data-del-date="${x.id}">×</button>
   <div class="v9-date-details">
    ${detail('Date:',fmt(x.date))}
    ${detail('Status:',timing)}
    ${detail('Name:',esc(x.title),'v9-name')}
   </div>
   <p class="v9-card-kind">${esc(x.type||'Date')}</p>
  </article>`;
}

function countdownCard(x){
 const n=daysTo(x.date);
 return `<article class="date-card v9-date-card countdown-card">
   <button class="delete" data-del-countdown="${x.id}">×</button>
   <div class="v9-date-details">
    ${detail('Date:',fmt(x.date))}
    ${detail('Days remaining:',Math.max(0,n).toLocaleString('en-GB'))}
    ${detail('Name:',esc(x.title),'v9-name')}
   </div>
   <p class="v9-card-kind">Countdown</p>
  </article>`;
}

function daysSinceCard(x){
 const n=Math.max(0,-daysTo(x.date));
 return `<article class="date-card v9-date-card since-card">
   <button class="delete" data-del-days-since="${x.id}">×</button>
   <div class="v9-date-details">
    ${detail('Date:',fmt(x.date))}
    ${detail('Days since:',n.toLocaleString('en-GB'))}
    ${detail('Name:',esc(x.title),'v9-name')}
   </div>
   <p class="v9-card-kind">Days since</p>
  </article>`;
}

function renderDatesV9(){
 if(typeof data==='undefined'||!document.getElementById('dateList'))return;
 const daysSince=Array.isArray(data.daysSince)?data.daysSince:[];
 const calendar=[...(data.dates||[]).map(x=>({...x,kind:'date'})),...(data.countdowns||[]).map(x=>({...x,kind:'countdown'})),...daysSince.map(x=>({...x,kind:'daysSince'}))].sort((a,b)=>a.date.localeCompare(b.date));
 $('dateList').innerHTML=calendar.length?calendar.map(x=>x.kind==='daysSince'?daysSinceCard(x):x.kind==='countdown'?countdownCard(x):x.type==='Birthday'?birthdayCard(x):standardDateCard(x)).join(''):'<p class="empty">No dates, countdowns or days-since counters yet.</p>';

 const upcoming=(data.dates||[]).map(x=>({x,d:(x.recurring||x.type==='Birthday')?nextAnnualDate(x.date):safeDate(x.date)})).filter(v=>v.d>=startOfToday()).sort((a,b)=>a.d-b.d)[0];
 $('nextDate').innerHTML=upcoming?dateBox(upcoming.x.title,upcoming.d.toISOString().slice(0,10)):'<p class="empty">No upcoming dates.</p>';
 const c=(data.countdowns||[]).filter(x=>daysTo(x.date)>=0).sort((a,b)=>a.date.localeCompare(b.date))[0];
 $('nextCountdown').innerHTML=c?`<div class="countdown-big"><b>${daysTo(c.date)}</b><div><h3>${esc(c.title)}</h3><p>days remaining</p></div></div>`:'<p class="empty">No countdowns yet.</p>';
 const since=[...daysSince].sort((a,b)=>a.date.localeCompare(b.date))[0];
 const home=document.getElementById('homeDaysSince');if(home)home.innerHTML=since?`<div class="countdown-big"><b>${Math.max(0,-daysTo(since.date))}</b><div><h3>${esc(since.title)}</h3><p>days since ${fmt(since.date)}</p></div></div>`:'<p class="empty">No days-since counters yet.</p>';
}

function applyV9(){
 const dateGrid=document.getElementById('dateList');if(dateGrid)dateGrid.classList.add('v9-date-grid');
 const workoutList=document.getElementById('workoutList');if(workoutList)workoutList.classList.add('v9-workout-grid');
 renderDatesV9();
}

renderDates=renderDatesV9;
const previousRender=render;
render=function(){const result=previousRender.apply(this,arguments);requestAnimationFrame(applyV9);return result};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyV9);else requestAnimationFrame(applyV9);
setTimeout(applyV9,400);
})();
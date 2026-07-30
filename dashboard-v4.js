(()=>{
const V4_COLORS=['#ff4b52','#5aa9ff','#71d99b','#f6c85f','#a78bfa','#ff8c42','#4dd0e1','#f472b6','#94d82d','#c084fc','#38bdf8','#fb7185','#facc15'];

data.daysSince=Array.isArray(data.daysSince)?data.daysSince:[];
data.budget=(data.budget||[]).map(x=>({...x,category:x.category||'',notes:x.notes||'',fixed:Boolean(x.fixed)}));
const oldMergeData=mergeData;
mergeData=function(a,b){const out=oldMergeData(a,b);const map=new Map([...(a.daysSince||[]),...(b.daysSince||[])].map(x=>[x.id,x]));out.daysSince=[...map.values()];out.budget=(out.budget||[]).map(x=>({...x,category:x.category||'',notes:x.notes||'',fixed:Boolean(x.fixed)}));return out};

// Remove the old snus card and replace it with a useful Days since card.
const snusCard=document.querySelector('.card.snus');
if(snusCard){snusCard.classList.remove('snus');snusCard.innerHTML='<div class="head"><div><small>CALENDAR</small><h3>Days since</h3></div><button data-go="dates" class="link">View all</button></div><div id="homeDaysSince" class="empty">No days-since counters yet.</div>'}
renderSnus=function(){};

// Calendar controls and modal.
const calendarActions=document.querySelector('#dates .actions');
if(calendarActions&&!document.getElementById('newDaysSinceBtn'))calendarActions.insertAdjacentHTML('beforeend','<button id="newDaysSinceBtn" class="primary" data-modal="daysSinceModal">+ Days since</button>');
if(!document.getElementById('daysSinceModal'))document.body.insertAdjacentHTML('beforeend',`<dialog id="daysSinceModal"><form id="daysSinceForm"><div class="modal-head"><h3>New days-since counter</h3><button type="button" data-close>×</button></div><label>Title<input name="title" required></label><label>Start date<input name="date" type="date" required></label><div class="form-actions"><button type="button" data-close>Cancel</button><button class="primary">Save</button></div></form></dialog>`);
const daysSinceForm=document.getElementById('daysSinceForm');
daysSinceForm.onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target).entries());data.daysSince.push({id:crypto.randomUUID(),...v});e.target.reset();e.target.closest('dialog').close();save('Days-since counter added')};

function nextEventDate(x){const base=new Date(x.date+'T12:00:00');if(!(x.recurring||x.type==='Birthday'))return base;const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);let next=new Date(now.getFullYear(),base.getMonth(),base.getDate(),12);if(next<today)next.setFullYear(next.getFullYear()+1);return next}
function dateDiff(d){return Math.ceil((d-new Date(new Date().toDateString()))/86400000)}
renderDates=function(){
 const calendar=[...data.dates.map(x=>({...x,kind:'date'})),...data.countdowns.map(x=>({...x,kind:'countdown'})),...data.daysSince.map(x=>({...x,kind:'daysSince'}))];
 calendar.sort((a,b)=>a.date.localeCompare(b.date));
 $('dateList').innerHTML=calendar.length?calendar.map(x=>{
   if(x.kind==='daysSince'){const n=Math.max(0,-daysTo(x.date));return `<article class="date-card since-card"><button class="delete" data-del-days-since="${x.id}">×</button><div class="date-line">Since ${fmt(x.date)}</div><h3>${esc(x.title)}</h3><div class="countdown-big"><b>${n}</b><span>days</span></div></article>`}
   if(x.kind==='countdown'){const n=daysTo(x.date);return `<article class="date-card countdown-card"><button class="delete" data-del-countdown="${x.id}">×</button><div class="date-line">${fmt(x.date)} · ${n>=0?n+' days remaining':(-n)+' days ago'}</div><h3>${esc(x.title)}</h3><p>Countdown</p><div class="countdown-big"><b>${Math.max(0,n)}</b><span>days</span></div></article>`}
   const recurring=x.recurring||x.type==='Birthday',next=nextEventDate(x),until=dateDiff(next),original=daysTo(x.date),birthday=x.type==='Birthday';
   const details=birthday?`${original<0?(-original)+' days since original date · ':''}${until} days until next birthday`:recurring?`${until} days until next occurrence`:(original>=0?original+' days remaining':(-original)+' days ago');
   return `<article class="date-card"><button class="delete" data-del-date="${x.id}">×</button><div class="date-line">${fmt(x.date)} · ${details}</div><h3>${esc(x.title)}</h3><p>${esc(x.type||'Date')}</p></article>`
 }).join(''):'<p class="empty">No dates, countdowns or days-since counters yet.</p>';
 const upcoming=data.dates.map(x=>({x,d:nextEventDate(x)})).filter(v=>dateDiff(v.d)>=0).sort((a,b)=>a.d-b.d)[0];
 $('nextDate').innerHTML=upcoming?dateBox(upcoming.x.title,upcoming.d.toISOString().slice(0,10)):'<p class="empty">No upcoming dates.</p>';
 const c=data.countdowns.filter(x=>daysTo(x.date)>=0).sort((a,b)=>a.date.localeCompare(b.date))[0];
 $('nextCountdown').innerHTML=c?`<div class="countdown-big"><b>${daysTo(c.date)}</b><div><h3>${esc(c.title)}</h3><p>days remaining</p></div></div>`:'<p class="empty">No countdowns yet.</p>';
 const since=[...data.daysSince].sort((a,b)=>a.date.localeCompare(b.date))[0];
 const home=document.getElementById('homeDaysSince');if(home)home.innerHTML=since?`<div class="countdown-big"><b>${Math.max(0,-daysTo(since.date))}</b><div><h3>${esc(since.title)}</h3><p>days since ${fmt(since.date)}</p></div></div>`:'<p class="empty">No days-since counters yet.</p>';
};

// Notes can now be edited; saving an edit refreshes the modified timestamp.
let editingNoteId=null;
renderNotes=function(){$('noteList').innerHTML=data.notes.length?[...data.notes].sort((a,b)=>(b.updated||b.created||'').localeCompare(a.updated||a.created||'')).map(x=>`<article class="note-card"><div class="note-actions"><button class="outline edit-note" data-edit-note="${x.id}">Edit</button><button class="delete" data-del-note="${x.id}">×</button></div><small>Updated ${fmt((x.updated||x.created||new Date().toISOString()).slice(0,10))}</small><h3>${esc(x.title)}</h3><p>${esc(x.content)}</p></article>`).join(''):'<p class="empty">No notes yet.</p>'};
$('noteForm').onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target).entries()),now=new Date().toISOString();if(editingNoteId){const n=data.notes.find(x=>x.id===editingNoteId);if(n)Object.assign(n,v,{updated:now});editingNoteId=null;save('Note updated')}else{data.notes.push({id:crypto.randomUUID(),...v,created:now,updated:now});save('Note saved')}e.target.reset();e.target.closest('dialog').close()};

// Budget becomes a permanently editable spreadsheet-style monthly table.
const budgetToolbar=document.querySelector('#budget .toolbar');
if(budgetToolbar)budgetToolbar.querySelector('h2').textContent='Monthly budget';
const budgetForm=$('budgetForm');
if(budgetForm&&!budgetForm.querySelector('[name=category]')){
 budgetForm.querySelector('[name=title]').closest('label').insertAdjacentHTML('afterend','<label>Category<input name="category" placeholder="Housing, salary, food..."></label>');
 budgetForm.querySelector('[name=date]').closest('label').insertAdjacentHTML('afterend','<label class="switch"><input name="fixed" type="checkbox"> Fixed every month</label><label>Comment<input name="notes"></label>');
}
renderBudget=function(){
 const income=data.budget.filter(x=>x.type==='income').reduce((a,x)=>a+(+x.amount||0),0),expense=data.budget.filter(x=>x.type==='expense').reduce((a,x)=>a+(+x.amount||0),0),left=income-expense;
 $('incomeTotal').textContent=Math.round(income).toLocaleString('en-NO')+' kr';$('expenseTotal').textContent=Math.round(expense).toLocaleString('en-NO')+' kr';$('budgetBalance').textContent=Math.round(left).toLocaleString('en-NO')+' kr';
 $('budgetList').innerHTML=`<div class="budget-sheet-wrap"><table class="budget-sheet"><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th><th>Fixed</th><th>Comment</th><th></th></tr></thead><tbody>${[...data.budget].sort((a,b)=>(a.type>b.type?1:-1)||a.title.localeCompare(b.title)).map(x=>`<tr data-budget-row="${x.id}"><td><input type="date" data-budget-field="date" value="${esc(x.date||day())}"></td><td><input data-budget-field="title" value="${esc(x.title)}"></td><td><input data-budget-field="category" value="${esc(x.category||'')}"></td><td><select data-budget-field="type"><option value="income" ${x.type==='income'?'selected':''}>Income</option><option value="expense" ${x.type==='expense'?'selected':''}>Expense</option></select></td><td><input type="number" min="0" step="0.01" data-budget-field="amount" value="${+x.amount||0}"></td><td class="budget-fixed"><input type="checkbox" data-budget-field="fixed" ${x.fixed?'checked':''}></td><td><input data-budget-field="notes" value="${esc(x.notes||'')}"></td><td><button class="delete" data-del-budget="${x.id}">×</button></td></tr>`).join('')}</tbody><tfoot><tr><th colspan="4">Left after expenses</th><th class="${left<0?'negative':'positive'}">${Math.round(left).toLocaleString('en-NO')} kr</th><th colspan="3"></th></tr></tfoot></table></div>`;
};
$('budgetForm').onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target).entries());data.budget.push({id:crypto.randomUUID(),...v,amount:+v.amount||0,fixed:e.target.fixed.checked});e.target.reset();e.target.closest('dialog').close();save('Budget row added')};

// Multi-line exercise chart with a legend for every exercise that has data.
function drawMultiChart(canvas,series){if(!canvas)return;const dpr=devicePixelRatio||1,w=canvas.clientWidth||700,h=canvas.clientHeight||320;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);c.clearRect(0,0,w,h);c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=1;for(let i=1;i<5;i++){c.beginPath();c.moveTo(38,(h-34)*i/5);c.lineTo(w-12,(h-34)*i/5);c.stroke()}const all=series.flatMap(s=>s.points.map(p=>p.v));if(!all.length){c.fillStyle='#777780';c.font='14px system-ui';c.fillText('Not enough data yet',45,h/2);return}const min=Math.min(...all),max=Math.max(...all),range=Math.max(1,max-min);series.forEach((s,si)=>{const pts=s.points,X=i=>42+(w-60)*i/Math.max(1,pts.length-1),Y=v=>10+(h-38)*(max-v)/range;c.strokeStyle=V4_COLORS[si%V4_COLORS.length];c.lineWidth=2.5;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(X(i),Y(p.v)):c.moveTo(X(i),Y(p.v)));c.stroke();pts.forEach((p,i)=>{c.fillStyle=V4_COLORS[si%V4_COLORS.length];c.beginPath();c.arc(X(i),Y(p.v),3,0,Math.PI*2);c.fill()})})}
renderCharts=function(){
 const allSeries=EX.map(name=>({name,points:data.workouts.flatMap(w=>(w.exercises||[]).filter(e=>e.name===name).map(e=>({d:w.date,v:workoutMetric(e,w.bodyweight)}))).filter(x=>x.v>0).sort((a,b)=>a.d.localeCompare(b.d))})).filter(s=>s.points.length);
 drawMultiChart($('exerciseChart'),allSeries);drawMultiChart($('homeProgressChart'),allSeries);
 const card=$('exerciseChart')?.closest('.card');if(card){const select=$('chartExercise');if(select)select.style.display='none';let legend=card.querySelector('.chart-legend');if(!legend){legend=document.createElement('div');legend.className='chart-legend';card.appendChild(legend)}legend.innerHTML=allSeries.map((s,i)=>`<span><i style="background:${V4_COLORS[i%V4_COLORS.length]}"></i>${esc(s.name)}</span>`).join('')||'<span>No exercise data yet</span>'}
};

// Extra delegated controls.
document.addEventListener('click',e=>{
 const edit=e.target.closest('[data-edit-note]');if(edit){const n=data.notes.find(x=>x.id===edit.dataset.editNote);if(n){editingNoteId=n.id;$('noteForm').title.value=n.title;$('noteForm').content.value=n.content;$('noteModal').querySelector('.modal-head h3').textContent='Edit note';$('noteModal').showModal()}}
 const ds=e.target.closest('[data-del-days-since]');if(ds){data.daysSince=data.daysSince.filter(x=>x.id!==ds.dataset.delDaysSince);save('Deleted')}
});
document.addEventListener('change',e=>{const field=e.target.closest('[data-budget-field]');if(field){const row=field.closest('[data-budget-row]'),entry=data.budget.find(x=>x.id===row?.dataset.budgetRow);if(entry){entry[field.dataset.budgetField]=field.type==='checkbox'?field.checked:field.dataset.budgetField==='amount'?(+field.value||0):field.value;save('Budget updated')}}});

// Workout dialog: keep the save bar visible and make the exercise list the scrollable area.
const workoutForm=$('workoutForm');if(workoutForm)workoutForm.classList.add('workout-form-v4');

render();
})();
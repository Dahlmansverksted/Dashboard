(()=>{
'use strict';

const STYLE=`
.goals-list{display:grid;gap:16px;max-width:940px;margin-inline:auto}.goal-card{min-height:0!important;padding:22px!important}.goal-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.goal-title-wrap{min-width:0}.goal-title-wrap h3{font-size:23px;font-weight:400;overflow-wrap:anywhere}.goal-title-wrap p{margin:7px 0 0;color:var(--muted);line-height:1.55}.goal-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.goal-progress-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;margin:20px 0 15px}.goal-progress{height:10px;border-radius:999px;overflow:hidden;background:rgba(247,243,238,.08);padding:2px}.goal-progress i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--walnut),var(--oak));transition:width .3s ease}.goal-percent{font-size:15px;color:var(--oak);min-width:48px;text-align:right}.goal-task-list{display:grid;gap:8px}.goal-task{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:11px;align-items:center;padding:11px 12px;border:1px solid rgba(216,176,139,.14);border-radius:12px;background:rgba(247,243,238,.035)}.goal-task input{appearance:none;width:20px;height:20px;padding:0;border:1px solid rgba(247,243,238,.35);border-radius:6px}.goal-task input:checked{background:var(--oak);border-color:var(--oak)}.goal-task input:checked:after{content:'✓';display:grid;place-items:center;color:#17120f;font-weight:600}.goal-task.done .goal-task-name{text-decoration:line-through;color:var(--muted)}.goal-task-name{overflow-wrap:anywhere}.goal-task-meta{color:var(--muted);font-size:11px;margin-top:3px}.goal-empty{padding:15px;border:1px dashed rgba(216,176,139,.22);border-radius:12px;color:var(--muted);text-align:center}.goal-link-list{display:grid;gap:8px;max-height:360px;overflow:auto;padding:4px}.goal-link-option{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center;padding:11px;border:1px solid var(--line);border-radius:11px;background:rgba(247,243,238,.035)}.goal-link-option input{width:19px;height:19px}.goal-new-task{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin-top:12px}.goal-new-task button{white-space:nowrap}@media(max-width:700px){.goal-head{display:grid}.goal-actions{justify-content:flex-start}.goal-task{grid-template-columns:auto minmax(0,1fr)}.goal-task .delete{grid-column:2;justify-self:end}.goal-new-task{grid-template-columns:1fr}.goal-new-task button{width:100%}}
`;

let started=false;
function ready(){return typeof data!=='undefined'&&typeof save==='function'&&typeof nav==='function'&&typeof esc==='function'}
function ensureData(){data.goals=Array.isArray(data.goals)?data.goals:[];data.tasks=Array.isArray(data.tasks)?data.tasks:[]}

function ensureUI(){
 if(!document.getElementById('goals-style')){const s=document.createElement('style');s.id='goals-style';s.textContent=STYLE;document.head.appendChild(s)}
 const navRoot=document.querySelector('aside nav');
 if(navRoot&&!navRoot.querySelector('[data-page="goals"]')){const b=document.createElement('button');b.className='nav';b.dataset.page='goals';b.innerHTML='◎ <span>Goals</span>';const task=navRoot.querySelector('[data-page="tasks"]');task?task.insertAdjacentElement('afterend',b):navRoot.appendChild(b)}
 const main=document.querySelector('main');
 if(main&&!document.getElementById('goals')){const section=document.createElement('section');section.id='goals';section.className='page content';section.innerHTML='<div class="toolbar"><div><small>DIRECTION</small><h2>Goals</h2></div><button type="button" class="primary" data-open-goal-modal>+ New goal</button></div><div id="goalsList" class="goals-list"></div>';const tasks=document.getElementById('tasks');tasks?tasks.insertAdjacentElement('afterend',section):main.appendChild(section)}
 if(!document.getElementById('goalModal'))document.body.insertAdjacentHTML('beforeend','<dialog id="goalModal"><form id="goalForm"><div class="modal-head"><h3>New goal</h3><button type="button" data-close-goal>×</button></div><label>Goal name<input name="title" required></label><label>Description<textarea name="description" rows="4" placeholder="What are you working toward?"></textarea></label><div class="form-actions"><button type="button" data-close-goal>Cancel</button><button class="primary" type="submit">Create goal</button></div></form></dialog>');
 if(!document.getElementById('goalLinkModal'))document.body.insertAdjacentHTML('beforeend','<dialog id="goalLinkModal"><form id="goalLinkForm"><div class="modal-head"><h3>Connect existing tasks</h3><button type="button" data-close-goal>×</button></div><input type="hidden" name="goalId"><div id="goalLinkList" class="goal-link-list"></div><div class="form-actions"><button type="button" data-close-goal>Cancel</button><button class="primary" type="submit">Save connections</button></div></form></dialog>');
 const mobile=document.getElementById('v8MobileMenu');
 if(mobile&&!mobile.querySelector('[data-page="goals"]')){const b=document.createElement('button');b.type='button';b.dataset.page='goals';b.innerHTML='◎ <span>Goals</span>';const task=mobile.querySelector('[data-page="tasks"]');task?task.insertAdjacentElement('afterend',b):mobile.appendChild(b)}
}

function goalTasks(id){return data.tasks.filter(t=>t.goalId===id)}
function renderGoals(){
 ensureData();ensureUI();const list=document.getElementById('goalsList');if(!list)return;
 list.innerHTML=data.goals.length?data.goals.map(g=>{const tasks=goalTasks(g.id),done=tasks.filter(t=>Boolean(t.done)).length,pct=tasks.length?Math.round(done/tasks.length*100):0;return `<article class="card goal-card"><div class="goal-head"><div class="goal-title-wrap"><small>GOAL</small><h3>${esc(g.title)}</h3>${g.description?`<p>${esc(g.description)}</p>`:''}</div><div class="goal-actions"><button type="button" class="outline" data-link-goal="${g.id}">Connect tasks</button><button type="button" class="delete" data-delete-goal="${g.id}">×</button></div></div><div class="goal-progress-row"><div class="goal-progress"><i style="width:${pct}%"></i></div><b class="goal-percent">${pct}%</b></div><div class="goal-task-list">${tasks.length?tasks.map(t=>`<div class="goal-task ${t.done?'done':''}"><input type="checkbox" data-goal-task-toggle="${t.id}" ${t.done?'checked':''}><div><div class="goal-task-name">${esc(t.title)}</div><div class="goal-task-meta">${t.dueDate?`Due ${fmt(t.dueDate)} · `:''}${esc(t.priority||'medium')} priority</div></div><button type="button" class="delete" data-unlink-task="${t.id}">×</button></div>`).join(''):'<div class="goal-empty">No tasks connected yet.</div>'}</div><form class="goal-new-task" data-new-goal-task="${g.id}"><input name="title" required placeholder="Add a new task to this goal"><button class="primary" type="submit">+ Add task</button></form></article>`}).join(''):'<div class="goal-empty">No goals yet. Create your first one above.</div>';
}

function openLinks(id){const form=document.getElementById('goalLinkForm'),box=document.getElementById('goalLinkList');form.elements.goalId.value=id;box.innerHTML=data.tasks.length?data.tasks.map(t=>`<label class="goal-link-option"><input type="checkbox" name="taskIds" value="${t.id}" ${t.goalId===id?'checked':''}><span>${esc(t.title)}${t.goalId&&t.goalId!==id?' · currently linked to another goal':''}</span></label>`).join(''):'<p class="empty">There are no existing tasks yet.</p>';document.getElementById('goalLinkModal').showModal()}

function handleClick(e){
 const page=e.target.closest('[data-page="goals"]');if(page){nav('goals');document.getElementById('v8MobileMenu')?.classList.remove('open');renderGoals();return}
 if(e.target.closest('[data-open-goal-modal]')){document.getElementById('goalModal').showModal();return}
 if(e.target.closest('[data-close-goal]')){e.target.closest('dialog')?.close();return}
 const link=e.target.closest('[data-link-goal]');if(link){openLinks(link.dataset.linkGoal);return}
 const del=e.target.closest('[data-delete-goal]');if(del){const id=del.dataset.deleteGoal;data.goals=data.goals.filter(g=>g.id!==id);data.tasks.forEach(t=>{if(t.goalId===id)delete t.goalId});save('Goal deleted');return}
 const unlink=e.target.closest('[data-unlink-task]');if(unlink){const t=data.tasks.find(x=>x.id===unlink.dataset.unlinkTask);if(t)delete t.goalId;save('Task removed from goal')}
}
function handleChange(e){const toggle=e.target.closest('[data-goal-task-toggle]');if(!toggle)return;const t=data.tasks.find(x=>x.id===toggle.dataset.goalTaskToggle);if(t){t.done=toggle.checked;save('Task updated')}}
function handleSubmit(e){
 if(e.target.id==='goalForm'){e.preventDefault();const fd=new FormData(e.target),title=String(fd.get('title')||'').trim();if(!title)return;data.goals.push({id:crypto.randomUUID(),title,description:String(fd.get('description')||'').trim(),created:new Date().toISOString()});e.target.reset();e.target.closest('dialog').close();save('Goal created');return}
 const newTask=e.target.closest('[data-new-goal-task]');if(newTask){e.preventDefault();const title=String(new FormData(newTask).get('title')||'').trim();if(!title)return;data.tasks.push({id:crypto.randomUUID(),title,dueDate:'',priority:'medium',category:'Goals',notes:'',done:false,goalId:newTask.dataset.newGoalTask});newTask.reset();save('Goal task added');return}
 if(e.target.id==='goalLinkForm'){e.preventDefault();const fd=new FormData(e.target),goalId=String(fd.get('goalId')),selected=new Set(fd.getAll('taskIds').map(String));data.tasks.forEach(t=>{if(selected.has(String(t.id)))t.goalId=goalId;else if(t.goalId===goalId)delete t.goalId});e.target.closest('dialog').close();save('Goal tasks updated')}
}

function start(){
 if(started||!ready())return false;started=true;ensureData();
 const oldMerge=mergeData;mergeData=function(a,b){const out=oldMerge(a,b);const m=new Map([...(a.goals||[]),...(b.goals||[])].map(x=>[x.id,x]));out.goals=[...m.values()];return out};
 document.addEventListener('click',handleClick);document.addEventListener('change',handleChange);document.addEventListener('submit',handleSubmit);
 ensureUI();renderGoals();
 const oldRender=render;render=function(){const result=oldRender.apply(this,arguments);requestAnimationFrame(renderGoals);return result};
 return true;
}

let attempts=0;const timer=setInterval(()=>{attempts++;try{if(start()||attempts>100)clearInterval(timer)}catch(err){console.error('Goals startup failed',err);if(attempts>100)clearInterval(timer)}},50);
})();

(()=>{
'use strict';

const GOAL_STYLE=`
body{background:radial-gradient(circle at 78% 4%,rgba(216,176,139,.16),transparent 34%),radial-gradient(circle at 14% 86%,rgba(155,105,68,.12),transparent 38%),#181512!important}
.bg-overlay{background:linear-gradient(90deg,rgba(12,11,10,.78) 0,rgba(20,17,15,.64) 38%,rgba(24,20,17,.56) 72%,rgba(14,12,11,.68) 100%)!important}
.goals-list{display:grid;gap:16px;max-width:940px;margin-inline:auto}.goal-card{min-height:0!important;padding:22px!important}.goal-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.goal-title-wrap{min-width:0}.goal-title-wrap h3{font-size:23px;font-weight:400;overflow-wrap:anywhere}.goal-title-wrap p{margin:7px 0 0;color:var(--muted);line-height:1.55}.goal-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.goal-progress-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;margin:20px 0 15px}.goal-progress{height:10px;border-radius:999px;overflow:hidden;background:rgba(247,243,238,.07);padding:2px}.goal-progress i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--walnut),var(--oak));transition:width .3s ease}.goal-percent{font-size:15px;color:var(--oak);min-width:48px;text-align:right}.goal-task-list{display:grid;gap:8px}.goal-task{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:11px;align-items:center;padding:11px 12px;border:1px solid rgba(216,176,139,.12);border-radius:12px;background:rgba(247,243,238,.025)}.goal-task input{appearance:none;width:20px;height:20px;padding:0;border:1px solid rgba(247,243,238,.32);border-radius:6px}.goal-task input:checked{background:var(--oak);border-color:var(--oak)}.goal-task input:checked:after{content:'✓';display:grid;place-items:center;color:#17120f;font-weight:600}.goal-task.done .goal-task-name{text-decoration:line-through;color:var(--muted)}.goal-task-name{overflow-wrap:anywhere}.goal-task-meta{color:var(--muted);font-size:11px;margin-top:3px}.goal-empty{padding:15px;border:1px dashed rgba(216,176,139,.18);border-radius:12px;color:var(--muted);text-align:center}.goal-link-list{display:grid;gap:8px;max-height:330px;overflow:auto;padding:4px}.goal-link-option{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center;padding:10px;border:1px solid var(--line);border-radius:11px;background:rgba(247,243,238,.025)}.goal-link-option input{width:19px;height:19px}.goal-new-task{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin-top:12px}.goal-new-task button{white-space:nowrap}@media(max-width:700px){.goal-head{display:grid}.goal-actions{justify-content:flex-start}.goal-task{grid-template-columns:auto minmax(0,1fr)}.goal-task .delete{grid-column:2;justify-self:end}.goal-new-task{grid-template-columns:1fr}.goal-new-task button{width:100%}}
`;

function ensureGoalsData(){
 data.goals=Array.isArray(data.goals)?data.goals:[];
 data.tasks=Array.isArray(data.tasks)?data.tasks:[];
}
ensureGoalsData();

const previousMergeData=mergeData;
mergeData=function(a,b){
 const out=previousMergeData(a,b);const map=new Map([...(a.goals||[]),...(b.goals||[])].map(x=>[x.id,x]));out.goals=[...map.values()];return out;
};

function ensureGoalsUI(){
 if(!document.getElementById('goals-style')){const s=document.createElement('style');s.id='goals-style';s.textContent=GOAL_STYLE;document.head.appendChild(s)}
 const navRoot=document.querySelector('aside nav');
 if(navRoot&&!navRoot.querySelector('[data-page="goals"]')){
  const button=document.createElement('button');button.className='nav';button.dataset.page='goals';button.innerHTML='◎ <span>Goals</span>';
  const tasksNav=navRoot.querySelector('[data-page="tasks"]');tasksNav?.insertAdjacentElement('afterend',button);
  button.addEventListener('click',()=>nav('goals'));
 }
 const main=document.querySelector('main');
 if(main&&!document.getElementById('goals')){
  const section=document.createElement('section');section.id='goals';section.className='page content';section.innerHTML=`<div class="toolbar"><div><small>DIRECTION</small><h2>Goals</h2></div><button class="primary" data-open-goal-modal>+ New goal</button></div><div id="goalsList" class="goals-list"></div>`;
  const tasks=document.getElementById('tasks');tasks?.insertAdjacentElement('afterend',section);
 }
 if(!document.getElementById('goalModal'))document.body.insertAdjacentHTML('beforeend',`<dialog id="goalModal"><form id="goalForm"><div class="modal-head"><h3>New goal</h3><button type="button" data-close-goal>×</button></div><label>Goal name<input name="title" required></label><label>Description<textarea name="description" rows="4" placeholder="What are you working toward?"></textarea></label><div class="form-actions"><button type="button" data-close-goal>Cancel</button><button class="primary">Create goal</button></div></form></dialog>`);
 if(!document.getElementById('goalLinkModal'))document.body.insertAdjacentHTML('beforeend',`<dialog id="goalLinkModal"><form id="goalLinkForm"><div class="modal-head"><h3>Connect existing tasks</h3><button type="button" data-close-goal>×</button></div><input type="hidden" name="goalId"><div id="goalLinkList" class="goal-link-list"></div><div class="form-actions"><button type="button" data-close-goal>Cancel</button><button class="primary">Save connections</button></div></form></dialog>`);
 const mobile=document.getElementById('v8MobileMenu');
 if(mobile&&!mobile.querySelector('[data-page="goals"]')){const b=document.createElement('button');b.type='button';b.dataset.page='goals';b.innerHTML='◎ <span>Goals</span>';b.onclick=()=>{nav('goals');mobile.classList.remove('open')};const task=mobile.querySelector('[data-page="tasks"]');task?.insertAdjacentElement('afterend',b)}
}

function goalTasks(goalId){return data.tasks.filter(t=>t.goalId===goalId)}
function renderGoals(){
 ensureGoalsData();ensureGoalsUI();const list=document.getElementById('goalsList');if(!list)return;
 list.innerHTML=data.goals.length?data.goals.map(goal=>{
  const tasks=goalTasks(goal.id),done=tasks.filter(t=>t.done).length,pct=tasks.length?Math.round(done/tasks.length*100):0;
  return `<article class="card goal-card" data-goal-card="${goal.id}"><div class="goal-head"><div class="goal-title-wrap"><small>GOAL</small><h3>${esc(goal.title)}</h3>${goal.description?`<p>${esc(goal.description)}</p>`:''}</div><div class="goal-actions"><button class="outline" data-link-goal="${goal.id}">Connect tasks</button><button class="delete" data-delete-goal="${goal.id}" aria-label="Delete goal">×</button></div></div><div class="goal-progress-row"><div class="goal-progress"><i style="width:${pct}%"></i></div><b class="goal-percent">${pct}%</b></div><div class="goal-task-list">${tasks.length?tasks.map(t=>`<div class="goal-task ${t.done?'done':''}"><input type="checkbox" data-goal-task-toggle="${t.id}" ${t.done?'checked':''}><div><div class="goal-task-name">${esc(t.title)}</div><div class="goal-task-meta">${t.dueDate?`Due ${fmt(t.dueDate)} · `:''}${esc(t.priority||'normal')} priority</div></div><button class="delete" data-unlink-task="${t.id}" aria-label="Remove from goal">×</button></div>`).join(''):'<div class="goal-empty">No tasks connected yet.</div>'}</div><form class="goal-new-task" data-new-goal-task="${goal.id}"><input name="title" required placeholder="Add a new task to this goal"><button class="primary">+ Add task</button></form></article>`
 }).join(''):'<div class="goal-empty">No goals yet. Create your first one above.</div>';
}

function openLinkModal(goalId){
 const form=document.getElementById('goalLinkForm'),box=document.getElementById('goalLinkList');form.goalId.value=goalId;
 box.innerHTML=data.tasks.length?data.tasks.map(t=>`<label class="goal-link-option"><input type="checkbox" name="taskIds" value="${t.id}" ${t.goalId===goalId?'checked':''}><span>${esc(t.title)}${t.goalId&&t.goalId!==goalId?' · connected to another goal':''}</span></label>`).join(''):'<p class="empty">There are no existing tasks to connect yet.</p>';
 document.getElementById('goalLinkModal').showModal();
}

document.addEventListener('click',e=>{
 if(e.target.closest('[data-open-goal-modal]'))document.getElementById('goalModal').showModal();
 if(e.target.closest('[data-close-goal]'))e.target.closest('dialog')?.close();
 const link=e.target.closest('[data-link-goal]');if(link)openLinkModal(link.dataset.linkGoal);
 const del=e.target.closest('[data-delete-goal]');if(del){const id=del.dataset.deleteGoal;data.goals=data.goals.filter(g=>g.id!==id);data.tasks.forEach(t=>{if(t.goalId===id)delete t.goalId});save('Goal deleted')}
 const unlink=e.target.closest('[data-unlink-task]');if(unlink){const task=data.tasks.find(t=>t.id===unlink.dataset.unlinkTask);if(task)delete task.goalId;save('Task removed from goal')}
});

document.addEventListener('change',e=>{const toggle=e.target.closest('[data-goal-task-toggle]');if(toggle){const task=data.tasks.find(t=>t.id===toggle.dataset.goalTaskToggle);if(task)task.done=toggle.checked;save('Task updated')}});

document.addEventListener('submit',e=>{
 if(e.target.id==='goalForm'){e.preventDefault();const v=Object.fromEntries(new FormData(e.target));data.goals.push({id:crypto.randomUUID(),title:v.title,description:v.description||'',created:new Date().toISOString()});e.target.reset();e.target.closest('dialog').close();save('Goal created')}
 const goalTask=e.target.closest('[data-new-goal-task]');if(goalTask){e.preventDefault();const title=new FormData(goalTask).get('title')?.trim();if(title){data.tasks.push({id:crypto.randomUUID(),title,dueDate:'',priority:'medium',category:'Goals',notes:'',done:false,goalId:goalTask.dataset.newGoalTask});goalTask.reset();save('Goal task added')}}
 if(e.target.id==='goalLinkForm'){e.preventDefault();const fd=new FormData(e.target),goalId=fd.get('goalId'),selected=new Set(fd.getAll('taskIds'));data.tasks.forEach(t=>{if(selected.has(t.id))t.goalId=goalId;else if(t.goalId===goalId)delete t.goalId});e.target.closest('dialog').close();save('Goal tasks updated')}
});

const oldRender=render;render=function(){const result=oldRender.apply(this,arguments);requestAnimationFrame(renderGoals);return result};
ensureGoalsUI();renderGoals();
})();

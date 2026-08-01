(()=>{
'use strict';
const load=src=>new Promise(resolve=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=resolve;document.body.appendChild(s)});
const legacy=['/dashboard-v4.js?v=12','/dashboard-v5.js?v=12','/dashboard-v8.js?v=12','/dashboard-v9.js?v=12'];

function homeLayout(){
 const grid=document.querySelector('#dashboard>.grid');if(!grid)return;
 const cards=[...grid.children];
 const focus=cards.find(x=>x.querySelector('#priority'));
 const daily=cards.find(x=>x.querySelector('#dailyList'));
 const calendar=cards.find(x=>x.classList.contains('v8-calendar-combined'))||cards.find(x=>x.querySelector('#homeDaysSince'));
 const progress=cards.find(x=>x.querySelector('#homeProgressChart'));
 const nextDate=cards.find(x=>x.querySelector('#nextDate'));
 const countdown=cards.find(x=>x.querySelector('#nextCountdown'));
 if(nextDate&&nextDate!==calendar)nextDate.remove();
 if(countdown&&countdown!==calendar)countdown.remove();
 if(calendar){
   calendar.classList.add('unified-calendar');
   const title=calendar.querySelector('.head h3');if(title)title.textContent='Calendar';
   const eye=calendar.querySelector('.head small');if(eye)eye.textContent='CALENDAR';
 }
 [focus,daily,calendar,progress].filter(Boolean).forEach(x=>grid.appendChild(x));
}

const MUSCLES={
 'Bench Press':'Chest','Incline Dumbbell Press':'Chest',
 'Tricep Cable Pushdown':'Triceps','Overhead Extension Bumper':'Triceps','Cable Pressdown':'Triceps',
 'Pullups':'Back','Cable Row':'Back',
 'Bicep Cable Curl':'Biceps','Bicep Barbell Curl':'Biceps','Bicep Dumbbell Curl':'Biceps','Cable Curl':'Biceps',
 'Lateral Raise':'Shoulders','Overhead Barbell Press':'Shoulders'
};
const COLORS=['#d8b08b','#9b6944','#c89b73','#6f8f7b','#8090a8','#b47f78','#8d7ca8'];
function muscleData(){
 const totals={};
 (window.data?.workouts||[]).forEach(w=>(w.exercises||[]).forEach(e=>{
   const group=MUSCLES[e.name]||'Other';
   const sets=Math.max(1,(e.sets||[]).length);
   totals[group]=(totals[group]||0)+sets;
 }));
 return Object.entries(totals).sort((a,b)=>b[1]-a[1]);
}
function ensureMuscleChart(){
 const page=document.getElementById('training'),progress=document.getElementById('exerciseChart')?.closest('.card');if(!page||!progress)return;
 let card=document.getElementById('muscleGroupCard');
 if(!card){card=document.createElement('article');card.id='muscleGroupCard';card.className='card muscle-card';card.innerHTML='<div class="head"><div><small>MUSCLE BALANCE</small><h3>Most trained muscle groups</h3></div></div><div class="muscle-chart-wrap"><canvas id="muscleGroupChart" width="420" height="420"></canvas><div id="muscleLegend" class="muscle-legend"></div></div>';progress.insertAdjacentElement('afterend',card)}
 drawMuscleChart();
}
function drawMuscleChart(){
 const canvas=document.getElementById('muscleGroupChart'),legend=document.getElementById('muscleLegend');if(!canvas||!legend)return;
 const entries=muscleData(),dpr=devicePixelRatio||1,size=Math.min(canvas.clientWidth||360,420);canvas.width=size*dpr;canvas.height=size*dpr;const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,size,size);
 const total=entries.reduce((s,x)=>s+x[1],0),cx=size/2,cy=size/2,r=size*.39,inner=r*.57;
 if(!total){c.fillStyle='rgba(216,176,139,.12)';c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();c.fillStyle='#b8aea4';c.textAlign='center';c.font='14px Poppins';c.fillText('No workout data yet',cx,cy);legend.innerHTML='';return}
 let angle=-Math.PI/2;entries.forEach(([name,value],i)=>{const slice=value/total*Math.PI*2;c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,r,angle,angle+slice);c.closePath();c.fillStyle=COLORS[i%COLORS.length];c.fill();angle+=slice});
 c.globalCompositeOperation='destination-out';c.beginPath();c.arc(cx,cy,inner,0,Math.PI*2);c.fill();c.globalCompositeOperation='source-over';c.fillStyle='#f7f3ee';c.textAlign='center';c.font='500 27px Poppins';c.fillText(String(total),cx,cy-2);c.fillStyle='#b8aea4';c.font='11px Poppins';c.fillText('total sets',cx,cy+20);
 legend.innerHTML=entries.map(([name,value],i)=>`<div><i style="background:${COLORS[i%COLORS.length]}"></i><span>${name}</span><b>${Math.round(value/total*100)}%</b></div>`).join('');
}
function apply(){homeLayout();ensureMuscleChart()}
(async()=>{for(const src of legacy)await load(src);apply();const oldRender=window.render;if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);requestAnimationFrame(apply);return r};new MutationObserver(()=>{clearTimeout(window.__unifiedTimer);window.__unifiedTimer=setTimeout(apply,80)}).observe(document.body,{childList:true,subtree:true});addEventListener('resize',()=>{clearTimeout(window.__muscleResize);window.__muscleResize=setTimeout(drawMuscleChart,120)});})();
})();
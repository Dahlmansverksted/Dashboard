(()=>{
'use strict';

const COLORS={grid:'rgba(216,176,139,.20)',axis:'rgba(216,176,139,.34)',line:'#d8b08b',fill:'rgba(216,176,139,.20)',point:'#f7f3ee',text:'#d8d0c8',muted:'#a99f96'};

function exerciseCounts(){
 const counts=new Map();
 for(const workout of data.workouts||[]){
  for(const exercise of workout.exercises||[]){
   const name=String(exercise?.name||'').trim();
   if(name)counts.set(name,(counts.get(name)||0)+1);
  }
 }
 return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,5);
}

function wrapLabel(ctx,text,maxWidth){
 const words=String(text).split(/\s+/),lines=[];let line='';
 for(const word of words){
  const test=line?`${line} ${word}`:word;
  if(line&&ctx.measureText(test).width>maxWidth){lines.push(line);line=word}else line=test;
 }
 if(line)lines.push(line);
 return lines.slice(0,2);
}

function drawRadar(){
 const card=document.getElementById('muscleGroupCard');
 const canvas=document.getElementById('muscleGroupChart');
 const legend=document.getElementById('muscleLegend');
 if(!card||!canvas)return;
 card.classList.add('exercise-radar-card');
 const eyebrow=card.querySelector('.head small');
 const heading=card.querySelector('.head h3');
 if(eyebrow)eyebrow.textContent='EXERCISE FREQUENCY';
 if(heading)heading.textContent='Five most trained exercises';
 if(legend)legend.remove();
 const wrap=canvas.closest('.muscle-chart-wrap');
 if(wrap)wrap.classList.add('exercise-radar-wrap');

 const entries=exerciseCounts();
 const cssWidth=Math.max(300,Math.min(canvas.parentElement?.clientWidth||520,620));
 const cssHeight=Math.max(360,Math.min(cssWidth*.86,520));
 const dpr=window.devicePixelRatio||1;
 canvas.width=Math.round(cssWidth*dpr);canvas.height=Math.round(cssHeight*dpr);
 canvas.style.width=cssWidth+'px';canvas.style.height=cssHeight+'px';
 const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cssWidth,cssHeight);

 if(entries.length<3){
  ctx.fillStyle=COLORS.muted;ctx.font='14px Poppins, sans-serif';ctx.textAlign='center';ctx.fillText('Log at least 3 exercises to build the radar chart',cssWidth/2,cssHeight/2);return;
 }
 const n=entries.length,max=Math.max(...entries.map(x=>x[1]),1),cx=cssWidth/2,cy=cssHeight/2+8;
 const radius=Math.min(cssWidth,cssHeight)*.30,levels=5;
 const angle=i=>-Math.PI/2+i*Math.PI*2/n;
 const point=(r,i)=>[cx+Math.cos(angle(i))*r,cy+Math.sin(angle(i))*r];

 ctx.lineWidth=1;
 for(let level=1;level<=levels;level++){
  const r=radius*level/levels;ctx.beginPath();
  for(let i=0;i<n;i++){const [x,y]=point(r,i);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}
  ctx.closePath();ctx.strokeStyle=COLORS.grid;ctx.stroke();
  ctx.fillStyle=COLORS.muted;ctx.font='10px Poppins, sans-serif';ctx.textAlign='left';ctx.fillText(String(Math.ceil(max*level/levels)),cx+5,cy-r+11);
 }
 for(let i=0;i<n;i++){const [x,y]=point(radius,i);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.strokeStyle=COLORS.axis;ctx.stroke()}

 ctx.beginPath();
 entries.forEach(([,value],i)=>{const [x,y]=point(radius*value/max,i);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
 ctx.closePath();ctx.fillStyle=COLORS.fill;ctx.fill();ctx.strokeStyle=COLORS.line;ctx.lineWidth=3;ctx.stroke();

 entries.forEach(([name,value],i)=>{
  const [x,y]=point(radius*value/max,i);ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle=COLORS.point;ctx.fill();ctx.strokeStyle=COLORS.line;ctx.lineWidth=3;ctx.stroke();
  const [lx,ly]=point(radius+44,i);const lines=wrapLabel(ctx,name,125);ctx.fillStyle=COLORS.text;ctx.font='500 11px Poppins, sans-serif';ctx.textAlign=lx<cx-8?'right':lx>cx+8?'left':'center';
  lines.forEach((line,j)=>ctx.fillText(line,lx,ly+(j-(lines.length-1)/2)*14));
  ctx.fillStyle=COLORS.line;ctx.font='700 11px Poppins, sans-serif';ctx.fillText(`${value}×`,lx,ly+((lines.length+1)/2)*14);
 });
 }

 function installStyles(){
  if(document.getElementById('gym-radar-mobile-style'))return;
  const style=document.createElement('style');style.id='gym-radar-mobile-style';style.textContent=`
  #muscleGroupCard .muscle-chart-wrap.exercise-radar-wrap{display:flex!important;justify-content:center!important;align-items:center!important;overflow:visible!important}
  #muscleGroupCard #muscleGroupChart{display:block!important;max-width:100%!important;background:transparent!important}
  @media(max-width:700px){
   dialog#workoutModal{inset:0!important;width:100%!important;max-width:none!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;padding:0!important;border-radius:0!important;overflow:hidden!important}
   dialog#workoutModal::backdrop{background:rgba(0,0,0,.72)!important}
   #workoutModal>form,#workoutModal form.wide,#workoutForm{height:100dvh!important;max-height:100dvh!important;overflow-y:auto!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;padding:18px 16px calc(150px + env(safe-area-inset-bottom))!important;box-sizing:border-box!important;scroll-padding-bottom:180px!important}
   #workoutModal .modal-head{position:sticky!important;top:-18px!important;z-index:20!important;padding-top:18px!important;background:var(--panel,#151515)!important}
   #workoutModal .form-actions{position:sticky!important;bottom:calc(-150px - env(safe-area-inset-bottom))!important;z-index:25!important;margin:20px -16px calc(-150px - env(safe-area-inset-bottom))!important;padding:14px 16px calc(14px + env(safe-area-inset-bottom))!important;background:linear-gradient(180deg,rgba(20,20,20,.80),#141414 24%)!important;border-top:1px solid rgba(216,176,139,.16)!important;box-shadow:0 -14px 30px rgba(0,0,0,.32)!important}
   #workoutModal .form-actions .primary{min-height:50px!important}
   #muscleGroupCard .head{margin-bottom:4px!important}
   #muscleGroupCard .muscle-chart-wrap.exercise-radar-wrap{margin:0 -8px!important}
  }
  `;document.head.appendChild(style);
 }

 function apply(){installStyles();requestAnimationFrame(drawRadar)}
 const oldRender=window.render;
 if(typeof oldRender==='function')window.render=function(){const result=oldRender.apply(this,arguments);setTimeout(drawRadar,0);return result};
 const observer=new MutationObserver(()=>{clearTimeout(window.__gymRadarTimer);window.__gymRadarTimer=setTimeout(drawRadar,80)});
 observer.observe(document.body,{childList:true,subtree:true});
 addEventListener('resize',()=>{clearTimeout(window.__gymRadarResize);window.__gymRadarResize=setTimeout(drawRadar,120)});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();

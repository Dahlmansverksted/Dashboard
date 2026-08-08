(()=>{
'use strict';

const PENDING_KEY='dahlman_dashboard_sync_pending_v2';
const REMOTE_KEY='dahlman_dashboard_last_remote_v2';
let lastRemoteUpdate=localStorage.getItem(REMOTE_KEY)||'';
let syncing=false;
let uploadQueued=false;
let initialised=false;
let lastLocalChangeAt=0;
let channel=null;

function setStatus(text,state=''){
  const el=document.getElementById('cloudStatus');
  if(!el)return;
  el.textContent=text;
  el.className=`cloud-status ${state}`.trim();
}

function hasPending(){return localStorage.getItem(PENDING_KEY)==='1'}
function markPending(){localStorage.setItem(PENDING_KEY,'1')}
function clearPending(){localStorage.removeItem(PENDING_KEY)}
function storeRemoteStamp(value=''){
  lastRemoteUpdate=value||lastRemoteUpdate||'';
  if(lastRemoteUpdate)localStorage.setItem(REMOTE_KEY,lastRemoteUpdate);
}

async function request(method='GET',body){
  const response=await fetch('/api/state',{
    method,
    headers:{'Content-Type':'application/json'},
    body:body?JSON.stringify(body):undefined,
    cache:'no-store'
  });
  if(response.status===404)return null;
  if(!response.ok)throw new Error(`HTTP_${response.status}`);
  return response.json();
}

function useRemote(remoteData,updatedAt=''){
  if(!remoteData)return;
  data=migrate(remoteData);
  localStorage.setItem(KEY,JSON.stringify(data));
  storeRemoteStamp(updatedAt);
  render();
}

/* The original dashboard still has a 5 second polling loop. Make its merge
   deletion-safe as well: while a local change is pending, local wins;
   otherwise the newest server snapshot replaces the local snapshot. */
function installAuthoritativeMerge(){
  try{
    window.mergeData=function(local,remote){
      if(hasPending()||Date.now()-lastLocalChangeAt<1200)return migrate(local||{});
      return migrate(remote||local||{});
    };
  }catch(error){console.warn('Could not install authoritative merge',error)}
}
installAuthoritativeMerge();
setTimeout(installAuthoritativeMerge,150);
setTimeout(installAuthoritativeMerge,700);
setTimeout(installAuthoritativeMerge,1800);

async function upload(){
  if(syncing){uploadQueued=true;return}
  syncing=true;
  uploadQueued=false;
  setStatus('Saving…','syncing');
  try{
    const result=await request('PUT',{data,updatedAt:new Date().toISOString()});
    storeRemoteStamp(result?.updatedAt||new Date().toISOString());
    clearPending();
    setStatus('Shared sync','online');
    try{channel?.postMessage({type:'saved',updatedAt:lastRemoteUpdate})}catch{}
  }catch(error){
    console.error(error);
    markPending();
    setStatus('Sync failed','error');
  }finally{
    syncing=false;
    if(uploadQueued||hasPending()&&navigator.onLine){
      uploadQueued=false;
      setTimeout(upload,80);
    }
  }
}

async function pull({initial=false,force=false}={}){
  if(syncing)return;
  if(!force&&(hasPending()||Date.now()-lastLocalChangeAt<1000))return;
  syncing=true;
  try{
    const remote=await request();
    if(!remote?.data){
      syncing=false;
      markPending();
      await upload();
      return;
    }
    if(initial||!remote.updatedAt||remote.updatedAt!==lastRemoteUpdate){
      useRemote(remote.data,remote.updatedAt||'');
    }
    setStatus('Shared sync','online');
  }catch(error){
    console.error(error);
    setStatus('Sync failed','error');
  }finally{
    syncing=false;
  }
}

const originalSave=window.save;
window.save=function(message){
  lastLocalChangeAt=Date.now();
  markPending();
  localStorage.setItem(KEY,JSON.stringify(data));
  render();
  if(message&&typeof toast==='function')toast(message);
  /* Save to D1 immediately. If another save happens mid-request it is queued. */
  upload();
  try{channel?.postMessage({type:'local-change'})}catch{}
};

async function initialise(){
  setStatus('Connecting…','syncing');
  if(hasPending()){
    await upload();
    if(!hasPending())await pull({initial:true,force:true});
  }else{
    await pull({initial:true,force:true});
  }
  initialised=true;
  window.dispatchEvent(new CustomEvent('dashboard-sync-ready'));
}

try{
  channel=new BroadcastChannel('dahlman-dashboard-sync-v2');
  channel.addEventListener('message',event=>{
    if(event.data?.type==='saved'&&!hasPending())setTimeout(()=>pull({force:true}),40);
  });
}catch{}

window.addEventListener('storage',event=>{
  if(event.key===KEY&&!hasPending()&&!syncing){
    try{data=migrate(JSON.parse(event.newValue||'{}'));render()}catch{}
  }
});
window.addEventListener('focus',()=>{if(initialised)pull({force:true})});
window.addEventListener('pageshow',()=>{if(initialised)pull({force:true})});
window.addEventListener('online',()=>{hasPending()?upload():pull({force:true})});
document.addEventListener('visibilitychange',()=>{if(initialised&&!document.hidden)pull({force:true})});

const connectButton=document.getElementById('cloudSetup');
if(connectButton)connectButton.remove();
initialise();
/* Faster cross-device refresh without hammering D1. */
setInterval(()=>{if(initialised&&!document.hidden)pull()},2000);
})();

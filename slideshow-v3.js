(()=>{
const images=Array.from({length:9},(_,i)=>`assets/background-${String(i+1).padStart(2,'0')}.jpg`);
const slides=[...document.querySelectorAll('.bg-slide')];
if(slides.length<2)return;
let valid=[],index=0,active=0;
function show(src,first=false){const next=first?active:1-active;slides[next].style.backgroundImage=`url("${src}")`;slides[next].classList.add('active');if(!first){slides[active].classList.remove('active');active=next}}
images.forEach(src=>{const img=new Image();img.onload=()=>{valid.push(src);if(valid.length===1)show(src,true)};img.onerror=()=>console.warn('Background image missing:',src);img.src=src});
setInterval(()=>{if(valid.length<2)return;index=(index+1)%valid.length;show(valid[index])},18000);
})();

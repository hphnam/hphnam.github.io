export function startGlassNavigation(doc=document,win=window){
 const header=doc.querySelector('.glass-nav');if(!header||header.dataset.glassReady)return;header.dataset.glassReady='true';
 let pending=false;
 const update=()=>{pending=false;header.classList.toggle('is-scrolled',win.scrollY>24);};
 const schedule=()=>{if(!pending){pending=true;win.requestAnimationFrame(update);}};
 win.addEventListener('scroll',schedule,{passive:true});win.addEventListener('hashchange',schedule);update();
}
if(typeof document!=='undefined')startGlassNavigation();

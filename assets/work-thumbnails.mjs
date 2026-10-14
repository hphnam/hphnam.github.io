export function startWorkThumbnailMotion(doc=document,win=window){
 const reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
 doc.querySelectorAll('.ww-work-cover.work-thumbnail,.market-signal-thumb').forEach(thumb=>{
  if(thumb.dataset.hoverReady)return;thumb.dataset.hoverReady='true';
  let pending=0,position=null;
  function clear(){if(pending)win.cancelAnimationFrame(pending);pending=0;position=null;thumb.style.removeProperty('--thumb-x');thumb.style.removeProperty('--thumb-y');}
  thumb.addEventListener('pointermove',event=>{
   if(event.pointerType==='touch'||reduced.matches||doc.body.classList.contains('motion-paused')){clear();return;}
   const rect=thumb.getBoundingClientRect();if(!rect.width||!rect.height)return;
   position={x:Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1))*5,y:Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1))*4};
   if(!pending)pending=win.requestAnimationFrame(()=>{pending=0;if(position){thumb.style.setProperty('--thumb-x',position.x.toFixed(2)+'px');thumb.style.setProperty('--thumb-y',position.y.toFixed(2)+'px');}});
  });
  thumb.addEventListener('pointerleave',clear);win.addEventListener('hashchange',clear);reduced.addEventListener('change',clear);
 });
}
if(typeof document!=='undefined')startWorkThumbnailMotion();

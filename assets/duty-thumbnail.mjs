export function startDutyThumbnails(doc=document,win=window){
 const thumbs=[...doc.querySelectorAll('.duty-motion-thumb')];
 if(!thumbs.length)return;
 const visible=new Set();
 const sync=()=>thumbs.forEach(thumb=>thumb.classList.toggle('is-thumb-visible',visible.has(thumb)&&!doc.hidden&&!thumb.closest('[hidden]')&&!doc.body.classList.contains('motion-paused')));
 if('IntersectionObserver' in win){
  const observer=new win.IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);}sync();},{threshold:.12});
  thumbs.forEach(thumb=>observer.observe(thumb));
 }else{thumbs.forEach(thumb=>visible.add(thumb));}
 doc.addEventListener('visibilitychange',sync);win.addEventListener('hashchange',sync);
 const state=new win.MutationObserver(sync);state.observe(doc.body,{attributes:true,attributeFilter:['class']});
 thumbs.forEach(thumb=>{const route=thumb.closest('.route');if(route)state.observe(route,{attributes:true,attributeFilter:['hidden']});});
 sync();
}
if(typeof document!=='undefined')startDutyThumbnails();

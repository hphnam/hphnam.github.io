const gallery = document.querySelector('#bs-social');
if (gallery) {
 const wall=gallery.querySelector('.bs-gallery-wall');
 const filters=[...gallery.querySelectorAll('[data-bs-gallery-filter]')];
 const cards=[...gallery.querySelectorAll('[data-bs-gallery-category]')];
 const video=gallery.querySelector('#bs-sticker-video');
 const toggle=gallery.querySelector('#bs-sticker-motion-toggle');
 const route=gallery.closest('.route');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let inView=false,pausedByUser=false,manualPlay=false;
 function syncMotion(){
  const play=inView&&!pausedByUser&&(!reduced.matches||manualPlay)&&!document.hidden&&!video.closest('[hidden]')&&!document.querySelector('.motion-paused');
  if(play)video.play().catch(()=>{toggle.textContent='Play motion ▶';toggle.setAttribute('aria-pressed','false');});else video.pause();
  toggle.textContent=play?'Pause motion Ⅱ':'Play motion ▶';toggle.setAttribute('aria-pressed',String(play));
 }
 filters.forEach(button=>button.addEventListener('click',()=>{
  const choice=button.dataset.bsGalleryFilter;
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  cards.forEach(card=>card.hidden=choice!=='all'&&card.dataset.bsGalleryCategory!==choice);
  wall.dataset.bsGalleryView=choice;syncMotion();
 }));
 toggle.addEventListener('click',()=>{if(toggle.getAttribute('aria-pressed')==='true'){pausedByUser=true;manualPlay=false;}else{pausedByUser=false;manualPlay=true;inView=true;}syncMotion();});
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.target===video){inView=e.isIntersecting;syncMotion();}},{threshold:.2});observer.observe(video);}
 const stateObserver=new MutationObserver(syncMotion);
 stateObserver.observe(route,{attributes:true,attributeFilter:['hidden']});
 stateObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',syncMotion);
 window.addEventListener('hashchange',syncMotion);
 reduced.addEventListener?.('change',()=>{manualPlay=false;syncMotion();});
 syncMotion();
}

(()=>{
 'use strict';
 const targets=document.querySelectorAll('.heritage-drum,.coop-croissant-preview');
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(({target,isIntersecting})=>target.classList.toggle('craft-in-view',isIntersecting&&!target.closest('[hidden]')));
 },{threshold:.15});
 targets.forEach(target=>observer.observe(target));
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden)targets.forEach(target=>target.classList.remove('craft-in-view'));
  else targets.forEach(target=>{observer.unobserve(target);observer.observe(target);});
 });
})();

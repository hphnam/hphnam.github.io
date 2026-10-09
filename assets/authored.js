(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const surfaces=[...document.querySelectorAll('.source-heading,.authored-case .case-step')];
 const arrival=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting&&!e.target.closest('[hidden]'))e.target.classList.add('source-arrived');
 }),{threshold:.1});
 function observe(){surfaces.forEach(s=>{if(reduced.matches||document.body.classList.contains('motion-paused'))s.classList.add('source-arrived');else if(!s.closest('[hidden]'))arrival.observe(s);});}
 window.addEventListener('hashchange',observe);reduced.addEventListener('change',observe);observe();
})();

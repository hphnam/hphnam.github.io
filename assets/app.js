(()=>{
  'use strict';
  const routes=[...document.querySelectorAll('[data-route]')];
  const nav=document.getElementById('mobile-nav');
  const toggle=document.querySelector('.menu-toggle');
  const closeMenu=()=>{nav.hidden=true;toggle.setAttribute('aria-expanded','false')};
  const getRoute=()=>{const h=location.hash.slice(1)||'/';return routes.some(x=>x.dataset.route===h)?h:'/'};
  let current='';
  function show(){
    const path=getRoute();
    if(path===current)return;
    current=path;
    routes.forEach(el=>{el.hidden=el.dataset.route!==path});
    const active=routes.find(el=>!el.hidden);
    const title=active.querySelector('h1')?.textContent.trim().replace(/\s+/g,' ');
    document.title=path==='/'?'Nam Hoang — AI Consultant':`${title} — Nam Hoang`;
    document.querySelectorAll('.site-header nav a,.mobile-nav a').forEach(a=>{
      if(path.startsWith(a.getAttribute('href').slice(1)))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    closeMenu();
    window.scrollTo({top:0,behavior:'instant'});
    if(path!=='/')document.getElementById('main-content').focus({preventScroll:true});
  }
  toggle.addEventListener('click',()=>{nav.hidden=!nav.hidden;toggle.setAttribute('aria-expanded',String(!nav.hidden))});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  window.addEventListener('hashchange',show);
  document.querySelectorAll('[data-scroll]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.getElementById(a.dataset.scroll)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}));
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    const cards=[...document.querySelectorAll('.collection-grid .work-card')];
    cards.forEach(card=>card.hidden=filter!=='all'&&card.dataset.category!==filter);
    document.querySelector('.collection-count').textContent=`${cards.filter(x=>!x.hidden).length} projects`;
  }));
  show();
})();

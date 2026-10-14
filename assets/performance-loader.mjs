// Case controllers are requested only when a visitor opens the relevant page.
export const routeModules = {
 '/case-study/cs-the-proactive-brain':['brain-native.mjs','case-mechanisms.mjs'],
 '/case-study/cs-what-a-croissant-taught-a-model':['coop-native.mjs','case-mechanisms.mjs'],
 '/case-study/cs-beauty-now':['bespoke-campaign.mjs','animated-kv.js'],
 '/case-study/cs-let-them-spill-it':['spill-campaign.js'],
 '/work/the-beer-wrote-the-brief':['becks-summer.mjs','becks-social.mjs'],
 '/work/coaching-smaller-models':['werewolf-case.mjs','werewolf-engine.mjs'],
 '/work/directing-a-camera-that-isnt-there':['camera-lab.mjs'],
 '/work/stop-heatdumping':['aqua-case.mjs','aqua-enrichment.mjs'],
 '/work/can-a-neural-net-read-a-market':['market-research.mjs'],
 '/about':['about-profile.mjs']
};
export function startPerformanceLoading(doc=document,view=window,importer=name=>import('./'+name)){
 const loaded=new Map();
 function activate(){
  const route=doc.querySelector('.route:not([hidden])');if(!route)return;
  route.querySelectorAll('[data-route-src]').forEach(img=>{img.src=img.dataset.routeSrc;img.removeAttribute('data-route-src');});
  route.querySelectorAll('[data-route-poster]').forEach(video=>{video.poster=video.dataset.routePoster;video.removeAttribute('data-route-poster');});
  for(const name of routeModules[route.dataset.route]||[]){
   if(!loaded.has(name))loaded.set(name,importer(name).catch(error=>{loaded.delete(name);console.error('Could not load project controls:',name,error);}));
  }
 }
 view.addEventListener('hashchange',activate);activate();
 return {activate,loaded};
}
if(typeof document!=='undefined')startPerformanceLoading();

// Supporting social/MV players wait until their actual section approaches view.
export function startDeferredFrames(doc=document,view=window){
 const frames=[...doc.querySelectorAll('[data-inview-src],[data-bespoke-youtube],[data-spill-post]')],near=new Set();
 function sync(){frames.forEach(frame=>{const active=!frame.closest('[hidden]')&&!doc.hidden;const url=frame.dataset.inviewSrc;if(active&&near.has(frame)&&url&&!frame.getAttribute('src'))frame.src=url;else if(!active&&frame.getAttribute('src'))frame.removeAttribute('src');});}
 const observer=typeof view.IntersectionObserver==='function'?new view.IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?near.add(e.target):near.delete(e.target));sync();},{rootMargin:'250px'}):null;
 if(observer)frames.forEach(frame=>observer.observe(frame));else frames.forEach(frame=>near.add(frame));
 const mutation=typeof view.MutationObserver==='function'?new view.MutationObserver(sync):null;
 frames.forEach(frame=>mutation?.observe(frame,{attributes:true,attributeFilter:['data-inview-src']}));
 doc.querySelectorAll('.route').forEach(route=>mutation?.observe(route,{attributes:true,attributeFilter:['hidden']}));
 view.addEventListener('hashchange',sync);doc.addEventListener('visibilitychange',sync);sync();return {sync,observer};
}
if(typeof document!=='undefined')startDeferredFrames();

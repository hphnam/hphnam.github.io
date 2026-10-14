// Only the front-of-case films autoplay. Hidden routes never keep playing.
export function startCampaignAutoplay(doc=document,view=window){
 const nodes=[...doc.querySelectorAll('[data-campaign-autoplay-src],[data-campaign-autoplay-video]')];
 const states=new Map(nodes.map(node=>[node,{visible:false,manualPause:false,changing:false}]));
 const routeFor=node=>node.closest('.route');
 function allowed(node){const state=states.get(node);return state.visible&&!routeFor(node)?.hidden&&!doc.hidden&&!doc.body.classList.contains('motion-paused')&&!state.manualPause;}
 function sync(node){
  const state=states.get(node),active=allowed(node);
  if(node.tagName==='IFRAME'){
   if(active&&!node.getAttribute('src'))node.setAttribute('src',node.dataset.campaignAutoplaySrc);
   else if(!active&&node.getAttribute('src'))node.removeAttribute('src');
  }else{
   state.changing=true;
   if(active){node.muted=node.dataset.campaignSound!=='on';node.defaultMuted=true;node.autoplay=true;node.play()?.catch(()=>{node.autoplay=false;});}
   else{node.autoplay=false;node.pause();}
   state.changing=false;
  }
 }
 nodes.forEach(node=>{
  if(node.tagName==='VIDEO'){
   node.muted=true;node.defaultMuted=true;
   node.addEventListener('volumechange',()=>{node.dataset.campaignSound=node.muted?'off':'on';});
   node.addEventListener('pause',()=>{if(!states.get(node).changing&&allowed(node)&&!node.ended)states.get(node).manualPause=true;});
   node.addEventListener('play',()=>{states.get(node).manualPause=false;});
  }
  sync(node);
 });
 const observer=typeof view.IntersectionObserver==='function'?new view.IntersectionObserver(entries=>{for(const entry of entries){states.get(entry.target).visible=entry.isIntersecting&&entry.intersectionRatio>=.15;sync(entry.target);}},{threshold:[0,.15,.5]}):null;
 if(observer)nodes.forEach(node=>observer.observe(node));else nodes.forEach(node=>{states.get(node).visible=true;sync(node);});
 const syncAll=()=>nodes.forEach(sync);
 view.addEventListener('hashchange',()=>{for(const node of nodes){const state=states.get(node);if(routeFor(node)?.hidden)state.manualPause=false;}syncAll();});
 doc.addEventListener('visibilitychange',syncAll);
 const motion=typeof view.MutationObserver==='function'?new view.MutationObserver(syncAll):null;
 motion?.observe(doc.body,{attributes:true,attributeFilter:['class']});
 // Route visibility can change after the hash handler runs.
 const routes=typeof view.MutationObserver==='function'?new view.MutationObserver(syncAll):null;
 for(const route of new Set(nodes.map(routeFor)))if(route)routes?.observe(route,{attributes:true,attributeFilter:['hidden']});
 return {sync:syncAll,states,observer};
}
if(typeof document!=='undefined')startCampaignAutoplay();

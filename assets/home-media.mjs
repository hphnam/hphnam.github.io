export function startHomeMedia(doc=document,win=window){
 const cards=[...doc.querySelectorAll('[data-home-reel]')];
 if(!cards.length||cards[0].dataset.reelReady)return;
 const home=cards[0].closest('[data-route]'),reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
 const states=cards.map(card=>({card,video:card.querySelector('video'),button:card.querySelector('[data-reel-toggle]'),progress:card.querySelector('[data-reel-progress]'),visible:false,userPaused:false,manual:false,pending:false,failed:false,generation:0}));
 const allowed=s=>s.visible&&!home.hidden&&!doc.hidden&&!doc.body.classList.contains('motion-paused')&&!s.userPaused&&!s.failed&&(!reduced.matches||s.manual);
 function render(s,playing){
  s.card.dataset.playing=String(playing);s.button.textContent=playing?'Pause preview':s.failed?'Retry preview':'Play 15s preview';s.button.setAttribute('aria-label',(playing?'Pause':'Play')+' preview: '+s.card.dataset.reelTitle);s.button.setAttribute('aria-pressed',String(playing));
 }
 function pause(s){s.generation++;s.pending=false;s.video.pause();render(s,false);}
 function sync(s){
  if(!allowed(s)){if(s.pending||!s.video.paused)pause(s);else render(s,false);return;}
  if(!s.video.paused||s.pending)return;
  const generation=++s.generation;s.pending=true;s.video.muted=true;
  Promise.resolve(s.video.play()).then(()=>{
   if(generation!==s.generation){if(!allowed(s))s.video.pause();return;}
   s.pending=false;if(allowed(s))render(s,true);else pause(s);
  }).catch(()=>{if(generation!==s.generation)return;s.pending=false;s.userPaused=true;render(s,false);});
 }
 const syncAll=()=>states.forEach(sync);
 const io=new win.IntersectionObserver(entries=>{
  for(const entry of entries){const s=states.find(s=>s.card===entry.target);if(!s)continue;s.visible=entry.isIntersecting&&entry.intersectionRatio>=.35;sync(s);}
 },{threshold:.35});
 for(const s of states){
  s.card.dataset.reelReady='true';s.video.controls=false;s.video.muted=true;s.video.defaultMuted=true;s.video.loop=true;
  render(s,false);io.observe(s.card);
  s.button.addEventListener('click',()=>{
   if(!s.video.paused||s.pending){s.userPaused=true;pause(s);return;}
   s.userPaused=false;s.manual=true;s.visible=true;
   if(s.failed){s.failed=false;s.video.load();}
   sync(s);
  });
  s.video.addEventListener('timeupdate',()=>{const duration=Number.isFinite(s.video.duration)&&s.video.duration>0?s.video.duration:15;s.progress.style.setProperty('--reel-progress',String(Math.min(1,Math.max(0,s.video.currentTime/duration))));});
  s.video.addEventListener('play',()=>{if(allowed(s))render(s,true);else pause(s);});
  s.video.addEventListener('pause',()=>render(s,false));
  s.video.addEventListener('error',()=>{s.failed=true;pause(s);});
 }
 const observer=new win.MutationObserver(syncAll);observer.observe(doc.body,{attributes:true,attributeFilter:['class']});observer.observe(home,{attributes:true,attributeFilter:['hidden']});
 doc.addEventListener('visibilitychange',syncAll);win.addEventListener('hashchange',syncAll);reduced.addEventListener('change',syncAll);
 return {states,syncAll,disconnect(){io.disconnect();observer.disconnect();doc.removeEventListener('visibilitychange',syncAll);win.removeEventListener('hashchange',syncAll);states.forEach(pause);}};
}
if(typeof document!=='undefined')startHomeMedia();

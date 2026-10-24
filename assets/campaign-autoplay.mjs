// Sound-first case films. Homepage preview reels have their own silent controller.
let vimeoSDK,youtubeSDK;
function loadVimeo(doc,view){
 if(view.Vimeo?.Player)return Promise.resolve(view.Vimeo);
 if(!vimeoSDK)vimeoSDK=new Promise((resolve,reject)=>{const script=doc.createElement('script');script.src=new URL('./vimeo-player.js',import.meta.url).href;script.onload=()=>resolve(view.Vimeo);script.onerror=()=>{vimeoSDK=null;reject(new Error('Vimeo controls unavailable'));};doc.head.append(script);});
 return vimeoSDK;
}
function loadYoutube(doc,view){
 if(view.YT?.Player)return Promise.resolve(view.YT);
 if(!youtubeSDK)youtubeSDK=new Promise((resolve,reject)=>{const previous=view.onYouTubeIframeAPIReady;view.onYouTubeIframeAPIReady=()=>{previous?.();resolve(view.YT);};const script=doc.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{youtubeSDK=null;reject(new Error('YouTube controls unavailable'));};doc.head.append(script);});
 return youtubeSDK;
}
export function startCampaignAutoplay(doc=document,view=window){
 const nodes=[...doc.querySelectorAll('[data-campaign-autoplay-src],[data-campaign-autoplay-video]')];
 const states=new Map();
 const allowed=node=>{const s=states.get(node);return s.visible&&!node.closest('[hidden]')&&!doc.hidden&&!doc.body.classList.contains('motion-paused')&&!doc.querySelector('.film-dialog[open]')&&!s.manualPause;};
 function render(node){const s=states.get(node);s.button.textContent=s.muted?'Turn sound on':s.playing?'Sound on · mute':'Play with sound';s.button.setAttribute('aria-label',s.muted?'Turn film sound on':s.playing?'Mute film':'Play film with sound');s.button.setAttribute('aria-pressed',String(!s.muted&&s.playing));node.dataset.campaignPlayback=s.playing?'playing':'paused';node.dataset.campaignSound=s.muted?'off':'on';}
 function pause(node){const s=states.get(node);s.generation++;s.starting=false;s.expectedPause=true;s.playing=false;
  if(node.tagName==='VIDEO')node.pause();
  else if(s.ready){if(s.provider==='vimeo')s.api.pause().catch(()=>{});else s.api.pauseVideo();}
  else if(node.getAttribute('src'))node.removeAttribute('src');
  render(node);
 }
 async function playNative(node,withSound=false){const s=states.get(node);if(s.starting)return;const generation=++s.generation;s.starting=true;
  if(withSound){node.muted=false;node.volume=1;}
  try{await node.play();}
  catch(error){if(generation!==s.generation||!allowed(node))return;if(error.name==='NotAllowedError'&&!node.muted){node.muted=true;try{await node.play();}catch{s.playing=false;}}}
  finally{if(generation===s.generation){s.starting=false;s.muted=node.muted||node.volume===0;s.playing=!node.paused;render(node);if(!allowed(node))pause(node);}}
 }
 async function playVimeo(node,withSound=false){const s=states.get(node);if(!s.ready||s.starting)return;const generation=++s.generation;s.starting=true;
  try{if(withSound){await s.api.setMuted(false);await s.api.setVolume(1);}await s.api.play();}
  catch(error){if(generation!==s.generation||!allowed(node))return;if(error.name==='NotAllowedError'){await s.api.setMuted(true);s.muted=true;try{await s.api.play();}catch{s.playing=false;}}}
  finally{if(generation===s.generation){s.starting=false;render(node);if(!allowed(node))pause(node);}}
 }
 function playYoutube(node,withSound=false){const s=states.get(node);if(!s.ready)return;if(withSound){s.api.unMute();s.api.setVolume(100);s.muted=false;}s.api.playVideo();render(node);}
 function begin(node,withSound=false){const s=states.get(node);if(!allowed(node))return;if(node.tagName==='VIDEO')playNative(node,withSound);else if(s.provider==='vimeo')playVimeo(node,withSound);else playYoutube(node,withSound);}
 async function setupFrame(node){const s=states.get(node);if(s.settingUp||s.api)return;s.settingUp=true;
  try{
   if(s.provider==='vimeo'){
    const sdk=await loadVimeo(doc,view);s.api=new sdk.Player(node);
    s.api.on('play',()=>{s.expectedPause=false;s.playing=true;s.manualPause=false;render(node);if(!allowed(node))pause(node);});
    s.api.on('pause',()=>{s.playing=false;if(s.expectedPause)s.expectedPause=false;else if(allowed(node)&&!s.starting)s.manualPause=true;render(node);});
    s.api.on('volumechange',async()=>{try{s.muted=await s.api.getMuted()||(await s.api.getVolume())===0;render(node);}catch{}});
    s.api.on('ended',()=>{s.playing=false;render(node);});
    await s.api.ready();s.ready=true;if(allowed(node))begin(node,true);else pause(node);
   }else{
    const sdk=await loadYoutube(doc,view);s.api=new sdk.Player(node,{events:{onReady:()=>{s.ready=true;if(allowed(node))begin(node,true);else pause(node);},onStateChange:event=>{s.playing=event.data===1;if(event.data===1){s.expectedPause=false;s.manualPause=false;s.muted=s.api.isMuted();if(!allowed(node))pause(node);}else if(event.data===2){if(s.expectedPause)s.expectedPause=false;else if(allowed(node))s.manualPause=true;}render(node);},onAutoplayBlocked:()=>{if(!allowed(node)||s.muted)return;s.api.mute();s.muted=true;s.api.playVideo();render(node);}}});
   }
  }catch{render(node);}finally{s.settingUp=false;}
 }
 function sync(node){const s=states.get(node);if(!allowed(node)){pause(node);return;}
  if(node.tagName==='IFRAME'){
   if(!node.getAttribute('src')){const url=new URL(node.dataset.campaignAutoplaySrc);if(s.provider==='youtube'){url.searchParams.set('enablejsapi','1');url.searchParams.set('origin',view.location.origin);}node.src=url.href;}
   if(!s.api)setupFrame(node);else if(s.ready&&!s.playing&&!s.manualPause)begin(node);
  }else if(node.paused&&!s.manualPause)begin(node);
 }
 for(const [index,node]of nodes.entries()){
  const provider=node.tagName==='VIDEO'?'native':node.dataset.campaignAutoplaySrc.includes('vimeo.com')?'vimeo':'youtube';
  const controls=doc.createElement('div');controls.className='campaign-audio-controls';const button=doc.createElement('button');button.type='button';button.className='campaign-sound-button';controls.append(button);
  const host=node.closest('[data-campaign-player],.campaign-front-film')||node.parentElement;host.append(controls);
  states.set(node,{visible:false,manualPause:false,expectedPause:false,playing:false,muted:false,api:null,ready:false,settingUp:false,starting:false,generation:0,provider,button});
  if(!node.id)node.id='campaign-film-'+index;
  if(provider==='native'){
   node.removeAttribute('muted');node.defaultMuted=false;node.muted=false;
   node.addEventListener('play',()=>{const s=states.get(node);s.expectedPause=false;s.manualPause=false;s.playing=true;render(node);if(!allowed(node))pause(node);});
   node.addEventListener('pause',()=>{const s=states.get(node);s.playing=false;if(s.expectedPause)s.expectedPause=false;else if(allowed(node)&&!s.starting&&!node.ended)s.manualPause=true;render(node);});
   node.addEventListener('volumechange',()=>{const s=states.get(node);s.muted=node.muted||node.volume===0;render(node);});
  }
  button.addEventListener('click',()=>{const s=states.get(node);if(s.playing&&!s.muted){if(provider==='native')node.muted=true;else if(s.ready&&provider==='vimeo')s.api.setMuted(true).catch(()=>{});else if(s.ready)s.api.mute();s.muted=true;render(node);return;}s.manualPause=false;s.visible=true;s.expectedPause=true;s.muted=false;begin(node,true);if(!s.ready&&provider!=='native')sync(node);});
  render(node);
 }
 const syncAll=()=>nodes.forEach(sync);
 const io=new view.IntersectionObserver(entries=>{for(const e of entries){states.get(e.target).visible=e.isIntersecting&&e.intersectionRatio>=.15;sync(e.target);}},{threshold:[0,.15,.5]});nodes.forEach(n=>io.observe(n));
 view.addEventListener('hashchange',()=>{for(const n of nodes)if(n.closest('.route')?.hidden)states.get(n).manualPause=false;syncAll();});view.addEventListener('campaignmediachange',syncAll);doc.addEventListener('visibilitychange',syncAll);
 const observer=new view.MutationObserver(syncAll);observer.observe(doc.body,{attributes:true,attributeFilter:['class']});for(const route of new Set(nodes.map(n=>n.closest('.route'))))if(route)observer.observe(route,{attributes:true,attributeFilter:['hidden']});for(const modal of doc.querySelectorAll('.film-dialog'))observer.observe(modal,{attributes:true,attributeFilter:['open']});
 return {states,sync:syncAll,observer,io};
}
if(typeof document!=='undefined')startCampaignAutoplay();

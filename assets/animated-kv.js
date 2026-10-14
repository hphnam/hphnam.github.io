(()=>{
 'use strict';
 const videos=[...document.querySelectorAll('[data-animated-kv]')],visible=new Set();
 videos.forEach(video=>{video.muted=true;video.defaultMuted=true;});
 function sync(){videos.forEach(video=>{if(!visible.has(video)||video.closest('[hidden]')||document.hidden||document.body.classList.contains('motion-paused'))video.pause();else video.play().catch(()=>{});});}
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>entry.isIntersecting?visible.add(entry.target):visible.delete(entry.target));sync();},{threshold:.1});
 videos.forEach(video=>observer.observe(video));
 window.addEventListener('hashchange',sync);document.addEventListener('visibilitychange',sync);
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});sync();
})();

(()=>{
'use strict';
const videos=[...document.querySelectorAll('[data-animated-kv]')];
videos.forEach(video=>{video.muted=true;video.defaultMuted=true;});
function sync(){videos.forEach(video=>{if(video.closest('[hidden]')||document.hidden)video.pause();else video.play().catch(()=>{});});}
window.addEventListener('hashchange',sync);document.addEventListener('visibilitychange',sync);sync();
})();

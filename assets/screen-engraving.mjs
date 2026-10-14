// Keep the artwork within its native pixel budget, including Retina displays.
export function sizeScreen(cover,view=window){if(!cover)return;const density=Math.max(1,view.devicePixelRatio||1);cover.style.setProperty('--screen-resolution-width',(1536/density).toFixed(2)+'px');}
if(typeof document!=='undefined'){const cover=document.querySelector('.entrance-cover');const update=()=>sizeScreen(cover);update();window.addEventListener('resize',update,{passive:true});}

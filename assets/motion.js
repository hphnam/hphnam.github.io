(()=>{
'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
const cover=document.querySelector('.entrance-cover'),openButton=document.querySelector('.open-portfolio'),pauseButton=document.querySelector('.motion-toggle'),main=document.getElementById('main-content');
const behind=[document.querySelector('.site-header'),document.getElementById('mobile-nav'),main,document.querySelector('.contact-footer')];
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const onHome=()=>!document.querySelector('[data-route="/"]').hidden;
let opened=false,paused=false,clickOpening=false,progress=0,raf=0,startTime=0,startProgress=0,focusOnOpen=false;
const timers=new Set();
function later(fn,ms){const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);}
function lockScreen(value){behind.forEach(el=>{el.inert=value;});}
function arriveHero(){
 document.querySelectorAll('.hero-object').forEach((el,i)=>{el.classList.remove('is-visible');later(()=>el.classList.add('is-visible'),reduced.matches?0:180+i*170);});
 const drum=document.querySelector('.hero-drum');drum.classList.remove('is-visible');later(()=>drum.classList.add('is-visible'),reduced.matches?0:330);
}
function finishOpening(){
 if(opened)return;
 if(clickOpening||!onHome())document.body.classList.add('entrance-clicked');
 opened=true;clickOpening=false;cover.classList.add('is-open');cover.setAttribute('aria-hidden','true');lockScreen(false);
 document.body.classList.add('entrance-revealed');arriveHero();
 if(focusOnOpen)main.focus({preventScroll:true});
}
function drawScreen(value){
 progress=clamp(value);cover.style.setProperty('--latch-open',progress.toFixed(3));cover.classList.toggle('is-unlocking',progress>.015);const angle=89.5*(1-Math.pow(1-progress,1.55));
 // A leaf inherits the parent rotation and counter-rotates at the shared hinge.
 cover.style.setProperty('--fold',angle.toFixed(3)+'deg');cover.style.setProperty('--counter-fold',(2*angle).toFixed(3)+'deg');
 cover.style.setProperty('--label-opacity',String(clamp(1-progress*5)));cover.style.setProperty('--cover-opacity',String(1-clamp((progress-.95)/.05)));
 openButton.disabled=progress>.25;if(progress>=.999)finishOpening();
}
function openPortfolio(keyboard=false){
 if(opened||clickOpening)return;focusOnOpen=keyboard;
 if(reduced.matches){document.body.classList.add('entrance-clicked');finishOpening();return;}
 cover.classList.add('is-unlocking');clickOpening=true;startTime=performance.now();startProgress=progress;requestDraw();
}
// Keep the prose intact while resolving each word along the reading path.
function wordsIn(root,cls){
 const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('.inline-art,.agency-pop')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
 const nodes=[];while(walk.nextNode())nodes.push(walk.currentNode);
 nodes.forEach(node=>{const f=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{if(!word)return;if(/^\s+$/.test(word))f.append(document.createTextNode(word));else{const s=document.createElement('span');s.className=cls;s.textContent=word;f.append(s);}});node.replaceWith(f);});
 return [...root.querySelectorAll('.'+cls)];
}
const stories=[...document.querySelectorAll('.scroll-story')].map(el=>({el,words:wordsIn(el,'story-word')}));
wordsIn(document.querySelector('.hero-copy h1'),'hero-word').forEach((el,i)=>el.style.transitionDelay=(i*45)+'ms');
const artworks=[...document.querySelectorAll('.inline-art')];
artworks.forEach(el=>el.classList.add('reveal-target'));
const io=new IntersectionObserver(entries=>entries.forEach(e=>{
 if(!e.isIntersecting||e.target.closest('[hidden]')||(!opened&&e.target.classList.contains('hero-drum')))return;
 e.target.classList.add('is-visible');io.unobserve(e.target);
}),{threshold:.25,rootMargin:'0px 0px -55px 0px'});
function observeArt(){artworks.forEach(el=>{if(!el.closest('[hidden]')&&!el.classList.contains('is-visible'))io.observe(el);});}
const cards=[...document.querySelectorAll('.work-card')],pieces=[...document.querySelectorAll('.quick-piece')];
const marks=[...document.querySelectorAll('.agency-mark')];let markIndex=0,markNext=performance.now()+1400;
function scrollMotion(now){
 const steady=paused||reduced.matches;
 stories.forEach(({el,words})=>{
  if(el.closest('[hidden]'))return;
  words.forEach(w=>{const r=w.getBoundingClientRect();const value=steady?1:clamp((innerHeight*.85-r.top)/(innerHeight*.4));
   w.style.setProperty('--word-opacity',(.2+.8*value).toFixed(3));w.style.setProperty('--word-blur',((1-value)*7).toFixed(2)+'px');w.style.setProperty('--word-y',((1-value)*16).toFixed(2)+'px');
  });
 });
 cards.forEach(card=>{
  if(card.closest('[hidden]')||card.hidden)return;
  const r=card.getBoundingClientRect(),v=steady?1:clamp((innerHeight-r.top)/(innerHeight*.55));
  card.style.setProperty('--work-rise',((1-v)*70).toFixed(2)+'px');card.style.setProperty('--copy-rise',((1-v)*28).toFixed(2)+'px');card.style.setProperty('--work-opacity',(.55+.45*v).toFixed(3));
 });
 pieces.forEach((el,i)=>{
  const r=el.getBoundingClientRect(),v=steady?1:clamp((innerHeight-r.top-i*16)/(innerHeight*.33));
  el.style.setProperty('--piece-opacity',(.2+.8*v).toFixed(3));el.style.setProperty('--piece-y',((1-v)*100).toFixed(2)+'px');el.style.setProperty('--piece-fold',((1-v)*88-22).toFixed(2)+'deg');
 });
 if(onHome()&&opened&&!steady){
  const travel=clamp(scrollY/(innerHeight*.9));document.querySelectorAll('.hero-object').forEach((el,i)=>el.style.translate=`0 ${-travel*(i?45:75)}px`);
 }
 if(!steady&&now>=markNext&&opened){
  const r=document.querySelector('.agency-pop').getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0){marks[markIndex].classList.remove('is-current');markIndex=(markIndex+1)%marks.length;marks[markIndex].classList.add('is-current');document.querySelector('.agency-pop').style.setProperty('--agency-width',['3.9em','7.1em','3.5em'][markIndex]);}
  markNext=now+1400;
 }
}
function frame(now){
 raf=0;
 if(!opened){
  if(!onHome())finishOpening();
  else if(clickOpening){const t=clamp((now-startTime)/1150),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;drawScreen(startProgress+(1-startProgress)*e);}
  else if(reduced.matches){if(scrollY>12){document.body.classList.add('entrance-clicked');finishOpening();}}
  else drawScreen(scrollY/(innerHeight*.72));
 }
 scrollMotion(now);
 if(clickOpening)requestDraw();
}
function requestDraw(){if(!raf)raf=requestAnimationFrame(frame);}
openButton.addEventListener('click',e=>openPortfolio(e.detail===0));
document.addEventListener('keydown',e=>{if(!opened&&e.key==='Escape'){e.preventDefault();openPortfolio(true);}});
document.querySelector('.skip-link').addEventListener('click',()=>{focusOnOpen=true;document.body.classList.add('entrance-clicked');finishOpening();});
window.addEventListener('scroll',requestDraw,{passive:true});window.addEventListener('resize',requestDraw);
if(onHome()){lockScreen(true);drawScreen(0);}else finishOpening();
if(!reduced.matches){document.body.classList.add('motion-ready');observeArt();}else artworks.forEach(el=>el.classList.add('is-visible'));
window.addEventListener('hashchange',()=>{
 if(!opened)finishOpening();
 document.body.classList.add('entrance-clicked');
 const route=document.querySelector('[data-route]:not([hidden])');
 route.querySelectorAll('.art-heading').forEach(el=>{el.style.animation='none';void el.offsetWidth;el.style.animation='';});
 route.querySelectorAll('.inline-art').forEach(el=>{if(!reduced.matches&&!paused)el.classList.remove('is-visible');});
 if(onHome())arriveHero();observeArt();requestDraw();
});
document.querySelectorAll('[data-filter]').forEach(el=>el.addEventListener('click',()=>requestAnimationFrame(requestDraw)));
pauseButton.addEventListener('click',()=>{
 paused=!paused;document.body.classList.toggle('motion-paused',paused);pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.textContent=paused?'Resume motion':'Pause motion';
 if(paused)artworks.forEach(el=>el.classList.add('is-visible'));else observeArt();requestDraw();
});
reduced.addEventListener('change',()=>{document.body.classList.toggle('motion-ready',!reduced.matches);if(reduced.matches){artworks.forEach(el=>el.classList.add('is-visible'));if(clickOpening)finishOpening();}else observeArt();requestDraw();});
// A gentle repeating logo exchange, without a continuously running animation loop.
setInterval(()=>{if(!document.hidden)requestDraw();},250);
if(fine.matches){
 const cursor=document.createElement('div');cursor.className='view-cursor';cursor.textContent='↗';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);
 let px=0,py=0,active=false,cf=0;
 function cursorDraw(){cf=0;cursor.style.transform=`translate3d(${px-28}px,${py-28}px,0) scale(${active?1:0})`;}
 document.addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;if(!cf)cf=requestAnimationFrame(cursorDraw);},{passive:true});
 document.querySelectorAll('.project-visual,.collection-grid .work-card,.quick-piece,.reel-card .text-link').forEach(el=>{
  el.addEventListener('pointerenter',()=>{if(paused||reduced.matches||!opened)return;active=true;cursor.classList.add('active');cursorDraw();});
  el.addEventListener('pointerleave',()=>{active=false;cursor.classList.remove('active');cursorDraw();});
 });
}
requestDraw();
})();

(()=>{
'use strict';
const dialog=document.querySelector('.film-dialog');
const player=dialog.querySelector('.film-player');
const title=dialog.querySelector('.film-dialog-title');
const external=dialog.querySelector('.film-external');
document.querySelectorAll('[data-youtube]').forEach(button=>button.addEventListener('click',()=>{
 const id=button.dataset.youtube;if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
 const label=button.dataset.videoTitle||'Project film';title.textContent=label;
 external.href='https://www.youtube.com/watch?v='+id;
 const iframe=document.createElement('iframe');iframe.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0';iframe.title=label;iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';
 player.replaceChildren(iframe);dialog.showModal();
}));
dialog.querySelector('.close-film').addEventListener('click',()=>{player.replaceChildren();dialog.close();});
dialog.addEventListener('close',()=>player.replaceChildren());
window.addEventListener('hashchange',()=>{if(dialog.open){player.replaceChildren();dialog.close();}});
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
// Keep authored media slots wired for the owner's real files when they arrive.
if(location.protocol==='file:')return;
const slots=new IntersectionObserver(entries=>entries.forEach(async entry=>{
 if(!entry.isIntersecting||entry.target.closest('[hidden]'))return;
 const el=entry.target;slots.unobserve(el);const name=el.dataset.originalMedia;
 if(!/^[A-Za-z0-9_.-]+\.(mp4|webm|png|jpg|jpeg|gif)$/.test(name))return;
 const url='media/'+name;
 try{const r=await fetch(url,{method:'HEAD',cache:'force-cache'});const type=r.headers.get('content-type')||'';if(!r.ok||!type.startsWith(/\.(mp4|webm)$/.test(name)?'video/':'image/'))return;
  const media=document.createElement(type.startsWith('video/')?'video':'img');media.src=url;
  if(media.tagName==='VIDEO'){media.controls=true;media.preload='metadata';media.playsInline=true;}else{media.alt=name.replace(/[-_]/g,' ').replace(/\.[^.]+$/,'');media.loading='lazy';}
  el.classList.add('is-loaded');el.append(media);
 }catch{}
}),{rootMargin:'100px'});
const observe=()=>document.querySelectorAll('.media-slot').forEach(el=>{if(!el.closest('[hidden]')&&!el.classList.contains('is-loaded'))slots.observe(el);});observe();window.addEventListener('hashchange',observe);
})();

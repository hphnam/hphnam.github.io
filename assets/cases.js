(()=>{
 'use strict';
 const dialog=document.querySelector('.evidence-dialog');
 const holder=dialog.querySelector('.evidence-dialog-image');
 const caption=dialog.querySelector('.evidence-dialog-caption');
 document.querySelectorAll('.evidence-open').forEach(button=>button.addEventListener('click',()=>{
  const original=button.querySelector('img');
  const image=document.createElement('img');image.src=original.src;image.alt=original.alt;
  holder.replaceChildren(image);holder.scrollTo(0,0);caption.textContent=button.dataset.evidenceCaption;
  dialog.showModal();
 }));
 dialog.querySelector('.close-evidence').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>holder.replaceChildren());
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 window.addEventListener('hashchange',()=>{if(dialog.open)dialog.close();});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const figures=[...document.querySelectorAll('.project-evidence')];
 const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting&&!e.target.closest('[hidden]'))e.target.classList.add('is-revealed');
 }),{threshold:.08});
 const observe=()=>{
  document.body.classList.toggle('case-evidence-motion',!reduced.matches);
  figures.forEach(figure=>{if(reduced.matches||document.body.classList.contains('motion-paused'))figure.classList.add('is-revealed');else if(!figure.closest('[hidden]'))reveal.observe(figure);});
 };
 const videos=[...document.querySelectorAll('.source-motion')],visible=new Set();
 const permitted=video=>visible.has(video)&&!video.closest('[hidden]')&&!document.hidden&&!reduced.matches&&!document.body.classList.contains('motion-paused');
 const updateVideo=()=>videos.forEach(video=>{
  const shouldPlay=permitted(video)&&video.dataset.userPaused!=='true';
  if(shouldPlay)video.play().catch(()=>{});
  else {video.dataset.automaticPause='true';video.pause();}
 });
 videos.forEach(video=>{
  video.addEventListener('pause',()=>{if(video.dataset.automaticPause!=='true'&&permitted(video))video.dataset.userPaused='true';delete video.dataset.automaticPause;});
  video.addEventListener('play',()=>{video.dataset.userPaused='false';delete video.dataset.automaticPause;});
 });
 const videoObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target);});updateVideo();},{threshold:.2});
 videos.forEach(video=>videoObserver.observe(video));
 window.addEventListener('hashchange',()=>{observe();updateVideo();});
 document.addEventListener('visibilitychange',updateVideo);
 reduced.addEventListener('change',()=>{observe();updateVideo();});
 new MutationObserver(()=>{observe();updateVideo();}).observe(document.body,{attributes:true,attributeFilter:['class']});
 observe();
})();

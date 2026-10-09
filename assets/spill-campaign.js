(()=>{
'use strict';
const root=document.querySelector('.spill-case');if(!root)return;
const snapshots={24:{image:'assets/spill-mv-24h.png',metrics:[['1.6M++','Real-time views'],['76K++','YouTube likes'],['300K++','Interactions'],['#11','Trending YouTube'],['#4','Trending Music YouTube']]},54:{image:'assets/spill-mv-54h.png',metrics:[['2.6M++','Real-time views'],['97K++','YouTube likes'],['300K++','Interactions'],['#7','Trending YouTube Vietnam'],['#1','iTunes chart Vietnam'],['#4','Trending Music YouTube']]}};
function snapshot(hours){const data=snapshots[hours];root.querySelectorAll('[data-spill-snapshot]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.spillSnapshot)===hours)));const grid=root.querySelector('[data-spill-metrics]');grid.replaceChildren();data.metrics.forEach(([value,label])=>{const card=document.createElement('article'),number=document.createElement('strong'),name=document.createElement('span');number.textContent=value;name.textContent=label;card.append(number,name);grid.append(card);});root.querySelectorAll('[data-spill-banner]').forEach(banner=>banner.hidden=Number(banner.dataset.spillBanner)!==hours);}

root.addEventListener('click',event=>{const button=event.target.closest('button');if(button?.hasAttribute('data-spill-snapshot'))snapshot(Number(button.dataset.spillSnapshot));if(button?.hasAttribute('data-spill-filter')){const filter=button.dataset.spillFilter;root.querySelectorAll('[data-spill-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));root.querySelectorAll('[data-spill-group]').forEach(c=>c.hidden=filter!=='all'&&c.dataset.spillGroup!==filter);}const link=event.target.closest('[data-spill-scroll]');if(link){event.preventDefault();document.getElementById(link.dataset.spillScroll).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}});
const recap=root.querySelector('.spill-recap iframe'),recapUrl=recap.getAttribute('src');
const mv=root.querySelector('[data-spill-mv]'),mvUrl=mv.getAttribute('src');
function sync(){
 const active=location.hash==='#/case-study/cs-let-them-spill-it';
 for(const [frame,url] of [[recap,recapUrl],[mv,mvUrl]]){if(active&&!frame.getAttribute('src'))frame.src=url;if(!active)frame.removeAttribute('src');}
 root.querySelectorAll('[data-spill-post]').forEach(frame=>{if(active&&!frame.getAttribute('src'))frame.src=frame.dataset.spillPost;if(!active)frame.removeAttribute('src');});
 root.querySelectorAll('.spill-post').forEach(post=>post.open=true);
}
window.addEventListener('hashchange',sync);snapshot(24);sync();
})();

export const aquaPhases=[
 {title:'Put the product inside the joke.',label:'01 / The campaign film',copy:'A comic royal journey, neighbourhood boasting, and a music-led reveal give “Mua 1 được 2” a story people can recognise.',image:'film-wide-kv.webp',alt:'Official AQUA campaign key visual',cue:'Watch the official TVC above.'},
 {title:'Unpack one benefit at a time.',label:'02 / Product stories',copy:'Savings, performance, comfort, and trust each receive a distinct visual treatment. The product posts turn one broad value promise into specific reasons to choose.',image:'facebook-benefit-1.jpg',alt:'Original AQUA convenience and performance post',cue:'Explore the published product posts below.'},
 {title:'Move the promise into a real home.',label:'03 / Creator voices',copy:'Trang Daisy presents the product through family life. Tiến Dũng Thật takes a practical look at three purchase doubts. Each video gives the same value story a different perspective.',image:'tiktok-koc-trangdaisy.webp',alt:'Trang Daisy campaign video',cue:'Watch the published creator posts below.'},
 {title:'Give the audience a ready-made format.',label:'04 / CapCut template',copy:'Campaign music, warm-and-cool colours, and Táo Quân cues carry into a vertical edit that gives the audience a place in the story.',image:'capcut-poster.jpg',alt:'Preview frame from the finished AQUA CapCut template',cue:'Play the finished template below.'},
 {title:'Turn attention into participation.',label:'05 / Social minigames',copy:'Facebook and TikTok minigames give the audience another way to engage with the campaign and its value promise.',image:'facebook-minigame-1.webp',alt:'Published AQUA Facebook minigame',cue:'Explore the original minigame posts in the gallery.'}
];
export const aquaChannels=[
 {name:'YouTube',values:['2,910,023','1,402,312','48.19%'],labels:['Impressions','Views','View-through rate'],note:'The device breakdown shows a 61% view rate on mobile and 42% on TV screens. That supports a different viewing experience across placements.'},
 {name:'Facebook video',values:['7,041,739','1,007,972','33.68%'],labels:['Impressions','Views','View-objective VTR'],note:'Impressions and views combine two video-buying objectives. The 33.68% rate applies to the view objective, rather than the combined total.'},
 {name:'TikTok',values:['2,504,171','2,490,188','99.44%'],labels:['Impressions','Platform-reported views','Platform-reported VTR'],note:'The interim snapshot records these figures. A retention breakdown shows a 4.25% six-second view rate, pointing to the opening seconds as an optimisation opportunity.'},
 {name:'Facebook social',values:['1,864,539','4,604','4'],labels:['Impressions','Engagements','Posts aired in snapshot'],note:'The snapshot combines impression and engagement buying for the four social posts shown. Their creative formats include the key visual, minigames, and product messaging.'},
 {name:'Search',values:['43,779','1,389','3.17%'],labels:['Impressions','Clicks','Click-through rate'],note:'The interim search snapshot records these delivery figures.'}
];
export function startAquaCase(root){
 if(!root||root.dataset.aquaReady)return;root.dataset.aquaReady='true';const set=(key,value)=>{root.querySelector('[data-aqua-'+key+']').textContent=value;};
 root.querySelectorAll('[data-aqua-season]').forEach(b=>b.addEventListener('click',()=>{const warm=b.dataset.aquaSeason==='winter';root.dataset.season=b.dataset.aquaSeason;root.querySelectorAll('[data-aqua-season]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));set('season-title',warm?'Warm in winter.':'Cool in summer.');set('season-copy',warm?'The unfamiliar job: position the air conditioner as a heating option, in a market where traditional heaters already feel familiar.':'The familiar job: keep the cooling role people already associate with an air conditioner. The campaign pairs it with a second seasonal use.');}));
 let phase=0;function drawPhase(){const p=aquaPhases[phase];root.querySelectorAll('[data-aqua-phase]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===phase)));for(const k of ['title','label','copy','cue'])set('phase-'+k,p[k]);const image=root.querySelector('[data-aqua-phase-image]');image.src='assets/aqua-heatpump/'+p.image;image.alt=p.alt;root.dataset.phase=String(phase);}
 root.querySelectorAll('[data-aqua-phase]').forEach((b,i)=>b.addEventListener('click',()=>{phase=i;drawPhase();}));root.querySelector('[data-aqua-phase-next]').addEventListener('click',()=>{phase=(phase+1)%aquaPhases.length;drawPhase();});
 root.querySelectorAll('[data-aqua-filter]').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('[data-aqua-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));let count=0;root.querySelectorAll('[data-aqua-post]').forEach(c=>{c.hidden=b.dataset.aquaFilter!=='all'&&c.dataset.aquaPost!==b.dataset.aquaFilter;if(!c.hidden)count++;});set('post-count',count+' touchpoints');}));
 root.querySelectorAll('[data-aqua-channel]').forEach((b,i)=>b.addEventListener('click',()=>{root.querySelectorAll('[data-aqua-channel]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const c=aquaChannels[i];set('channel-name',c.name);set('channel-note',c.note);c.values.forEach((v,n)=>{set('channel-value-'+n,v);set('channel-label-'+n,c.labels[n]);});}));
 drawPhase();startAquaFilm(root);
}
if(typeof document!=='undefined')document.querySelectorAll('[data-aqua-case]').forEach(startAquaCase);

export function startAquaFilm(root){
 const poster=root.querySelector('[data-aqua-play-tvc]');
 if(!poster||poster.dataset.playerReady)return;poster.dataset.playerReady='true';
 const player=root.querySelector('[data-aqua-tvc-player]'),reset=root.querySelector('[data-aqua-reset-tvc]');
 const view=root.ownerDocument.defaultView;
 function showPreview(focus=false){
  player.replaceChildren();player.hidden=true;poster.hidden=false;reset.hidden=true;
  if(focus)poster.focus();
 }
 poster.addEventListener('click',()=>{
  const id=poster.dataset.aquaPlayTvc;if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
  const iframe=root.ownerDocument.createElement('iframe');
  iframe.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&playsinline=1&controls=1&rel=0';
  iframe.title=poster.dataset.videoTitle;
  iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.setAttribute('allowfullscreen','');iframe.referrerPolicy='strict-origin-when-cross-origin';
  player.replaceChildren(iframe);player.hidden=false;poster.hidden=true;reset.hidden=false;iframe.focus();
 });
 reset.addEventListener('click',()=>showPreview(true));
 view.addEventListener('hashchange',()=>{if(view.location.hash.split('?')[0]!=='#/work/stop-heatdumping')showPreview();});
}

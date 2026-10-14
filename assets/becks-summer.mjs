const root = document.querySelector('.bs-native');
if (root) {
 const $ = id => root.querySelector('#'+id);
 const text = (id,value) => { $(id).textContent=value; };
 const asset = name => 'assets/becks-summer/'+name+'.webp';
 const brandPost='https://www.facebook.com/becksvn.official/posts/pfbid04c1HMSQB9fuNeRK48wi67zSUBC3CkTBE3FhAu8NNkAhJ3KF5uiYHdzRLS72UPUDvl';
 const stickerPost='https://www.facebook.com/becksvn.official/posts/pfbid02bbpbcXwvY8b481kiyeZ6eF1hRGHdZ25czqsDi8pUhtbH1Tuj4UmbahkjaQU9szvxl';
 const gamePost='https://www.facebook.com/becksvn.official/posts/pfbid02QBF68wyG7qMMA1ZMP127vCypAwdEiYP6x1v4TaTERaLnnQtkVmbqFH7QtUkNxspPl';
 const younet='https://younetmedia.com/younet-media-index-bang-xep-hang-thuong-hieu-ymi-thang-8-2022/';
 const flavours={
  sweet:{name:'Quả Ngọt Chill Lòng',kind:'SWEET',word:'SWEET\nSTORIES.',taste:'MANGO +\nPASSIONFRUIT',image:'sweet-bottle',alt:'Quả Ngọt Chill Lòng, the mango and passionfruit limited-edition Beck’s Ice bottle',creative:['Sweetness gave the story a way in.','“Quả Ngọt Chill Lòng” connects a sweet flavour with the sweet side of lived experience. The campaign’s move was to let artists interpret a sensory cue in their own voice.'],product:['A story cue became a limited edition.','Mango and passionfruit gave Quả Ngọt Chill Lòng a physical expression. The bottle carried the flavour-led idea from the music campaign into e-commerce.']},
  sour:{name:'Có Chua Có Chill',kind:'SOUR',word:'SOUR\nSTORIES.',taste:'LEMON +\nMINT',image:'sour-bottle',alt:'Có Chua Có Chill, the lemon and mint limited-edition Beck’s Ice bottle',creative:['Even sour moments have a story.','“Có Chua Có Chill” connects a sour flavour with life’s less comfortable moments. It gave the campaign another way to invite honest stories, rather than another list of chill keywords.'],product:['The sour side had its own bottle.','Lemon and mint gave Có Chua Có Chill a distinct flavour and green label. Its name and packaging kept the campaign idea visible in the limited-edition product.']}
 };
 let flavour='sweet',mode='creative';
 function renderFlavour(){
  const f=flavours[flavour];root.querySelector('.bs-flavour-lab').dataset.bsFlavour=flavour;
  text('bs-flavour-number',(flavour==='sweet'?'01':'02')+' / '+f.kind);
  text('bs-flavour-word',f.word);text('bs-flavour-badge',f.taste);
  $('bs-flavour-word').style.whiteSpace='pre-line';$('bs-flavour-badge').style.whiteSpace='pre-line';
  $('bs-flavour-bottle').src=asset(f.image);$('bs-flavour-bottle').alt=f.alt;
  text('bs-flavour-label',mode==='creative'?'FLAVOUR / A STORYTELLING STARTING POINT':'FLAVOUR / THE LIMITED PRODUCT EDITION');
  text('bs-flavour-title',f[mode][0]);text('bs-flavour-copy',f[mode][1]);
  text('bs-flavour-note',mode==='creative'?'An interactive explanation of the idea, not a reproduction of an artist’s original brief.':'Flavour names and packaging shown in the official campaign artwork.');
  root.querySelectorAll('[data-bs-flavour-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bsFlavourChoice===flavour)));
  root.querySelectorAll('[data-bs-brief-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bsBriefMode===mode)));
 }
 root.querySelectorAll('[data-bs-flavour-choice]').forEach(b=>b.addEventListener('click',()=>{flavour=b.dataset.bsFlavourChoice;renderFlavour();}));
 root.querySelectorAll('[data-bs-brief-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.bsBriefMode;renderFlavour();}));
 const steps=[
  {key:'brief',number:'01 / THE BOTTLE',title:'The brand started with what it makes.',description:'Instead of handing artists a list of campaign keywords, Beck’s Ice used its flavours to set the creative starting point. The bottle became a brief they could interpret.',role:'Make the product part of the creative process.',image:'core-bottle',alt:'The Beck’s Ice core bottle, the product at the centre of the campaign',label:'THE PRODUCT BECAME THE BRIEF',links:[['Explore the bottle brief ↑','#bs-bottle-brief']]},
  {key:'music',number:'02 / THE MV',title:'Three voices. One invitation to be real.',description:'Wowy, Low G and Nân brought their own stories to Có Chuyện, Cùng Chill. Music turned the flavour-led brief into something the audience could hear, share and revisit.',role:'Give the product idea a cultural expression.',image:'artist-kv',alt:'Official Summer 2022 artist KV',label:'OFFICIAL ARTIST KV',links:[['Watch the official MV ↗','https://www.youtube.com/watch?v=jF_Et8xj4tE']]},
  {key:'commerce',number:'03 / THE LIMITED FLAVOURS',title:'The story had a product people could buy.',description:'Quả Ngọt Chill Lòng and Có Chua Có Chill took the flavour-and-story connection into limited-edition bottles. E-commerce gave the idea a direct path into purchase.',role:'Carry the campaign idea into the buying experience.',image:'flavour-kv',alt:'Official product KV featuring the two limited flavours',label:'OFFICIAL LIMITED-FLAVOUR KV',links:[['Explore the product post ↗',brandPost],['Shopee minigame coverage ↗',younet]]},
  {key:'social',number:'04 / THE SOCIAL PLAY',title:'More ways to carry the idea into conversation.',description:'A sticker pack and a new-flavour minigame gave the campaign additional social expressions. The same product idea could become something to share or a prompt to participate.',role:'Give audiences approachable ways to express and engage.',art:'social',label:'SOCIAL FORMATS / OFFICIAL KV + RECAP',links:[['Explore the social gallery ↓','#bs-social'],['View the sticker pack ↗',stickerPost],['Explore the flavour minigame ↗',gamePost]]},
  {key:'stage',number:'05 / BECK’S STAGE',title:'The bottle became a challenge for rappers.',description:'The campaign extended the product-as-brief idea to Beck’s Stage: rappers were challenged to interpret the beer and unlock their real chill flows.',role:'Extend the creative mechanism into participation.',art:'stage',label:'STAGE FORMAT / INTERACTIVE EXPLANATION',links:[['Read August 2022 activity coverage ↗',younet]]}
 ];
 let step=0;
 function renderStep(){
  const s=steps[step];root.querySelector('.bs-rollout-panel').dataset.bsActiveStep=s.key;
  for(const field of ['number','title','description','role'])text('bs-rollout-'+field,s[field]);
  text('bs-rollout-visual-label',s.label);text('bs-rollout-position',String(step+1).padStart(2,'0')+' / 05');
  const img=$('bs-rollout-image');img.hidden=!s.image;if(s.image){img.src=asset(s.image);img.alt=s.alt;}
  $('bs-rollout-social-art').hidden=s.art!=='social';$('bs-rollout-stage-art').hidden=s.art!=='stage';
  $('bs-rollout-links').replaceChildren(...s.links.map(([label,url])=>{const a=document.createElement('a');a.textContent=label;a.href=url;if(url.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer';}return a;}));
  $('bs-rollout-prev').disabled=false;$('bs-rollout-next').disabled=false;
  root.querySelectorAll('[data-bs-step]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bsStep===s.key)));
 }
 root.querySelectorAll('[data-bs-step]').forEach(b=>b.addEventListener('click',()=>{step=steps.findIndex(s=>s.key===b.dataset.bsStep);renderStep();}));
 $('bs-rollout-prev').addEventListener('click',()=>{step=(step+steps.length-1)%steps.length;renderStep();});
 $('bs-rollout-next').addEventListener('click',()=>{step=(step+1)%steps.length;renderStep();});
 $('bs-rollout-links').addEventListener('click',e=>{const a=e.target.closest('a');if(!a||!a.getAttribute('href').startsWith('#bs-'))return;e.preventDefault();root.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
 root.querySelectorAll('[data-bs-result]').forEach(b=>b.addEventListener('click',()=>{const result=b.dataset.bsResult;root.querySelectorAll('[data-bs-result]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('bs-result-attention').hidden=result!=='attention';$('bs-result-commerce').hidden=result!=='commerce';}));
 root.querySelectorAll('[data-bs-source-filter]').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('[data-bs-source-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));root.querySelectorAll('[data-bs-source-platform]').forEach(a=>a.hidden=b.dataset.bsSourceFilter!=='all'&&a.dataset.bsSourcePlatform!==b.dataset.bsSourceFilter);}));
 const video=$('bs-recap-video');
 if(video){root.querySelectorAll('[data-bs-recap-time]').forEach(b=>b.addEventListener('click',()=>{video.currentTime=Number(b.dataset.bsRecapTime);video.play().catch(()=>{});}));const pause=()=>{if(root.closest('.route').hidden||document.hidden)video.pause();};window.addEventListener('hashchange',pause);document.addEventListener('visibilitychange',pause);}
 renderFlavour();renderStep();
}

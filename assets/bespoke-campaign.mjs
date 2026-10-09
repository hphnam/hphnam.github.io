export const resultSnapshots={
  recap:{context:'2023 campaign recap. Social asset results cover the first five days.',metrics:[['10×','Bespoke business volume'],['Top 7','First entry among MTD category best-sellers'],['110K+','Social asset engagement / first 5 days'],['13K+','Comments'],['93K+','Interactions'],['4.3K+','Shares']],reading:'Samsung’s most effective video ad of 2021–2023 in the campaign recap, ranking #1 for likes, shares and comments on its channel.'},
  published:{context:'Figures as reported in the published BSI Awards case for the 2023 campaign. The social stunt figure covers four days.',metrics:[['13×','Bespoke sales in 2023'],['Top 10','MTD category best-sellers'],['27K','AR filter plays'],['+510%','Keyword searches after the awareness phase'],['110K+','Social stunt engagement / first 4 days'],['5K','User shares / social stunt']],reading:'The BSI Awards case reports 2023 sales, AR activity, search growth and the stunt’s first four days.'}
};
export function videoEmbedUrl(which){return 'https://www.youtube-nocookie.com/embed/'+({localised:'2Y7nB18a2Os',case:'6LeSGHcnEbk',gala:'i0_TDF8EoHo'}[which])+'?rel=0&playsinline=1';}
export function startBespoke(root){
  if(!root||root.dataset.bespokeReady)return;root.dataset.bespokeReady='true';
  const find=s=>root.querySelector(s),all=s=>Array.from(root.querySelectorAll(s));
  const films=all('[data-bespoke-native]');
  function syncPlayback(){
    const active=location.hash==='#/case-study/cs-beauty-now';
    all('[data-bespoke-youtube]').forEach(frame=>{
      if(active&&!frame.getAttribute('src'))frame.setAttribute('src',videoEmbedUrl(frame.dataset.bespokeYoutube));
      else if(!active)frame.removeAttribute('src');
    });
    if(!active)films.forEach(video=>video.pause());
  }
  films.forEach(video=>{
    const button=find(`[data-bespoke-native-play="${video.id}"]`);
    video.addEventListener('play',()=>{button.hidden=true;films.forEach(other=>{if(other!==video)other.pause();});});
    video.addEventListener('ended',()=>{button.hidden=false;});
  });
  root.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b||!root.contains(b))return;
    if(b.hasAttribute('data-bespoke-results')){
      const key=b.dataset.bespokeResults,snapshot=resultSnapshots[key];
      all('[data-bespoke-results]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.bespokeResults===key)));
      find('[data-bespoke-results-context]').textContent=snapshot.context;find('[data-bespoke-result-reading]').textContent=snapshot.reading;
      const grid=find('[data-bespoke-metrics]');grid.replaceChildren();
      for(const [value,label] of snapshot.metrics){const cell=document.createElement('article'),number=document.createElement('strong'),text=document.createElement('span');number.textContent=value;text.textContent=label;cell.append(number,text);grid.append(cell);}
    }
    if(b.hasAttribute('data-bespoke-native-play')){
      const video=document.getElementById(b.dataset.bespokeNativePlay);
      if(video.ended)video.currentTime=0;
      // Play in this click's user gesture; there is no intermediate embed loader.
      const playback=video.play();playback?.catch(()=>{b.hidden=false;});
    }
  });
  all('[data-bespoke-scroll]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();document.getElementById(a.dataset.bespokeScroll)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));
  window.addEventListener('hashchange',syncPlayback);syncPlayback();
}
if(typeof document!=='undefined')startBespoke(document.querySelector('.bespoke-case'));

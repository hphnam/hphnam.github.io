export function workSequence(doc){
 return [...doc.querySelectorAll('.collection-grid .work-card[href]')].map((card,index)=>({
  number:String(index+1).padStart(2,'0'),route:card.getAttribute('href').slice(1),title:card.querySelector('h3').textContent.trim(),card
 }));
}
export function adjacentCases(sequence,route){
 const index=sequence.findIndex(item=>item.route===route),count=sequence.length;
 if(!count)return null;
 return {previous:sequence[index<0?count-1:(index+count-1)%count],next:sequence[index<0?0:(index+1)%count]};
}
export function startSiteNavigation(doc=document){
 const sequence=workSequence(doc);
 for(const item of sequence){
  const label=item.card.querySelector('.eyebrow');if(label)label.textContent=item.number+' / '+label.textContent.replace(/^[^/]*\/\s*/, '');
  for(const card of doc.querySelectorAll('.selected-grid .work-card')){
   if(card.querySelector('a.project-visual')?.getAttribute('href')!=='#'+item.route)continue;
   const number=card.querySelector('.project-number'),eyebrow=card.querySelector('.project-copy .eyebrow');
   if(number)number.textContent='('+item.number+')';if(eyebrow)eyebrow.textContent=item.number+' / Case study';
  }
 }
 for(const nav of doc.querySelectorAll('[data-case-pagination]')){
  const pair=adjacentCases(sequence,nav.closest('[data-route]').dataset.route);if(!pair)continue;
  for(const direction of ['previous','next']){const item=pair[direction],link=nav.querySelector('[data-case-'+direction+']');
   link.href='#'+item.route;link.querySelector('span').textContent=(direction==='previous'?'← Previous case':'Next case →')+' / '+item.number;
   link.querySelector('strong').textContent=item.title;
  }
 }
 const copy=doc.querySelector('[data-copy-email]'),status=doc.querySelector('[data-contact-status]');
 if(copy)copy.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(copy.dataset.copyEmail);status.textContent='Email address copied.';copy.textContent='Copied ✓';}
  catch{const address=doc.querySelector('[data-contact-email]');if(address&&doc.defaultView?.getSelection){const range=doc.createRange();range.selectNodeContents(address);const selection=doc.defaultView.getSelection();selection.removeAllRanges();selection.addRange(range);}status.textContent='Select and copy the email address shown above.';}
 });
}
if(typeof document!=='undefined')startSiteNavigation();

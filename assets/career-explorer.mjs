export function startCareerExplorer(doc=document){
 const root=doc.querySelector('[data-career-explorer]');if(!root)return;
 const tabs=[...root.querySelectorAll('[data-career-tab]')],panels=[...root.querySelectorAll('[data-career-panel]')];
 const prev=root.querySelector('[data-career-prev]'),next=root.querySelector('[data-career-next]'),position=root.querySelector('[data-career-position]');
 let current=tabs.findIndex(tab=>tab.getAttribute('aria-selected')==='true');if(current<0)current=0;
 function select(index,focus=false){
  if(index<0||index>=tabs.length)return;
  current=index;tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
  panels.forEach((panel,i)=>{panel.hidden=i!==index;});prev.disabled=index===0;next.disabled=index===tabs.length-1;position.textContent=`Chapter ${index+1} of ${tabs.length}`;
  if(focus)tabs[index].focus({preventScroll:true});
 }
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>select(i));
  tab.addEventListener('keydown',event=>{
   let index;if(event.key==='ArrowDown'||event.key==='ArrowRight')index=(i+1)%tabs.length;
   if(event.key==='ArrowUp'||event.key==='ArrowLeft')index=(i+tabs.length-1)%tabs.length;
   if(event.key==='Home')index=0;if(event.key==='End')index=tabs.length-1;
   if(index!==undefined){event.preventDefault();select(index,true);}
  });
 });prev.addEventListener('click',()=>select(current-1));next.addEventListener('click',()=>select(current+1));select(current);
 return {select,tabs,panels,get current(){return current;}};
}
if(typeof document!=='undefined')startCareerExplorer();

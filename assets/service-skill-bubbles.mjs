export function startServiceSkills(doc=document){
 const groups=[...doc.querySelectorAll('[data-service-skill-bubbles]')];
 return groups.map(group=>{
  const buttons=[...group.querySelectorAll('[data-service-skill]')],note=group.querySelector('[data-service-skill-note]'),title=group.querySelector('[data-service-skill-title]'),copy=group.querySelector('[data-service-skill-description]');
  let selected=-1;
  function select(index){selected=index===selected?-1:index;buttons.forEach((button,i)=>button.setAttribute('aria-expanded',String(i===selected)));note.hidden=selected<0;if(selected>=0){title.textContent=buttons[selected].dataset.serviceSkill;copy.textContent=buttons[selected].dataset.skillDescription;}}
  buttons.forEach((button,i)=>{button.addEventListener('click',()=>select(i));button.addEventListener('keydown',event=>{if(event.key==='Escape'&&selected>=0){event.preventDefault();select(selected);}});});return {select,buttons,note,get selected(){return selected;}};
 });
}
if(typeof document!=='undefined')startServiceSkills();

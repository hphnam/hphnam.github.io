import {graphNodes,codeExcerpts,sourceCommit} from './werewolf-engine-data.mjs';

// Reader-controlled examples. The research Python and remote LLMs are not run in this page.
export const graphRoutes=Object.freeze({
  continue:['eliminate','protect','unmask','save_or_poison','resolve_night','check_winner_night','debate','debate','vote','exile','check_winner_day','eliminate'],
  daywin:['eliminate','protect','unmask','save_or_poison','resolve_night','check_winner_night','debate','vote','exile','check_winner_day','end'],
  nightwin:['eliminate','protect','unmask','save_or_poison','resolve_night','check_winner_night','end']
});
export function graphRouteVisibility(route){
  const path=graphRoutes[route];if(!path)throw new RangeError('Unknown graph route');
  return {nodes:[...new Set(path)],edges:[...new Set(path.slice(1).map((node,i)=>`${path[i]}:${node}`))]};
}
export function graphSnapshot(route,index){
  const path=graphRoutes[route];
  if(!path||!Number.isInteger(index)||index<0||index>=path.length)throw new RangeError('Unknown graph trace position');
  return {node:path[index],position:index+1,length:path.length,round:route==='continue'&&index===path.length-1?2:1,step:path[index]==='debate'&&path[index-1]==='debate'?1:0,edge:index?`${path[index-1]}:${path[index]}`:null};
}
export const responseExamples=Object.freeze({
  valid:'{"target":"Riley","analysis":"Investigate an unchecked player."}',
  wrapped:'I will investigate this player.\n{"target":"Riley","analysis":"Investigate an unchecked player."}\nThat is my choice.',
  invalid:'{"target":"Nam","analysis":"I will investigate myself."}',
  raw:'Riley should be investigated tonight.'
});
export function inspectSeerResponse(input,random=Math.random){
  const available=['Nhan','Cong','Hoang','Jin','Riley','Meg'];
  const text=String(input).trim(),match=text.match(/(\{.*\})/s);let parsed;
  try{parsed=JSON.parse(match?match[1]:text);}catch{parsed={raw:text};}
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return {kind:'error',parsed,target:null,title:'The call expects a JSON dictionary.',explanation:'The inspected call_model() appends metadata to a dictionary. A JSON scalar or array does not satisfy that shape; this walkthrough stops at the parsing boundary.',note:'No investigation target has been applied.'};
  const keys=Object.hasOwn(parsed,'target')&&Object.hasOwn(parsed,'analysis');
  let target=keys?parsed.target:'None';
  if(available.includes(target))return {kind:'accepted',parsed,target,title:'A legal target reaches the moderator.',explanation:'The target and analysis keys are present, and the target belongs to the living players available to this Seer.',note:'The investigation result is still unknown to the model. The moderator must verify the alignment.'};
  if(Object.hasOwn(parsed,'raw')&&typeof parsed.raw==='string'){
    const recovered=available.find(name=>parsed.raw.includes(name));
    if(recovered)return {kind:'recovered',parsed:{...parsed,target:recovered,analysis:'Extracted target from raw text due to JSON failure.'},target:recovered,title:'The Seer recovers a name from raw text.',explanation:'If formatted responses still fail after retries, unmask() searches the raw response for available player names, in list order. This response contains a legal target.',note:'MAX_RETRIES is 5 in constants.py. This walkthrough shows the response boundary after those retries, not five new model calls.'};
  }
  const draw=random();if(!Number.isFinite(draw)||draw<0||draw>=1)throw new RangeError('Random draw must be in [0,1)');
  target=available[Math.floor(draw*available.length)];
  return {kind:'fallback',parsed:{...parsed,target,analysis:'Forced random target due to invalid LLM response.',fallback:'Forced random target due to invalid LLM response.'},target,title:'A fallback keeps the action legal.',explanation:keys?'Nam is the Seer and cannot investigate himself. An unknown or unavailable target would fail the same membership check. The Seer chooses randomly from its current target pool.':'The required target / analysis keys were not recovered. After retries, the Seer uses raw-name extraction if possible, then random selection from its target pool.',note:'Random fallback preserves game progress; it does not guarantee a strategically good decision. In this example all six available players are unchecked.'};
}

function renderExcerpt(root,codeId,linkId,excerpt){
  const code=root.querySelector('#'+codeId),link=root.querySelector('#'+linkId);code.replaceChildren();
  const lines=excerpt.code.split('\n'),indent=Math.min(...lines.filter(line=>line.trim()).map(line=>line.match(/^ */)[0].length));
  lines.forEach((line,i)=>{const row=document.createElement('span');row.className='ww-code-line';const number=document.createElement('span');number.className='ww-code-number';number.setAttribute('aria-hidden','true');number.textContent=String(excerpt.start+i);row.append(number,document.createTextNode(line.slice(indent)));code.append(row);});
  link.href=excerpt.url;
}
export function startEngine(root){
  if(!root)return;
  const get=id=>root.querySelector('#'+id),set=(id,value)=>get(id).textContent=String(value);
  const tabs=[...root.querySelectorAll('[data-engine-tab]')];let graphTimer=null,callTimers=[];
  let route='continue',position=0;
  const nodeButtons=graphNodes.map(node=>{
    const button=document.createElement('button');button.type='button';button.className='ww-graph-node';button.dataset.engineNode=node.id;button.dataset.group=node.group;button.style.setProperty('--node-x',node.x+'%');button.style.setProperty('--node-y',node.y+'%');button.setAttribute('aria-label',`Inspect ${node.id}: ${node.name}`);button.setAttribute('aria-pressed','false');
    const name=document.createElement('strong');name.textContent=node.name;const id=document.createElement('small');id.textContent=node.id;button.append(name,id);get('ww-graph-nodes').append(button);
    button.addEventListener('click',()=>{stopGraph();if(!graphRoutes[route].includes(node.id)){drawNode(node.id);set('ww-node-group',`Outside selected route / ${node.group} / ${node.id}`);return;}position=graphRoutes[route].indexOf(node.id);drawGraph();});return button;
  });
  function stopGraph(){if(graphTimer!==null)clearInterval(graphTimer);graphTimer=null;get('ww-graph-play').setAttribute('aria-pressed','false');set('ww-graph-play',position===graphRoutes[route].length-1?'↺ Run again':'▶ Run the flow');}
  function stopCall(){callTimers.forEach(clearTimeout);callTimers=[];get('ww-response-run').disabled=false;}
  function drawNode(id){
    const node=graphNodes.find(node=>node.id===id);nodeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.engineNode===id)));
    set('ww-node-group',`${node.group} / ${node.id}`);set('ww-node-title',node.title);set('ww-node-copy',node.copy);set('ww-node-mechanism',node.mechanism);set('ww-node-file',`${node.snippet.file}:${node.snippet.start}–${node.snippet.end}`);renderExcerpt(root,'ww-node-code','ww-node-source',node.snippet);
  }
  function drawGraph(){
    const frame=graphSnapshot(route,position),path=graphRoutes[route],visited=path.slice(0,position+1);
    const visibility=graphRouteVisibility(route),activeNodes=new Set(visibility.nodes),activeEdges=new Set(visibility.edges);
    drawNode(frame.node);nodeButtons.forEach(button=>{const included=activeNodes.has(button.dataset.engineNode);button.classList.toggle('is-visited',visited.includes(button.dataset.engineNode));button.classList.toggle('is-off-route',!included);button.disabled=false;button.removeAttribute('aria-disabled');});
    const traversed=new Set(visited.slice(1).map((to,i)=>`${visited[i]}:${to}`));
    root.querySelectorAll('[data-engine-edge]').forEach(edge=>{edge.classList.toggle('is-off-route',!activeEdges.has(edge.dataset.engineEdge));edge.classList.toggle('is-traced',traversed.has(edge.dataset.engineEdge));edge.classList.toggle('is-current',edge.dataset.engineEdge===frame.edge);});
    root.querySelector('.ww-graph-board').dataset.graphRoute=route;
    set('ww-route-title',{continue:'Continue into another round',daywin:'Winner after the day vote',nightwin:'Winner after night resolution'}[route]);
    set('ww-route-count',`${activeNodes.size} of 11 nodes · ${path.length} trace steps`);
    set('ww-graph-position',`${String(frame.position).padStart(2,'0')} / ${frame.length}`);set('ww-state-phase',frame.node);set('ww-state-round',frame.round);set('ww-state-turn',frame.step);get('ww-graph-next').disabled=false;
    if(position===path.length-1)stopGraph();
  }
  get('ww-graph-route').addEventListener('change',()=>{stopGraph();route=get('ww-graph-route').value;position=0;drawGraph();});
  get('ww-graph-next').addEventListener('click',()=>{stopGraph();position=(position+1)%graphRoutes[route].length;drawGraph();});
  get('ww-graph-reset').addEventListener('click',()=>{stopGraph();position=0;drawGraph();});
  get('ww-graph-play').addEventListener('click',()=>{if(graphTimer!==null){stopGraph();return;}if(position===graphRoutes[route].length-1){position=0;drawGraph();}get('ww-graph-play').setAttribute('aria-pressed','true');set('ww-graph-play','Ⅱ Pause the flow');graphTimer=setInterval(()=>{position=Math.min(graphRoutes[route].length-1,position+1);drawGraph();},1400);});
  function chooseTab(tab){
    stopGraph();stopCall();tabs.forEach(button=>{const active=button===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;get('ww-panel-'+button.dataset.engineTab).hidden=!active;});
  }
  tabs.forEach((button,i)=>{
    button.addEventListener('click',()=>chooseTab(button));
    button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(i+1)%tabs.length;else if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();chooseTab(tabs[next]);tabs[next].focus();});
  });
  const steps=[...root.querySelectorAll('[data-call-step]')];
  function clearCall(){stopCall();steps.forEach(step=>step.classList.remove('is-active'));set('ww-response-status','READY TO INSPECT');set('ww-response-title','A proposed target is not a verified fact.');set('ww-response-explanation','The Seer can request an investigation. Only the moderator can confirm wolf or not-wolf.');set('ww-response-parsed',get('ww-response-input').value);set('ww-response-target','—');get('ww-response-status').parentElement.dataset.result='ready';set('ww-response-note','Available targets: Nhan, Cong, Hoang, Jin, Riley, Meg. Nam is the Seer and cannot investigate himself.');}
  const presetButtons=[...root.querySelectorAll('[data-response-preset]')];
  presetButtons.forEach(button=>button.addEventListener('click',()=>{get('ww-response-input').value=responseExamples[button.dataset.responsePreset];presetButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));clearCall();}));
  get('ww-response-input').addEventListener('input',()=>{presetButtons.forEach(button=>button.setAttribute('aria-pressed','false'));clearCall();});
  get('ww-response-run').addEventListener('click',()=>{
    stopCall();const result=inspectSeerResponse(get('ww-response-input').value);get('ww-response-run').disabled=true;
    const draw=()=>{set('ww-response-status',{accepted:'LEGAL TARGET',recovered:'RAW TEXT RECOVERED',fallback:'RANDOM FALLBACK',error:'SHAPE ERROR'}[result.kind]);set('ww-response-title',result.title);set('ww-response-explanation',result.explanation);set('ww-response-parsed',JSON.stringify(result.parsed,null,2));set('ww-response-target',result.target||'—');set('ww-response-note',result.note);get('ww-response-status').parentElement.dataset.result=result.kind;get('ww-response-run').disabled=false;};
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced){steps.forEach((step,i)=>step.classList.toggle('is-active',i===(result.kind==='error'?1:3)));draw();return;}
    const total=result.kind==='error'?2:4;
    for(let i=0;i<total;i++)callTimers.push(setTimeout(()=>{steps.forEach((step,j)=>step.classList.toggle('is-active',j===i));if(i===total-1)draw();},i*300));
  });
  root.querySelectorAll('button[data-memory-mode]').forEach(button=>button.addEventListener('click',()=>{
    const coached=button.dataset.memoryMode==='coached';root.querySelectorAll('button[data-memory-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    root.querySelector('.ww-memory-board').dataset.memoryMode=coached?'coached':'baseline';
    get('ww-memory-coach').setAttribute('aria-disabled',String(!coached));
    set('ww-memory-player-title',coached?'Reflect + feedback + prior strategy':'Reflect + prior strategy');
    set('ww-memory-player-copy',coached?'Villagers combine their own review with the coach’s advice and existing playbook. Wolves always self-reflect without coaching.':'The baseline skips the coach. Villagers revise their playbook from their own game review and previous strategy. Wolves also self-reflect.');
    set('ww-memory-rule',coached?'IF an accusation relies on tone, THEN request a logical contradiction before voting.':'Review the last game. Keep useful rules, discard failed ones, and carry the revised strategy into the next match.');
  }));
  [['ww-build-code','ww-build-source','graph'],['ww-invoke-code','ww-invoke-source','invoke'],['ww-validation-code','ww-validation-source','validate'],['ww-confirmed-code','ww-confirmed-source','confirmed'],['ww-persist-code','ww-persist-source','persist'],['ww-coach-code','ww-coach-source','coach']].forEach(([code,link,key])=>renderExcerpt(root,code,link,codeExcerpts[key]));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopGraph();stopCall();}});window.addEventListener('hashchange',()=>{stopGraph();stopCall();});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{stopGraph();stopCall();});
  new MutationObserver(()=>{if(document.documentElement.classList.contains('motion-paused')||document.body.classList.contains('motion-paused')){stopGraph();stopCall();}}).observe(document.documentElement,{attributes:true,attributeFilter:['class'],subtree:true});
  root.dataset.sourceCommit=sourceCommit;drawGraph();
}
if(typeof document!=='undefined')startEngine(document.querySelector('.ww-engine'));

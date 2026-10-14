import {evidence} from './brain-evidence-data.mjs';
export function modelRows(venue,metric=0,sort='rung',retainedOnly=false){
  return evidence.models.filter(m=>!retainedOnly||m.retained[venue]).slice().sort((a,b)=>sort==='error'?a.values[venue][metric]-b.values[venue][metric]:a.rung-b.rung||a.id-b.id);
}
export function eventSummary(index){
  const e=evidence.events[index],total=e.caught+e.missed+e.unexamined;
  return {...e,total,shares:[e.caught,e.missed,e.unexamined].map(n=>100*n/total)};
}
export function pilotSummary(index){return index===1?{total:37,rate:100*31/37,counts:[31,6,0]}:{total:40,rate:100*31/40,counts:[31,6,3]};}
const signed=n=>(n<0?'−':'+')+Math.abs(n).toFixed(3);
const position=n=>(n+.25)/.5*100;
export function startBrain(root){
  if(!root||root.dataset.brainReady)return;
  root.dataset.brainReady='true';
  const find=s=>root.querySelector(s),all=s=>Array.from(root.querySelectorAll(s));
  const set=(s,v)=>{find(s).textContent=v;};
  const press=(key,index)=>all(`[data-${key}]`).forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset[key.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())])===index)));
  let venue=0,metric=0,sort='rung',retained=false,selected=evidence.venues[0].served;
  function modelDetail(){
    const m=evidence.models[selected],v=evidence.venues[venue],name=venue===2?(metric===0?'RMSE':'MAE'):(metric===0?'RMSSE':'MASE');
    set('[data-model-name]',m.name);
    set('[data-model-detail]',`${name} ${m.values[venue][metric].toFixed(venue===2?1:4)}${venue===2?' (£)':''}. ${m.served[venue]?'Served at this venue. ':''}${m.retained[venue]?'Retained in the primary-metric 90% confidence set.':'Outside the primary-metric 90% confidence set.'} A lower sample mean alone is not evidence that another retained model should replace the incumbent.`);
    all('[data-model-id]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.modelId)===selected)));
    all('.poster-model-table tbody tr').forEach((row,i)=>row.classList.toggle('brain-selected-row',i===selected));
  }
  function renderModels(){
    if(retained&&!evidence.models[selected].retained[venue])selected=evidence.venues[venue].served;
    const v=evidence.venues[venue],rows=modelRows(venue,metric,sort,retained),max=Math.max(...evidence.models.map(m=>m.values[venue][metric]))*1.06;
    const chart=find('[data-model-chart]');chart.replaceChildren();
    for(const m of rows){
      const button=document.createElement('button');button.type='button';button.dataset.modelId=m.id;button.className='brain-model-row'+(m.served[venue]?' is-served':'')+(m.retained[venue]?' is-retained':'');
      button.setAttribute('aria-pressed',String(m.id===selected));
      const label=document.createElement('span');label.className='brain-model-label';label.textContent=`${m.rung} / ${m.name}`;
      const track=document.createElement('span');track.className='brain-model-track';const bar=document.createElement('i');bar.style.width=(m.values[venue][metric]/max*100)+'%';track.append(bar);
      const value=document.createElement('strong');value.textContent=m.values[venue][metric].toFixed(venue===2?1:4);
      button.append(label,track,value);button.setAttribute('aria-label',`${m.name}, error ${value.textContent}, ${m.served[venue]?'served, ':''}${m.retained[venue]?'retained':'outside confidence set'}`);chart.append(button);
    }
    set('[data-model-axis]',`${venue===2?(metric===0?'RMSE (£)':'MAE (£)'):(metric===0?'RMSSE':'MASE')} · lower is better`);
    set('[data-model-context]',`${v.origins} origins · ${v.mcs} models retained`);modelDetail();
  }
  function stage(index){press('stage',index);const x=evidence.stages[index];set('[data-stage-name]',`${String(index+1).padStart(2,'0')} / ${x.name}`);set('[data-stage-title]',x.title);set('[data-stage-body]',x.body);set('[data-stage-decision]',x.decision);}
  function coverage(index){
    press('coverage-venue',index);const v=evidence.venues[index];
    set('[data-coverage-all]',(v.all*100).toFixed(1)+'%');set('[data-coverage-traded]',(v.traded*100).toFixed(1)+'%');
    find('[data-coverage-all-bar]').style.width=v.all*100+'%';find('[data-coverage-traded-bar]').style.width=v.traded*100+'%';
    find('[data-coverage-chart]').setAttribute('aria-label',`${v.name}: all-pair coverage ${(v.all*100).toFixed(1)}%, trading-day coverage ${(v.traded*100).toFixed(1)}%, target 90%.`);
    const grid=find('[data-coverage-pools]');grid.replaceChildren();
    for(const [label,count,cov] of [['Traded',v.tradingPairs,v.traded],['Calendar-open, no trade',v.falseOpen,v.falseCoverage],['Calendar-closed',v.closed,v.closedCoverage]]){
      const cell=document.createElement('div'),title=document.createElement('span'),number=document.createElement('strong'),detail=document.createElement('small');title.textContent=label;number.textContent=count.toLocaleString('en-GB');detail.textContent=`pairs · ${(cov*100).toFixed(1)}% covered`;cell.append(title,number,detail);grid.append(cell);
    }
    const gap=(v.traded-.9)*100;set('[data-coverage-gap]',`Trading-day coverage is ${Math.abs(gap).toFixed(1)} percentage points ${gap<0?'below':'above'} target.`);set('[data-coverage-insight]',v.insight);
  }
  function events(index){
    press('event',index);const e=eventSummary(index);set('[data-event-total]',e.total);set('[data-event-title]',index===0?'injected events · all kinds':`${e.name.toLowerCase()} injections`);
    set('[data-event-caught]',e.caught);set('[data-event-missed]',e.missed);set('[data-event-unexamined]',e.unexamined);
    const stack=find('[data-event-stack]');stack.replaceChildren();
    e.shares.forEach((width,i)=>{if(width===0)return;const bar=document.createElement('span');bar.className=['caught','missed','unexamined'][i];bar.style.width=width+'%';bar.textContent=[e.caught,e.missed,e.unexamined][i];stack.append(bar);});
    stack.setAttribute('aria-label',`${e.caught} caught, ${e.missed} missed where examined, ${e.unexamined} never examined, out of ${e.total}.`);
    const insights=['The 84 unreachable spikes sit outside the scan window. Changing a threshold cannot recover an event the detector never examines.','Of 123 missed spikes, 84 were outside the last-14-trading-day scan. This separates reachability from sensitivity.','251 of 252 sustained regime shifts were caught under the study’s sustained-event matching rule. This is not the same criterion used for point spikes.','All 84 weather-linked injections were caught. These are controlled synthetic scenarios, not an estimate of historical-event recall.','All 20 stock drawdowns were caught in functional scenarios. Missing real stock feeds still block a claim of operational stock performance.'];set('[data-event-insight]',insights[index]);
  }
  function triage(index){
    press('triage',index);const e=evidence.triage[index];set('[data-triage-incumbent]',e.incumbent.toFixed(3));set('[data-triage-agent]',e.agent.toFixed(3));set('[data-triage-difference]',`Δ AUC ${signed(e.difference)}`);
    const interval=find('[data-triage-ci]');interval.hidden=!e.ci;
    if(e.ci){interval.style.left=position(e.ci[0])+'%';interval.style.width=(position(e.ci[1])-position(e.ci[0]))+'%';}
    find('[data-triage-point]').style.left=position(e.difference)+'%';
    set('[data-triage-interval]',e.ci?`90% interval: ${signed(e.ci[0])} to ${signed(e.ci[1])}. Includes zero.`:'Both rank perfectly in this small stratum. A saturated result does not establish an agent advantage.');
    set('[data-triage-sample]',`${e.records.toLocaleString('en-GB')} records · ${e.items} distinct items`);
    find('[data-triage-chart]').setAttribute('aria-label',`${e.name}. Agent minus incumbent AUC ${signed(e.difference)}. ${find('[data-triage-interval]').textContent}`);
  }
  function pilot(index){
    press('pilot',index);const p=pilotSummary(index);set('[data-pilot-rate]',p.rate.toFixed(1)+'%');set('[data-pilot-denominator]',`31 wanted / ${p.total} ${index===1?'yes-or-no answers':'total responses'}`);
    const dots=find('[data-pilot-dots]');dots.replaceChildren();p.counts.forEach((n,i)=>{for(let j=0;j<n;j++){const dot=document.createElement('span');dot.className=['wanted','unwanted','uncertain'][i];dot.setAttribute('aria-hidden','true');dots.append(dot);}});
    dots.setAttribute('aria-label',`${p.total} responses: 31 wanted, 6 unwanted${index===0?', 3 uncertain':''}.`);
    set('[data-pilot-interval]',index===1?'95% Wilson interval: 68.9–92.3% for the 37 yes-or-no answers.':'77.5% wanted among all 40 responses. The 3 uncertain answers remain a separate category; the 95% interval belongs to the yes-or-no population.');
  }
  function calibration(index){
    press('calibration',index);const spurious=index===0?75:0,caught=index===0?520:522;
    set('[data-calibration-false]',spurious);set('[data-calibration-caught]',caught);find('[data-calibration-false-bar]').style.width=spurious/75*100+'%';find('[data-calibration-caught-bar]').style.width=caught/644*100+'%';
    set('[data-calibration-readout]',index===0?'As shipped: 75 spurious items and 520 caught events. This is the system used for the headline detection and LLM evaluation.':'Post-hoc diagnostic: 0 spurious items and 522 caught events. Removing calendar-closed days changes the detector’s own calibration pool. The change was reported, not applied; prospective validation is the next step.');
  }
  root.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b||!root.contains(b))return;
    if(b.hasAttribute('data-stage'))stage(Number(b.dataset.stage));
    if(b.hasAttribute('data-model-venue')){venue=Number(b.dataset.modelVenue);selected=evidence.venues[venue].served;press('model-venue',venue);renderModels();}
    if(b.hasAttribute('data-model-id')){selected=Number(b.dataset.modelId);modelDetail();}
    if(b.hasAttribute('data-coverage-venue'))coverage(Number(b.dataset.coverageVenue));
    if(b.hasAttribute('data-event'))events(Number(b.dataset.event));
    if(b.hasAttribute('data-triage'))triage(Number(b.dataset.triage));
    if(b.hasAttribute('data-pilot'))pilot(Number(b.dataset.pilot));
    if(b.hasAttribute('data-calibration'))calibration(Number(b.dataset.calibration));
  });
  find('[data-model-metric]').addEventListener('change',event=>{metric=Number(event.target.value);renderModels();});
  find('[data-model-sort]').addEventListener('change',event=>{sort=event.target.value;renderModels();});
  find('[data-model-retained]').addEventListener('change',event=>{retained=event.target.checked;renderModels();});
  stage(0);renderModels();coverage(2);events(0);triage(0);pilot(1);calibration(0);
}
if(typeof document!=='undefined')startBrain(document.querySelector('.brain-native'));

export const mechanisms={
 duty:{
  warehouse:{file:'DATA PREPARATION / DISSERTATION §3.3',title:'Make every row explainable.',copy:'Square exports become daily venue rows in a local DuckDB warehouse. Invalid dates and unmatched locations are counted, the Europe/London timestamp rules are explicit, and the data ceiling is frozen for evaluation.',boundary:'The promised production research schema was not provisioned. The measured evidence came from locally assembled exports; external-system integrations belong to the host.',code:'# Explanatory reconstruction, not engine source\nrows = parse_square_export(encoding="utf-16")\nmanifest = reconcile_dates_and_locations(rows)\ndaily = aggregate_by_export_date(rows)\n\nfeatures = history_strictly_before_each_row(daily)\nwarehouse.persist(daily, features, manifest)\n# Freeze the ceiling before comparing models.'},
  calibration:{file:'SPLIT CONFORMAL / §3.8, ALGORITHM 1',title:'A point forecast needs a range.',copy:'Absolute errors from a held-out calibration block set the width. The Mondrian variant uses separate pools for calendar-open and structural-zero days, with pooled fallback for unseen groups.',boundary:'The served band is calibrated once before the test window. Rolling refresh belongs to the validation audit. When the order-statistic index exceeds the pool size, the implementation uses the largest observed error and the finite-sample guarantee is unavailable.',code:'# Algorithm 1, condensed reconstruction\nscores = sorted(abs(actual - forecast))\nk = ceil((len(scores) + 1) * 0.90)\n\nif k <= len(scores):\n    width = scores[k - 1]\nelse:\n    width = max(scores)  # guarantee unavailable\n\nlower = max(0, point_forecast - width)\nupper = point_forecast + width'},
  detection:{file:'DEVIATION DETECTION / §3.9, ALGORITHM 2',title:'Separate a spike from a shift.',copy:'The detector standardises the departure from the day-of-week median by its own conformal half-width. Two-sided CUSUM accumulates quiet drift; persistence watches for four same-direction breaches in seven trading days.',boundary:'Ellel skips CUSUM. The point-deviation scan reaches only the last 14 trading days. The detector uses its own median-and-band construction, not the served Chronos forecast’s coverage promise.',code:'# Algorithm 2, condensed reconstruction\nz = (actual - weekday_median) / max(width, eps)\n\npositive = max(0, positive + z - 0.5)\nnegative = max(0, negative - z - 0.5)\nif max(positive, negative) > 5.0:\n    emit_shift_alarm(onset, today)\n    positive = negative = 0\n\n# In parallel: >= 4 same-direction |z| > 1\n# breaches within the last 7 trading days.'},
  triage:{file:'INTERVENTION EVALUATION / §3.12, ALGORITHM 3',title:'An interruption has a price.',copy:'The incumbent ranks candidates with a product of six fixed weights. The offline LLM challenger sees that ranked queue and returns a schema-constrained probability that each item is worth surfacing. Prompt, model and payload identify cached responses.',boundary:'The LLM was evaluated as a re-ranker, not an independent scorer. It showed no established improvement. The incumbent score has no probability scale, so it is compared at matched raise volume rather than thresholded as a probability.',code:'# Algorithm 3, explanatory reconstruction\nthreshold = 1 / (1 + miss_to_alarm_cost)\nagent_raise = probability >= threshold\n\n# Compare at the SAME number of raised items:\nincumbent_raise = top_k(incumbent_scores,\n                        k=sum(agent_raise))\n\n# Cache by model + fixed prompt + payload.\n# Schema validation is not factual validation.'}
 },
 bakery:{
  prepare:{file:'src/01_data_prep.ipynb',title:'Make the target explicit.',copy:'Product and store tables join to transaction rows with many-to-one validation. The notebook fills missing text keys with Unknown and clips negative quantities to zero. Full-price quantity is the initial target.',boundary:'The modelling notebook later reads y_capped from an ML-ready CSV. This walkthrough does not claim the intermediate capping and encoding stage was reproduced end to end.',code:'# Condensed equivalent of notebook operations\nrows = transactions.merge(products,\n    on="Product_Code", validate="m:1")\nrows = rows.merge(stores,\n    on="Store_Number", validate="m:1")\n\nrows[quantity_columns] = rows[quantity_columns].clip(0)\nrows["y_full_price_qty"] = rows[\n    "Full_Price_Sales_Quantity"]'},
  features:{file:'src/02_features.ipynb + 03_add_events_and_rtc_lags.ipynb',title:'Only the past gets a vote.',copy:'Features are sorted within store–product groups. The sales notebook builds shifted 7- and 14-row simple and exponential moving averages. The RTC notebook adds shifted 1- and 7-row lags and 7- and 30-row means, plus Christmas indicators.',boundary:'Reduced-to-clear is context, not the target. These rolling windows count rows; without a complete daily grid, a 7-row window is not necessarily a 7-calendar-day history.',code:'# Condensed equivalent / inside one entity group\ng = g.sort_values("Transaction_date")\nprevious_sales = g["y_full_price_qty"].shift(1)\ng["sma7_qty"] = previous_sales.rolling(\n    7, min_periods=1).mean()\n\nprevious_rtc = g["rtc_capped"].shift(1)\ng["roll7_rtc_capped"] = previous_rtc.rolling(\n    7, min_periods=1).mean()'},
  train:{file:'src/04_modelling & SHAP.ipynb',title:'Learn a quantity, not just an average.',copy:'One LightGBM quantile model is fitted to the pooled store–product feature matrix. Equal under- and overstock costs set the quantile to 0.50. Predictions are then scored separately for each store–product pair.',boundary:'The separate arm fits ETS per entity, with 30-day then 7-day seasonality and trend fallback. It estimates residual spread, samples 1,000 non-negative normal scenarios and searches 200 candidate quantities. Those distribution assumptions remain part of the decision.',code:'# Condensed equivalent of the model builder\nc_u, c_o = 1.0, 1.0\ntau = c_u / (c_u + c_o)\nmodel = lgb.LGBMRegressor(\n    objective="quantile", alpha=tau,\n    n_estimators=500, learning_rate=0.05,\n    max_depth=-1, num_leaves=31)\n\nmodel.fit(X_train, y_train)\nquantity = model.predict(X_test)'},
  evaluate:{file:'src/04_modelling & SHAP.ipynb + 05_evaluation.ipynb',title:'Compare the same decisions.',copy:'Expanding validation starts from 90 training days and advances by 30-day slices. LightGBM’s final test boundary is 18 February 2024. The evaluation notebook joins the score files on store and product so every compared row has all model scores.',boundary:'The notebook’s ETS date slices include the cutoff on both sides, while LightGBM uses a strict split. A repeatable next run needs an assertion that every arm has disjoint train and test dates. No models are refitted in this case page.',code:'# Condensed evaluation logic\ncutoff = "2024-02-18"\ntrain = frame[frame.index < cutoff]\ntest = frame[frame.index >= cutoff]\n\nmatched = baseline.merge(lgbm_scores,\n    on=["store", "product"], how="inner")\nmatched = matched.merge(separate_scores,\n    on=["store", "product"], how="inner")\nmatched = matched.dropna()'},
  explain:{file:'src/04_modelling & SHAP.ipynb / TreeExplainer',title:'Let a manager inspect the drivers.',copy:'TreeExplainer runs on the fitted LightGBM model and its held-out feature matrix. The notebook generates global importance, individual waterfall and force plots, then slices explanations by product and by a selected store–product pair.',boundary:'SHAP explains the fitted model’s attribution, not the causes of demand. A live Base + Adjustment interface remains a proposed adoption design rather than a measured manager-facing result.',code:'# Condensed equivalent of the SHAP workflow\nexplainer = shap.TreeExplainer(final_model)\nattributions = explainer(X_test)\n\nshap.summary_plot(attributions, X_test)\nshap.plots.waterfall(attributions[0])\n\n# Inspect one product/store slice separately.\n# Attribution does not establish causation.'}
 }
};

export function replaySignal(values,{useCusum=true,day=values.length}={}){
 const n=Math.max(0,Math.min(values.length,Math.floor(day))),cusum=[],persistence=[],points=[];
 let positive=0,negative=0,onsetPositive=1,onsetNegative=1;
 for(let i=0;i<n;i++){
  const z=values[i],d=i+1;
  if(i>=values.length-14&&Math.abs(z)>1)points.push({day:d,direction:z>0?'up':'down'});
  if(useCusum){
   if(positive===0)onsetPositive=d;if(negative===0)onsetNegative=d;
   positive=Math.max(0,positive+z-.5);negative=Math.max(0,negative-z-.5);
   if(positive>5||negative>5){cusum.push({day:d,onset:positive>5?onsetPositive:onsetNegative,direction:positive>5?'up':'down'});positive=0;negative=0;}
  }
  if(d>=7){
   const start=i-6,window=values.slice(start,i+1);
   for(const direction of [1,-1]){
    const matching=window.map((v,j)=>({v,j})).filter(({v})=>direction===1?v>1:v<-1);
    if(matching.length>=4){persistence.push({day:d,onset:start+matching[0].j+1,direction:direction===1?'up':'down'});break;}
   }
  }
 }
 return {points,cusum,persistence,positive,negative};
}
export function decisionThreshold(probability,ratio){
 if(!Number.isFinite(probability)||probability<0||probability>1||!Number.isFinite(ratio)||ratio<=0)return null;
 const threshold=1/(1+ratio);return {threshold,raise:probability>=threshold};
}
export const salesHistory=[8,10,12,10,14,16,14];
export function featureExample(today,history=salesHistory){
 if(!Number.isFinite(today)||today<0||!history.length||history.some(v=>!Number.isFinite(v)))return null;
 const mean=a=>a.reduce((sum,x)=>sum+x,0)/a.length;
 return {correct:mean(history),leaky:mean([...history.slice(1),today])};
}
export const signalScenarios={
 spike:Array.from({length:28},(_,i)=>i===18?3.6:[.1,-.2,.25,-.1][i%4]),
 drift:Array.from({length:28},(_,i)=>i>=7?.85:[.1,-.2,.25,-.1][i%4]),
 persistent:Array.from({length:28},(_,i)=>i>=16&&i<=19?1.4:[.1,-.2,.25,-.1][i%4]),
 early:Array.from({length:28},(_,i)=>i===6?3.6:[.1,-.2,.25,-.1][i%4])
};

export function startMechanisms(root){
 if(!root||root.dataset.techReady)return;root.dataset.techReady='true';
 const $=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],type=root.dataset.techCase;
 function showStep(key){const step=mechanisms[type]?.[key];if(!step)return;
  for(const field of ['file','title','copy','boundary','code'])$(`[data-tech-${field}]`).textContent=step[field];
  all('[data-tech-step]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.techStep===key)));
 }
 all('[data-tech-step]').forEach(b=>b.addEventListener('click',()=>showStep(b.dataset.techStep)));
 showStep(type==='duty'?'warehouse':'prepare');
 if(type==='bakery'){
  const history=$('[data-bakery-history]');
  for(const [i,value] of salesHistory.entries()){
   const bar=document.createElement('div'),number=document.createElement('strong'),fill=document.createElement('i'),label=document.createElement('span');
   number.textContent=value;fill.style.height=value/80*160+'px';label.textContent='D−'+(7-i);bar.append(number,fill,label);history.append(bar);
  }
  const update=()=>{const today=Number($('[data-bakery-today]').value),result=featureExample(today);
   $('[data-bakery-today-output]').textContent=today+' units';$('[data-bakery-today-label]').textContent=today;
   $('[data-bakery-today-bar]').style.height=today/80*160+'px';$('[data-bakery-leaky]').textContent=result.leaky.toFixed(2);
   $('[data-bakery-feature-reading]').textContent=`The correct rolling feature stays at ${result.correct.toFixed(2)}. Including today would move it to ${result.leaky.toFixed(2)} and use the value the model is meant to predict.`;
  };$('[data-bakery-today]').addEventListener('input',update);update();return;
 }
 let scenario='spike',timer=null;
 const dayInput=$('[data-duty-day-input]'),play=$('[data-duty-play]'),venue=$('[data-duty-venue]');
 const x=i=>48+i/27*724,y=z=>150-z*32.5,coordinates=values=>values.map((z,i)=>`${x(i)},${y(z)}`).join(' ');
 const alarmText=alarms=>alarms.length?`First alarm / day ${alarms[0].day} · onset ${alarms[0].onset}`:'No shift alarm';
 function renderSignal(){
  const values=signalScenarios[scenario],day=Number(dayInput.value),sparse=venue.value==='sparse';
  const result=replaySignal(values,{day,useCusum:!sparse});
  $('[data-duty-ghost]').setAttribute('points',coordinates(values));$('[data-duty-line]').setAttribute('points',coordinates(values.slice(0,day)));
  for(const key of ['x1','x2'])$('[data-duty-cursor]').setAttribute(key,x(day-1));
  $('[data-duty-dot]').setAttribute('cx',x(day-1));$('[data-duty-dot]').setAttribute('cy',y(values[day-1]));
  $('[data-duty-day]').textContent=String(day).padStart(2,'0')+' / 28';
  $('[data-duty-point]').textContent=result.points.length?`${result.points.length} breach${result.points.length===1?'':'es'} in reach`:'No breach in reach';
  $('[data-duty-cusum]').textContent=sparse?'Disabled for Ellel':alarmText(result.cusum);
  $('[data-duty-detector="cusum"]').dataset.disabled=String(sparse);
  $('[data-duty-persistence]').textContent=alarmText(result.persistence);
  const descriptions={spike:'One large departure breaches the band. A single spike below the cumulative threshold need not become a drift alarm.',drift:'Every shifted day remains inside the band. CUSUM adds the small departures; the persistence rule has no band breaches to count.',persistent:'Four consecutive positive breaches trigger persistence. CUSUM has a different threshold and can fire on a different day.',early:'This early spike falls outside the final 14-day point scan. Increasing spike sensitivity cannot recover a day the scan never examines.'};
  $('[data-duty-explanation]').textContent=descriptions[scenario]+(sparse?' Ellel’s CUSUM box is disabled: only persistence remains for sustained shifts.':'');
  $('#duty-signal-desc')?.replaceChildren(document.createTextNode(`Synthetic ${scenario} replay through day ${day}. ${result.points.length} point breaches, ${result.cusum.length} CUSUM alarms and ${result.persistence.length} persistence alarms. ${sparse?'CUSUM disabled for Ellel.':''}`));
 }
 const staticMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('motion-paused');
 function stopReplay(){if(timer!==null)clearInterval(timer);timer=null;play.setAttribute('aria-pressed','false');play.textContent=staticMotion()?'Step day →':'Replay ▶';}
 function nextDay(){const day=Number(dayInput.value);if(day>=28){stopReplay();return;}dayInput.value=day+1;renderSignal();if(day+1===28)stopReplay();}
 play.addEventListener('click',()=>{
  if(timer!==null){stopReplay();return;}
  if(staticMotion()){if(Number(dayInput.value)>=28){dayInput.value=1;renderSignal();}else nextDay();return;}
  if(Number(dayInput.value)>=28)dayInput.value=1;renderSignal();play.textContent='Pause Ⅱ';play.setAttribute('aria-pressed','true');timer=setInterval(nextDay,180);
 });
 dayInput.addEventListener('input',()=>{stopReplay();renderSignal();});venue.addEventListener('change',renderSignal);
 all('[data-duty-scenario]').forEach(b=>b.addEventListener('click',()=>{stopReplay();scenario=b.dataset.dutyScenario;dayInput.value=28;all('[data-duty-scenario]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderSignal();}));
 const hidden=()=>{if(root.closest('.route')?.hidden||document.hidden||document.body.classList.contains('motion-paused'))stopReplay();};
 window.addEventListener('hashchange',hidden);document.addEventListener('visibilitychange',hidden);
 new MutationObserver(hidden).observe(document.body,{attributes:true,attributeFilter:['class']});
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',stopReplay);
 function renderThreshold(){const p=Number($('[data-duty-probability-input]').value)/100,r=Number($('[data-duty-cost]').value),result=decisionThreshold(p,r);
  $('[data-duty-probability]').textContent=p.toFixed(2);$('[data-duty-threshold]').textContent=result.threshold.toFixed(2);
  $('[data-duty-threshold-marker]').style.left=result.threshold*100+'%';$('[data-duty-probability-marker]').style.left=p*100+'%';
  $('[data-duty-verdict]').textContent=result.raise?'Surface for review':'Keep below the threshold';
 }
 $('[data-duty-probability-input]').addEventListener('input',renderThreshold);$('[data-duty-cost]').addEventListener('change',renderThreshold);
 renderThreshold();renderSignal();stopReplay();
}
if(typeof document!=='undefined')document.querySelectorAll('[data-tech-case]').forEach(startMechanisms);

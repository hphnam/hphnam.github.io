export const models = [
  {id:'integrated',name:'LightGBM quantile',detail:'Integrated',cost:1.59,wins:104,color:'#00A1CC',description:'Learns the bake quantity directly with a quantile objective. Lowest mean cost in the pilot and lowest cost in 104 of 157 store–product combinations.'},
  {id:'linear',name:'Linear regression',detail:'Baseline',cost:1.70,wins:48,color:'#F14F57',description:'A simple baseline remained competitive. The original win-share plot reports 30.6%, equivalent to 48 of the 157 combinations.'},
  {id:'separate',name:'ETS + SAA',detail:'Separate',cost:1.88,wins:5,color:'#80D0E5',description:'Forecasts demand first, then chooses a quantity using Sample Average Approximation. The original win-share plot reports 3.2%, equivalent to 5 of 157 combinations.'},
  {id:'seasonal',name:'Seasonal naïve',detail:'Baseline',cost:4.32,wins:0,color:'#C08A00',description:'The weekly baseline had the highest mean cost. It won none of the combinations shown in the original win-share plot.'}
];
export function newsvendorCost(quantity,demand,underCost,overCost){
  return underCost*Math.max(demand-quantity,0)+overCost*Math.max(quantity-demand,0);
}
export function compareModels(model){
  return {share:100*model.wins/157,reduction:100*(1.88-model.cost)/1.88};
}
export function censoredSales(available,demand){
  return {sales:Math.min(available,demand),unmet:Math.max(demand-available,0)};
}
export function annualScenario(stores,products,gain,value){
  if(!Number.isInteger(stores)||stores<1||stores>2500||!Number.isInteger(products)||products<1||products>100||!Number.isFinite(gain)||gain<0||gain>5||!Number.isFinite(value)||value<0||value>10)return null;
  return {annual:stores*products*gain*value*365,pilot:6*products*gain*value*365};
}
export function improvementAgainst(id){
  const reference=models.find(m=>m.id===id);
  return 100*(reference.cost-models[0].cost)/reference.cost;
}
export const features = [
  ['roll30_qty','30-day sales history','The strongest global driver','The rolling mean over 30 days dominated the original SHAP importance plot. Higher recent sales generally pushed recommendations upward.','It gives the manager a familiar starting point: what this product has usually sold recently.'],
  ['roll7_qty','7-day sales history','The second strongest driver','The 7-day rolling mean added a shorter view of recent trading. It ranked second in the original global importance plot.','A recent change can help explain why the recommendation differs from the longer-run baseline.'],
  ['lag1_qty','Yesterday’s sales','A short-term signal','The previous day’s quantity ranked third. Its impact was smaller than the two rolling averages.','Review the recent trading context before treating an unusual day as a lasting demand change.'],
  ['weekday','Day of the week','The calendar matters','Weekday ranked fourth, capturing differences across the weekly shopping cycle. The global plot does not establish a single direction for every weekday.','Explain the relevant trading day alongside the recent-sales baseline.'],
  ['lag7_qty','Sales one week ago','A weekly comparison','The same-day quantity from one week earlier ranked fifth. It adds context alongside the rolling windows.','Compare a recommendation with the last similar trading day, while keeping operational noise in view.'],
  ['SubSect_Description_le','Product subcategory','The product context','The encoded subcategory ranked sixth. The grouping carried information about the recommendation, but importance alone does not demonstrate causal substitution.','A manager can review the recommendation in the context of the wider bakery range.']
];

export function startCoop(root=document.querySelector('.coop-native')){
  if(!root)return;
  const find=s=>root.querySelector(s);
  const quantity=find('#coop-quantity'),under=find('#coop-under-cost'),over=find('#coop-over-cost');
  function updateDecision(){
    const q=Number(quantity.value),cu=Number(under.value),co=Number(over.value),y=40;
    const shortage=Math.max(y-q,0),waste=Math.max(q-y,0),cost=newsvendorCost(q,y,cu,co);
    find('[data-quantity]').textContent=q;
    find('[data-under-cost]').textContent=cu;
    find('[data-over-cost]').textContent=co;
    find('[data-shortage]').textContent=shortage;
    find('[data-waste]').textContent=waste;
    find('[data-day-cost]').textContent=cost.toFixed(1);
    find('[data-quantile]').textContent=(cu/(cu+co)).toFixed(2);
    const ymax=40*Math.max(cu,co),x=n=>48+n/80*600,ypos=n=>216-n/ymax*178;
    find('[data-cost-curve]').setAttribute('points',`48,${ypos(40*cu)} 348,216 648,${ypos(40*co)}`);
    find('[data-shortage-area]').setAttribute('points',`48,${ypos(40*cu)} 348,216 48,216`);
    find('[data-waste-area]').setAttribute('points',`348,216 648,${ypos(40*co)} 648,216`);
    find('[data-cost-marker]').setAttribute('cx',x(q));
    find('[data-cost-marker]').setAttribute('cy',ypos(cost));
    find('[data-chart-max]').textContent=ymax;
    find('[data-cost-chart-desc]').textContent=`With demand of 40, baking ${q} gives ${shortage} unmet units and ${waste} leftover units. Weighted cost is ${cost.toFixed(1)}. Understocking weight ${cu}, overstocking weight ${co}.`;
  }
  [quantity,under,over].forEach(input=>input.addEventListener('input',updateDecision));
  find('[data-reset-decision]').addEventListener('click',()=>{quantity.value=35;under.value=1;over.value=1;updateDecision();});
  updateDecision();


  const available=find('#coop-available'),latent=find('#coop-latent-demand');
  function updateCensoring(){
    const stock=Number(available.value),demand=Number(latent.value),result=censoredSales(stock,demand);
    find('[data-available-output]').textContent=stock;
    find('[data-demand-output]').textContent=demand;
    for(const [key,value] of [['demand',demand],['sales',result.sales],['unmet',result.unmet]]){
      find(`[data-${key}-value]`).textContent=value;
      find(`[data-${key}-bar]`).style.width=100*value/80+'%';
    }
    find('[data-censor-chart]').setAttribute('aria-label',`${stock} units available, customer demand ${demand}, observed sales ${result.sales}, unmet demand ${result.unmet}.`);
    find('[data-censor-insight]').textContent=result.unmet>0?`The till shows ${result.sales} sales, but ${result.unmet} more units were wanted. Learning from sales alone can teach the next model to under-order.`:`Sales equal all ${demand} units wanted in this example. The till alone still cannot tell whether a different day was limited by stock.`;
  }
  [available,latent].forEach(input=>input.addEventListener('input',updateCensoring));updateCensoring();
  function updateReference(id){
    const ref=models.find(m=>m.id===id);
    root.querySelectorAll('[data-coop-reference]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.coopReference===id)));
    find('[data-cost-reduction]').textContent=improvementAgainst(id).toFixed(1)+'%';
    find('[data-reduction-description]').textContent=`Lower mean test cost for the integrated model compared with ${ref.name}, calculated from 1.59 and ${ref.cost.toFixed(2)}. These are offline scores under the project's cost assumptions.`;
  }
  root.querySelectorAll('[data-coop-reference]').forEach(button=>button.addEventListener('click',()=>updateReference(button.dataset.coopReference)));updateReference('separate');
  const scaleInputs=['stores','products','gain','value'].map(name=>find('#coop-scale-'+name));
  const money=new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0});
  function updateScenario(){
    const values=scaleInputs.map(input=>input.value.trim()===''?NaN:Number(input.value));
    const result=annualScenario(...values);
    if(!result){
      find('[data-scenario-value]').textContent='Check inputs';
      find('[data-scenario-formula]').textContent='Use 1–2,500 whole stores, 1–100 whole products, 0–5 units gained per day and £0–£10 per unit.';
      find('[data-scenario-pilot]').textContent='—';find('[data-scenario-stores]').textContent='—';return;
    }
    const [stores,products,gain,value]=values;
    find('[data-scenario-value]').textContent=money.format(result.annual);
    find('[data-scenario-pilot]').textContent=money.format(result.pilot);
    find('[data-scenario-stores]').textContent=stores.toLocaleString('en-GB')+' stores';
    find('[data-scenario-formula]').textContent=`${gain.toFixed(2)} units × £${value.toFixed(2)} × 365 days × ${products} products × ${stores.toLocaleString('en-GB')} stores`;
  }
  scaleInputs.forEach(input=>input.addEventListener('input',updateScenario));
  find('[data-reset-scenario]').addEventListener('click',()=>{[2500,30,.12,.50].forEach((value,i)=>{scaleInputs[i].value=String(value);});updateScenario();});updateScenario();

  const pipelines={
    separate:[['Forecast demand','ETS tries 30-day seasonality, then 7-day seasonality, then a simple trend.'],['Estimate uncertainty','In-sample residuals provide a standard-deviation estimate.'],['Optimise the decision','SAA samples 1,000 demand scenarios and checks 200 candidate quantities.'],['Set the bake quantity','The chosen quantity minimises mean cost over the simulated scenarios.']],
    integrated:[['Prepare the features','Use lagged sales, rolling windows, calendar variables and product/store context.'],['Set the cost weights','The quantile target is τ = cᵤ / (cᵤ + cₒ). The shown pilot code sets both weights to 1.'],['Train LightGBM','A quantile objective learns a bake quantity directly from the features.'],['Set the bake quantity','The decision is the model output. There is no separate SAA step.']]
  };
  function updatePipeline(which){
    root.querySelectorAll('[data-pipeline]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.pipeline===which)));
    find('[data-pipeline-title]').textContent=which==='integrated'?'Learn the decision directly':'Forecast, then optimise';
    find('[data-flow-chart]').dataset.activePipeline=which;
    const list=find('[data-pipeline-steps]');list.replaceChildren();
    pipelines[which].forEach(([name,description],i)=>{const li=document.createElement('li');const number=document.createElement('span');number.className='coop-stage-number';number.textContent=String(i+1).padStart(2,'0');const strong=document.createElement('h4');strong.textContent=name;const p=document.createElement('p');p.textContent=description;li.append(number,strong,p);list.append(li);});
  }
  root.querySelectorAll('[data-pipeline]').forEach(button=>button.addEventListener('click',()=>updatePipeline(button.dataset.pipeline)));
  updatePipeline('integrated');

  let metric='cost';
  function updateMetric(which){
    metric=which;
    root.querySelectorAll('[data-coop-metric]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.coopMetric===which)));
    find('[data-comparison-caption]').textContent=which==='cost'?'Mean Newsvendor cost · lower is better':'Lowest-cost combinations · out of 157';
    root.querySelectorAll('[data-model]').forEach(button=>{
      const model=models.find(m=>m.id===button.dataset.model);
      button.querySelector('.coop-bar-fill').style.width=`${which==='cost'?100*model.cost/4.32:100*model.wins/157}%`;
      button.querySelector('.coop-bar-value').textContent=which==='cost'?model.cost.toFixed(2):`${model.wins} / 157`;
      button.setAttribute('aria-label',`${model.name}, ${which==='cost'?'mean cost '+model.cost.toFixed(2):model.wins+' of 157 lowest-cost combinations'}. Inspect model.`);
    });
  }
  root.querySelectorAll('[data-coop-metric]').forEach(button=>button.addEventListener('click',()=>updateMetric(button.dataset.coopMetric)));
  function selectModel(id){
    const m=models.find(m=>m.id===id),stats=compareModels(m);
    root.querySelectorAll('[data-model]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.model===id)));
    find('[data-model-name]').textContent=m.name;
    find('[data-model-description]').textContent=m.description;
    find('[data-model-cost]').textContent=m.cost.toFixed(2);
    find('[data-model-share]').textContent=stats.share.toFixed(1)+'%';
    find('[data-win-center]').textContent=stats.share.toFixed(1)+'%';
    root.querySelectorAll('[data-model-sector]').forEach(sector=>{sector.style.opacity=sector.dataset.modelSector===id?'1':'.35';sector.setAttribute('aria-pressed',String(sector.dataset.modelSector===id));});
  }
  root.querySelectorAll('[data-model]').forEach(button=>button.addEventListener('click',()=>selectModel(button.dataset.model)));
  root.querySelectorAll('[data-model-sector]').forEach(sector=>{
    sector.addEventListener('click',()=>selectModel(sector.dataset.modelSector));
    sector.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectModel(sector.dataset.modelSector);}});
  });
  updateMetric(metric);selectModel('integrated');

  function selectFeature(index){
    const [code,name,title,evidence,meaning]=features[index];
    root.querySelectorAll('[data-feature]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.feature)===index)));
    find('[data-feature-code]').textContent=code;
    find('[data-feature-name]').textContent=name;
    find('[data-feature-title]').textContent=title;
    find('[data-feature-evidence]').textContent=evidence;
    find('[data-feature-meaning]').textContent=meaning;
  }
  root.querySelectorAll('[data-feature]').forEach(button=>button.addEventListener('click',()=>selectFeature(Number(button.dataset.feature))));
  selectFeature(0);
}
if(typeof document!=='undefined')startCoop();

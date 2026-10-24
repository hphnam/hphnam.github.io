import {csvBenchmark,confusionResults} from './feature-space-results.mjs';
// Historical measurements from the supplied SCC.451 report and notebook outputs.
export const projections={
 'cats-dino':{k:11,purity:'0.9971',ari:'0.2106',title:'Pure clusters ≠ the right number of clusters.',reading:'The selected DINOv2 solution splits two labels across 11 clusters. Purity is 0.9971, but ARI is only 0.2106. High purity alone would tell an incomplete story.'},
 'cats-resnet':{k:2,purity:'0.9797',ari:'0.9204',title:'Closer to the labels, with fewer clusters.',reading:'ResNet-50 selects two clusters and agrees much more closely with the binary labels (ARI 0.9204). Its purity is slightly lower than DINOv2’s, showing why both metrics matter.'},
 'roads-dino':{k:7,purity:'0.9085',ari:'0.8994',title:'Seven conditions. Seven selected clusters.',reading:'DINOv2’s selected k matches iROADS’ seven labels. The projection gives a useful view of the geometry; the full-space ARI of 0.8994 measures agreement with those labels.'},
 'roads-resnet':{k:7,purity:'0.9596',ari:'0.9239',title:'Here, the supervised backbone aligns better.',reading:'ResNet-50 also selects seven clusters, with higher purity and ARI than DINOv2 on iROADS. The strongest backbone depends on the dataset and the evaluation question.'}
};
export const benchmark={
 report:[['DINOv2 / KNN',.9984,.9984,.0018,.8417],['DINOv2 / linear head',.9987,.9987,2.9551,.0157],['ResNet-50 / KNN',.9896,.9896,.0043,.8234],['ResNet-50 / linear head',.9941,.9941,3.2812,.0162]],
 notebook:[['DINOv2 / KNN',.998397,.998397,.001898,.747248],['DINOv2 / linear head',.998665,.998665,2.830241,.015683],['ResNet-50 / KNN',.989583,.989583,.004331,.799976],['ResNet-50 / linear head',.993857,.993857,3.128318,.020603]]
};
export const climateReadings=[
 ['A useful seasonal baseline.','k=2 gives the strongest K-Means silhouette in the tested range. Its Davies–Bouldin index of 1.4352 is the lowest of the three methods.'],
 ['Better silhouette. A different verdict from DBI.','The median ALD mixture reaches silhouette 0.3181 versus 0.2552 for K-Means. Its DBI of 1.5829 is worse, so the metrics do not support an unqualified claim of superiority.'],
 ['A tail setting is not proof of extreme-event detection.','At p=0.9, silhouette falls to 0.1514 and DBI rises to 2.1155. Interpreting the clusters as high-risk weather would need labelled-event validation; it is a hypothesis, not an established result.']
];
// The uploaded CSV is the authoritative source for the saved notebook run.
benchmark.notebook=csvBenchmark.cats;
export const reportRoads=[['DINOv2 / KNN',1,1,.0005,.0307],['DINOv2 / linear head',1,1,.5191,.0034],['ResNet-50 / KNN',1,1,.0010,.0447],['ResNet-50 / linear head',1,1,.6683,.0039]];
export function benchmarkRows(source,dataset='cats'){return dataset==='cats'?benchmark[source]:source==='report'?reportRoads:csvBenchmark.roads;}
export function timingRatio(source,dataset='cats'){const rows=benchmarkRows(source,dataset);return rows[0][4]/rows[1][4];}
export const climateStages={
 engineer:{shape:'1,763 × 18 → 1,763 × 11',title:'Separate the mean from the daily range.',copy:'Retain seven mean/state variables and create four range/spread features. “Pressure_Tendency” is the notebook’s name for the within-day max–min range, not day-to-day pressure change.',code:"df_eng['Temp_Diurnal_Range'] = df['Temp_Max'] - df['Temp_Min']\ndf_eng['Pressure_Tendency'] = df['Pressure_Max'] - df['Pressure_Min']\ndf_eng['Humidity_Diurnal_Range'] = df['Humidity_Max'] - df['Humidity_Min']\ndf_eng['Gust_Spread'] = df['WindGust_Max'] - df['WindSpeed_Mean']"},
 transform:{shape:'1,763 × 11 → 1,763 × 11',title:'Compress the tails. Balance the units.',copy:'Precipitation, Snowfall, WindSpeed_Mean and Gust_Spread are clipped at zero and transformed with log1p. All eleven features are then standardised. No rows or columns are removed in this step.',code:"skewedcols = ['Precipitation', 'Snowfall',\n              'WindSpeed_Mean', 'Gust_Spread']\nfor col in skewedcols:\n    df_trans[col] = np.log1p(df_trans[col].clip(lower=0))\nX_scaled = StandardScaler().fit_transform(df_trans)"},
 pca:{shape:'1,763 × 11 → 1,763 × 9',title:'Nine axes retain 95% of the variance.',copy:'PCA decorrelates the scaled representation for the distance-based baseline. Save the full scaled feature matrix for the ALD model and the loadings for interpretation. Lower pairwise correlation does not establish independence.',code:"pca = PCA(n_components=0.95)\nX_pca = pca.fit_transform(df_scaled)\n# Saved output: 9 components\nloadings = pd.DataFrame(\n    pca.components_.T, index=df_scaled.columns)"}
};
export function matrixSummary(result){
 const counts=result.counts,total=counts.flat().reduce((a,b)=>a+b,0),correct=counts.reduce((a,row,i)=>a+row[i],0);
 const classes=counts.map((row,i)=>{const support=row.reduce((a,b)=>a+b,0),predicted=counts.reduce((a,r)=>a+r[i],0),tp=row[i],precision=predicted?tp/predicted:0,recall=support?tp/support:0;return {label:result.labels[i],support,precision,recall,f1:precision+recall?2*precision*recall/(precision+recall):0};});
 return {total,correct,errors:total-correct,accuracy:correct/total,classes,macroF1:classes.reduce((a,c)=>a+c.f1,0)/classes.length};
}
export function startFeatureSpace(doc=document,view=window){
 const root=doc.querySelector('[data-ml-case]');if(!root||root.dataset.mlReady)return null;root.dataset.mlReady='true';
 const state={dataset:'cats',model:'dino',source:'notebook',benchDataset:'cats',errorDataset:'cats',errorModel:'dino',errorClassifier:'LFT',errorUnits:'count'};
 const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
 const put=(s,t)=>q(s).textContent=String(t);
 function projection(){
  const key=state.dataset+'-'+state.model,d=projections[key],dataset=state.dataset==='cats'?'Cats vs Dogs':'iROADS',model=state.model==='dino'?'DINOv2':'ResNet-50';
  const img=q('[data-ml-projection]');img.removeAttribute('data-route-src');img.src='assets/feature-space/'+key+'.webp';img.alt=dataset+' '+model+' notebook PCA (left) and UMAP (right) projections';
  put('[data-ml-caption]','PCA (left) and UMAP (right) / '+dataset+' · '+model);
  for(const metric of ['k','purity','ari'])put('[data-ml-'+metric+']',d[metric]);
  put('[data-ml-reading-title]',d.title);put('[data-ml-reading]',d.reading);
  for(const attr of ['dataset','model'])qa('[data-ml-'+attr+']').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset['ml'+attr[0].toUpperCase()+attr.slice(1)]===state[attr])));
 }
 function results(){
  const source=state.source,dataset=state.benchDataset,rows=benchmarkRows(source,dataset),datasetTitle=dataset==='cats'?'Cats vs Dogs':'iROADS';
  q('[data-ml-benchmark-body]').replaceChildren(...rows.map((row,index)=>{
   const tr=doc.createElement('tr');if(index===1)tr.className='ml-winning';
   row.forEach((value,i)=>{const td=doc.createElement(i===0?'th':'td');if(i===0)td.scope='row';td.textContent=i===0?value:i===1?(value*100).toFixed(2)+'%':value.toFixed(i===2?4:source==='report'?4:6);tr.append(td);});return tr;
  }));
  put('[data-ml-benchmark-caption]',datasetTitle+' / '+(source==='report'?'submitted report · Table III':'classification_benchmark.csv'));
  put('[data-ml-headline-label]','Test accuracy / '+datasetTitle);
  put('[data-ml-headline-value]',(rows[1][1]*100).toFixed(2));
  const digits=source==='report'?4:6;
  put('[data-ml-timing-note]',(source==='report'?'Report':'CSV')+' timing: '+rows[0][4].toFixed(digits)+'s ÷ '+rows[1][4].toFixed(digits)+'s ≈ '+timingRatio(source,dataset).toFixed(1)+'× faster for DINOv2’s linear head than KNN on the '+datasetTitle+' test set. This excludes backbone feature extraction and is not a production latency guarantee.');
  qa('[data-ml-source]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mlSource===source)));
  qa('[data-ml-bench-dataset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mlBenchDataset===dataset)));
 }
 function stage(key){
  const d=climateStages[key];for(const attr of ['shape','title','copy','code'])put('[data-ml-stage-'+attr+']',d[attr]);
  qa('[data-ml-stage]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mlStage===key)));
 }
 function originalFigure(){
  const d=confusionResults[state.errorDataset+'-'+state.errorModel+'-'+state.errorClassifier];
  const img=q('[data-ml-original-figure]');
  if(q('[data-ml-original-matrix]').open){img.src='assets/feature-space/'+d.figure;img.alt='Original '+(state.errorModel==='dino'?'DINOv2':'ResNet-50')+' '+state.errorClassifier+' confusion matrix for '+(state.errorDataset==='cats'?'Cats vs Dogs':'iROADS');img.width=1000;img.height=800;}
 }
 function errors(){
  const key=state.errorDataset+'-'+state.errorModel+'-'+state.errorClassifier,d=confusionResults[key],summary=matrixSummary(d),matrix=q('[data-ml-matrix]');
  const ds=state.errorDataset==='cats'?'Cats vs Dogs':'iROADS',model=state.errorModel==='dino'?'DINOv2':'ResNet-50',clf=state.errorClassifier==='LFT'?'linear head':'KNN';
  matrix.className='ml-matrix'+(d.labels.length>2?' ml-matrix-seven':'');
  const caption=doc.createElement('caption');caption.textContent='True class ↓ / predicted class → · '+model+' '+clf+' · '+ds;
  const head=doc.createElement('thead'),headrow=doc.createElement('tr'),axis=doc.createElement('th');axis.textContent='True / predicted';axis.scope='col';headrow.append(axis);
  d.labels.forEach(label=>{const th=doc.createElement('th');th.scope='col';th.textContent=label;headrow.append(th);});head.append(headrow);
  const body=doc.createElement('tbody');
  d.counts.forEach((row,i)=>{
   const tr=doc.createElement('tr'),th=doc.createElement('th');th.scope='row';th.textContent=d.labels[i];tr.append(th);
   row.forEach((count,j)=>{
    const td=doc.createElement('td'),button=doc.createElement('button'),rate=count/summary.classes[i].support;
    button.type='button';button.textContent=state.errorUnits==='count'?count.toLocaleString('en-GB'):(rate*100).toFixed(2)+'%';
    button.className=i===j?'ml-matrix-correct':count?'ml-matrix-error':'ml-matrix-zero';
    const description='True '+d.labels[i]+', predicted '+d.labels[j]+': '+count+' of '+summary.classes[i].support+' images ('+(rate*100).toFixed(2)+'% of this true class).';
    button.setAttribute('aria-label',description);button.addEventListener('click',()=>{put('[data-ml-cell-reading]',description+(i===j?' Correct predictions.':' Misclassifications.'));});td.append(button);tr.append(td);
   });body.append(tr);
  });matrix.replaceChildren(caption,head,body);
  put('[data-ml-errors-total]',summary.errors);put('[data-ml-errors-support]','/ '+summary.total.toLocaleString('en-GB'));
  if(state.errorDataset==='cats'){
   const catErrors=d.counts[0][1],dogErrors=d.counts[1][0];
   put('[data-ml-errors-title]',catErrors+' cats called dogs. '+dogErrors+' '+(dogErrors===1?'dog called a cat.':'dogs called cats.'));
   put('[data-ml-errors-copy]',model+' + '+clf+' achieves '+(summary.accuracy*100).toFixed(2)+'% test accuracy, with '+summary.errors+' errors. The original text reports round metrics to two decimals; these counts and the CSV retain the distinction.');
  }else{
   put('[data-ml-errors-title]','All seven classes are diagonal.');
   put('[data-ml-errors-copy]','699 of 699 test images are correct, including 46 Tunnel and 52 SunStroke examples. The absence of test errors does not substitute for a duplicate audit or sequence-separated evaluation.');
  }
  put('[data-ml-cell-reading]','Select a matrix cell for its count and within-class rate.');
  q('[data-ml-class-report]').replaceChildren(...summary.classes.map(c=>{const tr=doc.createElement('tr');[c.label,c.precision.toFixed(4),c.recall.toFixed(4),c.f1.toFixed(4),c.support].forEach((v,i)=>{const td=doc.createElement(i===0?'th':'td');td.textContent=String(v);if(i===0)td.scope='row';tr.append(td);});return tr;}));
  q('[data-ml-report-link]').href='assets/feature-space/'+d.report;
  for(const attr of ['Dataset','Model','Classifier','Units'])qa('[data-ml-error-'+attr.toLowerCase()+']').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset['mlError'+attr]===state['error'+attr])));
  originalFigure();
 }
 qa('[data-ml-bench-dataset]').forEach(b=>b.addEventListener('click',()=>{state.benchDataset=b.dataset.mlBenchDataset;results();}));
 qa('[data-ml-stage]').forEach(b=>b.addEventListener('click',()=>stage(b.dataset.mlStage)));
 for(const attr of ['Dataset','Model','Classifier','Units'])qa('[data-ml-error-'+attr.toLowerCase()+']').forEach(b=>b.addEventListener('click',()=>{state['error'+attr]=b.dataset['mlError'+attr];errors();}));
 q('[data-ml-original-matrix]').addEventListener('toggle',originalFigure);
 for(const attr of ['dataset','model','source'])qa('[data-ml-'+attr+']').forEach(b=>b.addEventListener('click',()=>{state[attr]=b.dataset['ml'+attr[0].toUpperCase()+attr.slice(1)];attr==='source'?results():projection();}));
 qa('[data-ml-climate]').forEach(b=>b.addEventListener('click',()=>{
  qa('[data-ml-climate]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  const d=climateReadings[Number(b.dataset.mlClimate)];put('[data-ml-climate-title]',d[0]);put('[data-ml-climate-text]',d[1]);
 }));
 qa('[data-ml-jump]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();const target=doc.getElementById(b.dataset.mlJump);if(!target)return;target.scrollIntoView({behavior:view.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}));
 results();errors();
 if(typeof view.IntersectionObserver==='function'){
  const observer=new view.IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;qa('[data-ml-chapter-link]').forEach(link=>{if(link.dataset.mlChapterLink===entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}},{rootMargin:'-20% 0px -55% 0px'});
  qa('[data-ml-chapter]').forEach(chapter=>observer.observe(chapter));
 }
 return {state,projection,results,errors,stage};
}
if(typeof document!=='undefined')startFeatureSpace();

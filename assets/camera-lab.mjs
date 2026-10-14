import {cameraExcerpts} from './camera-lab-data.mjs';

export const cameraPairs=Object.freeze({
  zoomIn:{scene:'LUXURY HOTEL LOBBY',config:'V2 · 512 × 512 · MATCHED SCENE + SEED',baseline:'zoom-in-baseline',control:'zoom-in-motionlora',badge:'B / MOTIONLORA',baselineTitle:'Ask for a zoom.',baselineCopy:'Scene description + “camera slowly zooms in”.',controlTitle:'Load a motion prior.',controlCopy:'Scene description only. The zoom adapter supplies the movement.',ids:'EVAL_006 / EVAL_019'},
  zoomOut:{scene:'LUXURY HOTEL LOBBY',config:'V2 · 512 × 512 · MATCHED SCENE + SEED',baseline:'zoom-out-baseline',control:'zoom-out-motionlora',badge:'B / MOTIONLORA',baselineTitle:'Ask to pull back.',baselineCopy:'Scene description + “camera slowly zooms out”.',controlTitle:'Let the adapter pull back.',controlCopy:'The same scene, with a zoom-out MotionLoRA and no camera-direction text.',ids:'EVAL_011 / EVAL_018'},
  geometry:{scene:'MOUNTAIN LAKE AT SUNRISE',config:'V3 · 384 × 256 · MATCHED PROMPT + RESOLUTION',baseline:'geometry-baseline',control:'geometry-cameractrl',badge:'C / CAMERACTRL',baselineTitle:'Generate without a pose.',baselineCopy:'The V3 text baseline uses the same mountain-lake prompt.',controlTitle:'Condition on a camera path.',controlCopy:'CameraCtrl adds a RealEstate10K pose trajectory to the V3 pipeline.',ids:'EVAL_005 / EVAL_013'}
});
export const cameraMetrics=Object.freeze({
  magnitude:{title:'Optical flow magnitude',copy:'Average pixel movement between consecutive frames. More movement does not, by itself, prove more accurate control.',unit:'PIXELS / FRAME · HIGHER = MORE MOVEMENT',lora:[1.0483,5.6941],pose:[18.7422,7.5795],decimals:4,loraChange:'+443.2%',poseChange:'−59.6%',loraInterpretation:'More visible movement',poseInterpretation:'Less visible movement',loraNote:'Movement is much stronger within this matched V2 comparison.',poseNote:'The controlled output follows subtler real-world trajectories.'},
  direction:{title:'Temporal variation in flow direction',copy:'Standard deviation of the implementation’s per-frame averaged flow angle. A lower value means more consistent direction, not a smaller ground-truth pose error.',unit:'DEGREES · LOWER = LESS TEMPORAL VARIATION',lora:[19.0472,15.2103],pose:[45.7436,40.0700],decimals:2,loraChange:'−20.1%',poseChange:'−12.4%',loraInterpretation:'More consistent flow',poseInterpretation:'More consistent flow',loraNote:'Single-axis movements became steadier on average. Individual movement types vary.',poseNote:'Multi-axis trajectories still vary in direction; the pose condition reduces variation relative to its own baseline.'},
  clip:{title:'CLIP adjacent-frame similarity',copy:'Cosine similarity between consecutive CLIP frame embeddings. This measures visual continuity, not aesthetic quality or accurate camera pose.',unit:'COSINE SIMILARITY · HIGHER = MORE SIMILAR FRAMES',lora:[.9888,.9782],pose:[.9381,.9603],decimals:4,loraChange:'−1.1%',poseChange:'+2.4%',loraInterpretation:'Slightly less similar',poseInterpretation:'More similar frames',loraNote:'Stronger movement accompanies a small decrease in adjacent-frame similarity.',poseNote:'Geometric conditioning accompanies higher adjacent-frame similarity in this V3 comparison.'},
  radial:{title:'Radial optical flow',copy:'The mean projection of flow onto the outward direction from the image centre. Positive values indicate outward flow, which can accompany a zoom or forward translation.',unit:'SIGNED PIXEL FLOW · CENTRE LINE = ZERO',lora:null,pose:[-.2356,2.5212],decimals:4,loraChange:'20 / 20',poseChange:'+2.7568',loraInterpretation:'Zoom signs correct',poseInterpretation:'Shift in radial flow',loraNote:'10 zoom-in clips had positive flow and 10 zoom-out clips had negative flow. Pooling opposite signs would conceal the movement types.',poseNote:'The outward signal is consistent with forward camera translation, but does not establish complete 3D pose accuracy.'}
});
const cameraMethods={
  text:{input:'Scene + camera words',inputCopy:'“A hotel lobby, camera slowly zooms in.”',conditioning:'Text embedding',conditioningCopy:'The camera instruction shares the text channel with the scene description.',generation:'AnimateDiff',generationCopy:'SD 1.5 supplies appearance; the motion module supplies temporal behaviour.',result:'Check the movement',resultCopy:'The words describe an intention. The output must still be measured.',label:'BASELINE / NATURAL LANGUAGE',title:'A camera phrase is a weak control signal.',copy:'The baseline captures what a creative team would try first: describe a scene and ask the camera to move. The comparison tests whether a dedicated control channel improves that result.',note:'No movement adapter is active in this condition.'},
  lora:{input:'Scene + adapter choice',inputCopy:'Keep the scene prompt. Select pan left, pan right, zoom in or zoom out.',conditioning:'Learned motion prior',conditioningCopy:'Load camera-specific LoRA weights into the AnimateDiff motion module.',generation:'V2 + MotionLoRA',generationCopy:'The pretrained adapter steers temporal behaviour while the scene stays in the text channel.',result:'Strong single-axis motion',resultCopy:'Evaluate movement strength, direction and frame continuity.',label:'MOTIONLORA / LEARNED CAMERA PRIOR',title:'The movement lives in the adapter.',copy:'The experiment swaps a lightweight pretrained adapter for each movement and fixes its weight at 1.0. Removing camera text isolates that adapter’s contribution. I used the existing motion weights rather than training a new model.',note:'The generation loop unloads the previous adapter when the movement changes.'},
  pose:{input:'Scene + per-frame pose',inputCopy:'A text prompt describes appearance; intrinsics and extrinsics describe the camera.',conditioning:'Plücker ray embedding',conditioningCopy:'A six-component representation of each 3D ray enters the learned camera encoder.',generation:'V3 + camera features',generationCopy:'Camera representations condition temporal attention in the video diffusion model.',result:'Inspect geometric structure',resultCopy:'Look for coherent trajectory behaviour; flow is a proxy rather than a full pose benchmark.',label:'CAMERACTRL / EXPLICIT GEOMETRY',title:'A camera path becomes a conditioning signal.',copy:'I adapted the upstream pipeline for a single campus GPU, merged the V3 domain adapter, supplied RealEstate10K trajectories, and patched attention to fit memory. The excerpt shows the single-process launch; ray encoding belongs to the upstream CameraCtrl implementation.',note:'The pose encoder and diffusion weights are pretrained upstream research models.'}
};
export function cameraPose(movement,frame){
  if(!['panLeft','panRight','dolly','orbit'].includes(movement)||!Number.isInteger(frame)||frame<0||frame>15)throw new RangeError('Invalid camera path or frame');
  const t=frame/15;
  if(movement==='orbit'){const angle=(t-.5)*.9;return {x:Math.sin(angle)*6,y:1.6,z:-Math.cos(angle)*6,yaw:-angle,pitch:-.12};}
  return {x:0,y:1.6,z:movement==='dolly'?-6+t*2.8:-6,yaw:movement==='panLeft'?-t*.42:movement==='panRight'?t*.42:0,pitch:-.12};
}
export function projectCameraPoint(point,pose,width=1000,height=660){
  const dx=point[0]-pose.x,dy=point[1]-pose.y,dz=point[2]-pose.z;
  const x=dx*Math.cos(pose.yaw)-dz*Math.sin(pose.yaw),depth=dx*Math.sin(pose.yaw)+dz*Math.cos(pose.yaw);
  const y=dy*Math.cos(pose.pitch)-depth*Math.sin(pose.pitch),z=dy*Math.sin(pose.pitch)+depth*Math.cos(pose.pitch);
  if(z<=.15)return null;const focal=Math.min(width,height)*1.25;
  return {x:width/2+x*focal/z,y:height/2-y*focal/z,depth:z};
}
export function cameraBudgetFit(budget,peak){return Number.isFinite(budget)&&Number.isFinite(peak)&&budget>=peak;}

export function startCameraLab(root){
  if(!root)return;
  const get=id=>root.querySelector('#'+id),set=(id,value)=>get(id).textContent=String(value),all=selector=>[...root.querySelectorAll(selector)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const globallyPaused=()=>document.documentElement.classList.contains('motion-paused')||document.body.classList.contains('motion-paused');
  const mark=(selector,key,value)=>all(selector).forEach(button=>button.setAttribute('aria-pressed',String(button.dataset[key]===value)));
  const baseline=get('cc-video-baseline'),controlled=get('cc-video-control'),videos=[baseline,controlled];let videoRequest=0,videoTimer=null,playingPair=false,loadedPair='zoomIn';
  function pausePair(){videoRequest++;playingPair=false;videos.forEach(video=>video.pause());clearTimeout(videoTimer);videoTimer=null;get('cc-pair-play').setAttribute('aria-pressed','false');set('cc-pair-play','▶ Play both');}
  function setPairFrame(frame){pausePair();videos.forEach(video=>{if(Number.isFinite(video.duration)&&video.duration>0)video.currentTime=Math.min(video.duration-.02,video.duration*frame/16)});get('cc-pair-frame').value=frame;set('cc-pair-position',`${String(frame+1).padStart(2,'0')} / 16`);}
  function setPair(key){const pair=cameraPairs[key];if(!pair)return;pausePair();loadedPair=key;mark('[data-cc-pair]','ccPair',key);
    [['cc-pair-scene','scene'],['cc-pair-config','config'],['cc-control-badge','badge'],['cc-baseline-title','baselineTitle'],['cc-baseline-copy','baselineCopy'],['cc-control-title','controlTitle'],['cc-control-copy','controlCopy'],['cc-pair-ids','ids']].forEach(([id,prop])=>set(id,pair[prop]));
    videos.forEach((video,i)=>{const file=pair[i?'control':'baseline'];video.poster=`assets/camera-lab-media/${file}.webp`;video.src=`assets/camera-lab-media/${file}.mp4`;video.setAttribute('aria-label',`${i?'Controlled output':'Text baseline'}: ${pair.scene.toLowerCase()}`);video.load();});
    get('cc-pair-frame').value=0;set('cc-pair-position','01 / 16');set('cc-video-status','Playback starts on your click. Native video controls are available for each clip.');
  }
  all('[data-cc-pair]').forEach(button=>button.addEventListener('click',()=>setPair(button.dataset.ccPair)));
  get('cc-pair-play').addEventListener('click',async()=>{
    if(playingPair){pausePair();return;}
    if(globallyPaused()){set('cc-video-status','Resume motion with the portfolio’s motion control to play the pair.');return;}
    videos.forEach(video=>{video.currentTime=0;});playingPair=true;const request=++videoRequest;
    get('cc-pair-play').setAttribute('aria-pressed','true');set('cc-pair-play','Ⅱ Pause both');
    const result=await Promise.allSettled(videos.map(video=>video.play()));
    if(request!==videoRequest){if(!playingPair)videos.forEach(video=>video.pause());return;}
    if(result.some(r=>r.status==='rejected')){pausePair();set('cc-video-status','Paired playback could not start. Use the controls on either clip, or try Play both again.');return;}
    set('cc-video-status',`Playing the ${cameraPairs[loadedPair].scene.toLowerCase()} pair.`);
    // Start only after both video elements have accepted play(), then align again.
    controlled.currentTime=baseline.currentTime;
  });
  get('cc-pair-reset').addEventListener('click',()=>setPairFrame(0));get('cc-pair-frame').addEventListener('input',()=>setPairFrame(Number(get('cc-pair-frame').value)));
  baseline.addEventListener('timeupdate',()=>{
    if(!Number.isFinite(baseline.duration)||baseline.duration<=0)return;
    const frame=Math.min(15,Math.floor(baseline.currentTime/baseline.duration*16));get('cc-pair-frame').value=frame;set('cc-pair-position',`${String(frame+1).padStart(2,'0')} / 16`);
    if(playingPair&&!controlled.paused&&Number.isFinite(controlled.duration)&&Math.abs(controlled.currentTime/controlled.duration-baseline.currentTime/baseline.duration)>.12)controlled.currentTime=baseline.currentTime/baseline.duration*controlled.duration;
  });
  videos.forEach(video=>{video.addEventListener('error',()=>{pausePair();set('cc-video-status','This clip could not load. Try another pair or reload the case.');});video.addEventListener('pause',()=>{if(playingPair&&video.paused)pausePair();});});

  function renderCode(id,excerpt){const pre=get(id);pre.replaceChildren();excerpt.code.split('\n').forEach((line,i)=>{const row=document.createElement('span');row.className='cc-code-line';if(excerpt.start){const number=document.createElement('span');number.setAttribute('aria-hidden','true');number.textContent=excerpt.start+i;row.append(number);}row.append(document.createTextNode(line));pre.append(row);});}
  function showMethod(key){const method=cameraMethods[key];if(!method)return;mark('[data-cc-method]','ccMethod',key);Object.entries(method).forEach(([prop,value])=>set('cc-method-'+prop.replace(/[A-Z]/g,m=>'-'+m.toLowerCase()),value));set('cc-method-file',cameraExcerpts[key].file);renderCode('cc-method-code',cameraExcerpts[key]);}
  all('[data-cc-method]').forEach(button=>button.addEventListener('click',()=>showMethod(button.dataset.ccMethod)));showMethod('text');
  function showMetric(key){const metric=cameraMetrics[key];if(!metric)return;mark('[data-cc-metric]','ccMetric',key);set('cc-metric-title',metric.title);set('cc-metric-copy',metric.copy);set('cc-metric-unit',metric.unit);
    for(const group of ['lora','pose']){const values=metric[group];
      set('cc-'+group+'-change',metric[group+'Change']);set('cc-'+group+'-interpretation',metric[group+'Interpretation']);set('cc-'+group+'-result-note',metric[group+'Note']);
      const bars=[get('cc-'+group+'-baseline-bar'),get('cc-'+group+'-control-bar')];const container=bars[0].closest('.cc-chart');container.hidden=!values;container.dataset.signed=String(key==='radial');
      if(!values)continue;const max=key==='clip'?1:Math.max(...values.map(Math.abs))*1.12;
      ['baseline','control'].forEach((condition,i)=>{const bar=bars[i];bar.style.width=`${Math.abs(values[i])/max*(key==='radial'?45:100)}%`;bar.dataset.negative=String(values[i]<0);set('cc-'+group+'-'+condition+'-value',values[i].toFixed(metric.decimals));});
    }
  }
  all('[data-cc-metric]').forEach(button=>button.addEventListener('click',()=>showMetric(button.dataset.ccMetric)));showMetric('magnitude');
  const matrix=get('cc-matrix');for(let i=0;i<144;i++){const tile=document.createElement('i');tile.style.animationDelay=(i%12)*.06+'s';matrix.append(tile);}
  function showPatch(key){const after=key==='after';mark('[data-cc-patch]','ccPatch',key);matrix.dataset.patch=key;set('cc-patch-state',after?'SDPA BACKEND':'EXPLICIT SCORES');set('cc-memory-title',after?'Let the backend manage attention.':'A full N × N score matrix.');set('cc-memory-copy',after?'The patch replaces score materialisation and batched matrix multiplication with scaled_dot_product_attention. With a suitable fused backend, the full matrix need not be stored.':'The report records a 2.25 GB allocation request with only 1.7 GB free. Inference stopped with an out-of-memory error.');renderCode('cc-patch-code',cameraExcerpts[after?'patchAfter':'patchBefore']);}
  all('[data-cc-patch]').forEach(button=>button.addEventListener('click',()=>showPatch(button.dataset.ccPatch)));showPatch('before');
  function showBudget(){const budget=Number(get('cc-budget').value);set('cc-budget-value',`${budget} GB`);all('[data-cc-vram]').forEach(card=>{const fits=cameraBudgetFit(budget,Number(card.dataset.ccVram));card.classList.toggle('is-over-budget',!fits);card.querySelector('.cc-fit-status').textContent=fits?'Fits observed peak':'Above this memory budget';});}
  get('cc-budget').addEventListener('input',showBudget);showBudget();

  const scene=get('cc-rig-canvas'),map=get('cc-rig-map'),ctx=scene.getContext('2d'),mapCtx=map.getContext('2d');let movement='panLeft',frame=0,rays=false,rigAnimation=null,rigStart=0;
  const moveInfo={panLeft:['PAN LEFT','The camera stays in place and turns left. The scene shifts right across the image.'],panRight:['PAN RIGHT','The camera stays in place and turns right. The scene shifts left across the image.'],dolly:['MOVE FORWARD','The camera moves into the scene. Near objects grow faster than distant objects, creating parallax.'],orbit:['ORBIT','Position and viewing direction change together as the camera moves around the subject.']};
  function stopRig(){if(rigAnimation!==null)cancelAnimationFrame(rigAnimation);rigAnimation=null;get('cc-rig-play').setAttribute('aria-pressed','false');set('cc-rig-play',frame===15?'↺ Run again':'▶ Run the path');}
  function pathLine(points,color,width=1,fill=null){const projected=points.map(p=>projectCameraPoint(p,cameraPose(movement,frame),scene.width,scene.height));if(projected.some(p=>!p))return;ctx.beginPath();projected.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function box(x,y,z,w,h,d,color,fill){const p=[[x-w/2,y,z-d/2],[x+w/2,y,z-d/2],[x+w/2,y,z+d/2],[x-w/2,y,z+d/2],[x-w/2,y+h,z-d/2],[x+w/2,y+h,z-d/2],[x+w/2,y+h,z+d/2],[x-w/2,y+h,z+d/2]];for(const face of [[0,1,5,4],[1,2,6,5],[4,5,6,7]])pathLine(face.map(i=>p[i]),color,1.2,fill);pathLine([p[0],p[3],p[7],p[4]],color,.6);}
  function drawScene(){if(!ctx)return;ctx.clearRect(0,0,scene.width,scene.height);const pose=cameraPose(movement,frame);
    for(let z=-2;z<=8;z++)pathLine([[-6,0,z],[6,0,z]],'#75865e55',.7);for(let x=-6;x<=6;x++)pathLine([[x,0,-2],[x,0,8]],'#75865e44',.7);
    pathLine([[-4,0,6],[-4,4.5,6],[4,4.5,6],[4,0,6]],'#70885c88',1,'#71865806');pathLine([[-4,3.8,6],[4,3.8,6]],'#849f6b66',.7);pathLine([[-3,0,6],[-3,4.5,6]],'#849f6b44',.7);pathLine([[3,0,6],[3,4.5,6]],'#849f6b44',.7);
    box(-2.3,0,3.6,.7,2.6,.7,'#8ea770','#72875414');box(2.6,0,4.7,.75,3.2,.75,'#8da56b','#75875515');box(0,0,.8,2.5,.8,1.6,'#b1b195','#bbc2a518');box(0,.8,.8,1.05,.12,.9,'#d5b879','#dcc07818');
    const centre=[0,1.5,.8];for(let ring=0;ring<9;ring++){const phi=-Math.PI/2+(ring+1)*Math.PI/10;const radius=Math.cos(phi)*.65;pathLine(Array.from({length:49},(_,i)=>{const angle=i/48*Math.PI*2;return [centre[0]+Math.cos(angle)*radius,centre[1]+Math.sin(phi)*.65,centre[2]+Math.sin(angle)*radius]}),'#e2be7b',1);}
    for(let meridian=0;meridian<10;meridian++){const angle=meridian/10*Math.PI*2;pathLine(Array.from({length:33},(_,i)=>{const phi=-Math.PI/2+i/32*Math.PI;return [Math.cos(phi)*Math.cos(angle)*.65,1.5+Math.sin(phi)*.65,.8+Math.cos(phi)*Math.sin(angle)*.65]}),'#d0ad6c88',.8);}
    box(-2,0,-1.2,.8,.45,.8,'#b3c290','#8caa5840');pathLine([[-2,.45,-1.2],[-2,1.65,-1.2]],'#9cbd6c',2);for(let i=0;i<7;i++){const angle=i*2.4;pathLine([[-2,.6+i*.12,-1.2],[-2+Math.cos(angle)*.5,1+i*.12,-1.2+Math.sin(angle)*.45]],'#a9c784',2.5);}
    if(rays){ctx.setLineDash([6,8]);for(const corner of [[40,60],[960,60],[960,600],[40,600]]){ctx.beginPath();ctx.moveTo(500,330);ctx.lineTo(...corner);ctx.strokeStyle='#e8ad5544';ctx.stroke();}ctx.setLineDash([]);ctx.font='11px monospace';ctx.fillStyle='#d8bb83';ctx.fillText('PER-PIXEL RAYS / (o × d, d)',35,625);}
    const target=projectCameraPoint([0,1.5,.8],pose,scene.width,scene.height);if(target){ctx.strokeStyle='#edcb8999';ctx.lineWidth=1;ctx.strokeRect(target.x-12,target.y-12,24,24);}
  }
  function drawMap(){if(!mapCtx)return;const c=mapCtx,W=map.width,H=map.height;const p=(x,z)=>[W/2+x*24,H-65-z*22-132];c.clearRect(0,0,W,H);c.strokeStyle='#74865c55';c.lineWidth=1;
    for(let x=-6;x<=6;x++){c.beginPath();c.moveTo(...p(x,-7));c.lineTo(...p(x,6));c.stroke();}for(let z=-7;z<=6;z++){c.beginPath();c.moveTo(...p(-6,z));c.lineTo(...p(6,z));c.stroke();}
    // The map is oriented with forward at the top, opposite screen-coordinate y.
    const screen=(x,z)=>[W/2+x*24,H-65-z*22-132];
    const path=Array.from({length:16},(_,i)=>cameraPose(movement,i));c.strokeStyle='#e8ad5577';c.setLineDash([4,5]);c.beginPath();path.forEach((pose,i)=>i?c.lineTo(...screen(pose.x,pose.z)):c.moveTo(...screen(pose.x,pose.z)));c.stroke();c.setLineDash([]);
    path.forEach((pose,i)=>{c.beginPath();c.arc(...screen(pose.x,pose.z),i===frame?4:1.5,0,Math.PI*2);c.fillStyle=i<=frame?'#d4b875':'#78825b';c.fill();});
    const pose=cameraPose(movement,frame),origin=screen(pose.x,pose.z);const left=screen(pose.x+Math.sin(pose.yaw-.3)*5,pose.z+Math.cos(pose.yaw-.3)*5),right=screen(pose.x+Math.sin(pose.yaw+.3)*5,pose.z+Math.cos(pose.yaw+.3)*5);
    c.beginPath();c.moveTo(...origin);c.lineTo(...left);c.lineTo(...right);c.closePath();c.fillStyle='#e8ad5516';c.fill();c.strokeStyle='#d8b877';c.stroke();c.beginPath();c.arc(...screen(0,.8),10,0,Math.PI*2);c.fillStyle='#9fa97a';c.fill();c.font='10px monospace';c.fillStyle='#b4bfa0';c.fillText('SUBJECT',screen(0,.8)[0]+17,screen(0,.8)[1]+3);
    if(rays){c.strokeStyle='#e8ad554a';[-1.4,0,1.4].forEach(x=>{c.beginPath();c.moveTo(...origin);c.lineTo(...screen(x,3));c.stroke();});}
  }
  function drawRig(){const pose=cameraPose(movement,frame);get('cc-rig-frame').value=frame;set('cc-rig-position',`${String(frame+1).padStart(2,'0')} / 16`);set('cc-rig-x',pose.x.toFixed(2));set('cc-rig-z',pose.z.toFixed(2));set('cc-rig-yaw',`${pose.yaw>=0?'+':''}${(pose.yaw*180/Math.PI).toFixed(1)}°`);set('cc-rig-motion',moveInfo[movement][0]);set('cc-rig-copy',moveInfo[movement][1]);scene.setAttribute('aria-label',`${moveInfo[movement][0].toLowerCase()}, frame ${frame+1} of 16. ${moveInfo[movement][1]}`);drawScene();drawMap();}
  all('[data-cc-move]').forEach(button=>button.addEventListener('click',()=>{stopRig();movement=button.dataset.ccMove;frame=0;mark('[data-cc-move]','ccMove',movement);drawRig();set('cc-rig-play','▶ Run the path');}));
  get('cc-rig-frame').addEventListener('input',()=>{stopRig();frame=Number(get('cc-rig-frame').value);drawRig();});get('cc-rig-rays').addEventListener('click',()=>{rays=!rays;get('cc-rig-rays').setAttribute('aria-pressed',String(rays));drawRig();});
  get('cc-rig-play').addEventListener('click',()=>{
    if(rigAnimation!==null){stopRig();return;}if(globallyPaused())return;
    if(reduced.matches){frame=(frame+1)%16;drawRig();return;}
    if(frame===15)frame=0;rigStart=performance.now()-frame/15*4500;get('cc-rig-play').setAttribute('aria-pressed','true');set('cc-rig-play','Ⅱ Pause the path');
    const tick=now=>{if(document.hidden||root.closest('[hidden]')||globallyPaused()){stopRig();return;}frame=Math.min(15,Math.floor((now-rigStart)/4500*15));drawRig();if(frame===15){stopRig();return;}rigAnimation=requestAnimationFrame(tick);};rigAnimation=requestAnimationFrame(tick);
  });drawRig();
  function pauseMotion(){pausePair();stopRig();}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseMotion();});window.addEventListener('hashchange',pauseMotion);reduced.addEventListener('change',pauseMotion);
  new MutationObserver(()=>{if(globallyPaused())pauseMotion();}).observe(document.documentElement,{attributes:true,attributeFilter:['class'],subtree:true});
}
if(typeof document!=='undefined')startCameraLab(document.querySelector('.cc-native'));

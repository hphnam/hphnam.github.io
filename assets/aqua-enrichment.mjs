export const aquaObjections=[
 {belief:'Summer is covered. Winter is covered. Why buy another thing?',tag:'Two seasons / Separate solutions',response:'One unit, useful all year.',reason:'Reframe the category from another appliance to a single heating-and-cooling solution. The value is in what one purchase can do across the year.'},
 {belief:'A heater feels affordable. An air conditioner feels like a much bigger purchase.',tag:'Upfront price / Perceived value',response:'Change what the price is being compared with.',reason:'The strategy compares one dual-mode unit with the set of heating and cooling items a household already uses. “Mua 1 được 2” gives that larger purchase a familiar value language.'},
 {belief:'Surely a small heater costs less to run?',tag:'Running cost / Perceived efficiency',response:'Talk about the job, not just the device.',reason:'The messaging shifts the discussion to heating the room, seasonal utility, and product efficiency. Social posts and creator videos give those benefits a concrete setting, without a standalone technical specification sheet.'}
];
export const aquaBenefits=[
 {date:'Product story / Savings',title:'Make the investment feel useful for longer.',copy:'The savings story compares a seasonal heating purchase with a unit used across the year. The post connects the message to airflow and durability.',proof:'Campaign reasons to believe: Triple Airflow and anti-corrosion components.',image:'facebook-benefit-0.jpg',label:'Savings',post:'pfbid02LZTDWZgc5Y8fKb7MnUK5XrEcV9VABc6Ngq49dzT9YyxeVV1YAWikMQbKCh9XczWrl'},
 {date:'Product story / Performance',title:'One unit, more ways to use it.',copy:'The performance pillar translates year-round utility into everyday convenience: Heat, Dry, Cool, and Fan modes, supported by quick heating and room-wide airflow messages.',proof:'Campaign reasons to believe: four modes, Triple Airflow, and Turbo.',image:'facebook-benefit-1.jpg',label:'Performance / Convenience',post:'pfbid086NdRvUxn2Lo67h8wpkXft8rCYgBwWr3fJtHnatnGkEBuE6szjPPgGPmzNK3U7hfl'},
 {date:'Product story / Comfort',title:'Sell how the room feels.',copy:'The comfort message shifts from a small pocket of heat to warmth across the room. The artwork expresses the contrast between harsh local heat and a more comfortable home.',proof:'Campaign reasons to believe: Triple Airflow distribution and Turbo heating.',image:'facebook-benefit-3.jpg',label:'Comfort',post:'pfbid02vQBDGunCjhBgNERNKoJY2UXndvAwMhCMhk6DzTQgEE88xUkdBMV8kbjBLCfJCzzNl'},
 {date:'Product story / Trust',title:'Give the bigger purchase reassurance.',copy:'The trust pillar addresses quality and aftercare. The post uses origin, durable components, and a two-year replacement-warranty message to support the purchase.',proof:'Campaign reasons to believe: Thai manufacture, Bluefin protection, and warranty messaging.',image:'facebook-benefit-2.jpg',label:'Trust / Durability',post:'pfbid0KsNeveEae3WVQAnAk2cou1rzH4WqdRyaMD531BkbPZDhMUGN5e4tkBm6h4Au75Hml'}
];
export function startAquaEnrichment(root){
 if(!root||root.dataset.enrichmentReady)return;root.dataset.enrichmentReady='true';
 const put=(name,value)=>{const el=root.querySelector('[data-aqua-'+name+']');if(el)el.textContent=value;};
 function bind(name,render){const buttons=[...root.querySelectorAll('[data-aqua-'+name+']')];buttons.forEach((b,i)=>b.addEventListener('click',()=>{buttons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render(i);}));}
 bind('objection',i=>{const o=aquaObjections[i];put('belief',o.belief);put('belief-tag',o.tag);put('response',o.response);put('reason',o.reason);});
 bind('benefit',i=>{const b=aquaBenefits[i],image=root.querySelector('[data-aqua-benefit-image]');image.src='assets/aqua-heatpump/'+b.image;image.alt='Original AQUA '+b.label+' post';for(const k of ['date','title','copy','proof'])put('benefit-'+k,b[k]);root.querySelector('[data-aqua-benefit-link]').href='https://www.facebook.com/aquavietnam/posts/'+b.post;root.querySelector('[data-aqua-benefit-zoom]').dataset.evidenceCaption=b.label+' post, original AQUA Facebook artwork.';});
 const video=root.querySelector('[data-aqua-template-video]'),button=root.querySelector('[data-aqua-template-play]');
 const sync=()=>{button.textContent=video.paused?'▶ Play the template':'Ⅱ Pause the template';button.setAttribute('aria-label',video.paused?'Play the original AQUA CapCut template':'Pause the AQUA CapCut template');};
 button.addEventListener('click',()=>{if(video.paused){video.play()?.catch(()=>{video.controls=true;sync();});}else video.pause();});
 for(const e of ['play','pause','ended'])video.addEventListener(e,sync);
 root.ownerDocument.defaultView.addEventListener('hashchange',()=>{if(root.closest('[data-route]')?.hidden)video.pause();});
 root.ownerDocument.addEventListener('visibilitychange',()=>{if(root.ownerDocument.hidden)video.pause();});
 sync();
}
if(typeof document!=='undefined')document.querySelectorAll('[data-aqua-case]').forEach(startAquaEnrichment);

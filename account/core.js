/* Account Intelligence 2: pure capture/model/calculation layer. No DOM or storage. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.TowerAccountCore=api;})(globalThis,()=>{
 'use strict';
 const VERSION='2026-10-22.1';
 const SOURCE='https://github.com/TmRxJD/TheTowerSDK/blob/6a6d3bc9101d68ad65b355122c6fe66af0a4610f/src/data/labs/catalog.data.ts';
 const STACK_SOURCE='https://the-tower-idle-tower-defense.fandom.com/wiki/Relics';
 const RULES={
  'lab.speed':{effect:'lab_speed',base:1,step:.02,unit:'factor'},
  'lab.attack_speed':{effect:'attack_speed',base:1,step:.02,unit:'factor'},
  'lab.coins_kill':{effect:'coins_per_kill',base:1,step:.02,unit:'factor'},
  'lab.critical_factor':{effect:'critical_factor',base:1,step:.03,unit:'factor'},
  'lab.damage':{effect:'damage',base:1,step:.02,unit:'factor'},
  'lab.health':{effect:'health',base:1,step:.03,unit:'factor'},
  'lab.orbs_speed':{effect:'orb_speed',base:0,step:.1,unit:'flat'}
 };
 const LABELS={lab_speed:'Lab Speed',attack_speed:'Attack Speed',coins_per_kill:'Coins / Kill',coins:'Coins',critical_factor:'Critical Factor',damage:'Damage',health:'Health',orb_speed:'Orb Speed'};
 const ALIASES={'lab.orbs_speed':['Orb Speed'],'lab.death_wave_health':['DW Health'],'lab.speed':['Labs Speed','Forschungsgeschwindigkeit'],'lab.critical_factor':['Crit Factor']};
 const confirmed=e=>e.valueType!=='observed'&&e.valueType!=='estimated'&&e.sourceType!=='ocr-unconfirmed'&&e.confirmationStatus!=='pending';
 const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const stamp=e=>e.effectiveAt||e.updatedAt;
 function current(entries,at=Infinity){const map=new Map();for(const e of entries){const time=Date.parse(stamp(e));if(!confirmed(e)||!Number.isFinite(time)||time>at)continue;const key=e.category+'|'+(e.knowledgeId||norm(e.name));const old=map.get(key);if(!old||time>Date.parse(stamp(old))||time===Date.parse(stamp(old))&&String(e.id)>String(old.id))map.set(key,e);}return [...map.values()];}
 function catalogue(catalog,category){return catalog.filter(k=>k.category===category).map(k=>({...k,aliases:[...(k.aliases||[]),...(ALIASES[k.id]||[])]}));}
 function matching(text,catalog){const options=[];for(const k of catalog)for(const label of [k.name,...k.aliases||[]]){const escaped=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const m=new RegExp('(^|[^a-z])('+escaped+')(?![a-z])','i').exec(text);if(m)options.push({k,index:m.index+m[1].length,end:m.index+m[0].length,label});}return options.sort((a,b)=>b.label.length-a.label.length)[0];}
 function parse(text,category,catalog){
  const lines=String(text).split(/\r?\n/).map(x=>x.trim()).filter(Boolean),known=catalogue(catalog,category),anchors=[];
  for(let i=0;i<lines.length;i++){let found=matching(lines[i],known);if(!found&&i+1<lines.length){const both=matching(lines[i]+' '+lines[i+1],known);if(both&&both.end>lines[i].length)found=both;}if(found)anchors.push({...found,i});}
  const proposals=[];
  for(let a=0;a<anchors.length;a++){
   const row=anchors[a],end=Math.min(anchors[a+1]?.i??lines.length,row.i+5),region=lines.slice(row.i,end).join(' '),tail=region.slice(row.end),explicit=tail.match(/\b(?:lv[l]?|level|stufe)\.?\s*[:#]?\s*(\d{1,3})(?:\s*\/\s*(\d{1,3}))?/i);
   const running=/\b(?:rush|researching|remaining|in progress|erforscht gerade|verbleibend)\b/i.test(region),locked=/\b(?:locked|not owned|unowned|gesperrt|nicht im besitz)\b/i.test(region);
   const effect=tail.match(/(?:x|×)\s*\d+(?:[.,]\d+)?|[+]\s*\d+(?:[.,]\d+)?\s*%?|\d+(?:[.,]\d+)\s*%/i)?.[0]||'';
   if(category==='Labs'&&!explicit&&!effect)continue;
   proposals.push({knowledgeId:row.k.id,name:row.k.name,category,level:explicit&&!running?Number(explicit[1]):null,targetLevel:explicit&&running?Number(explicit[1]):null,maxLevel:row.k.maxLevel??null,visibleMax:explicit?.[2]?Number(explicit[2]):null,effectRaw:effect,researchStatus:running?'running':/\bmax(?:ed)?\b/i.test(region)?'max':'unknown',owned:category==='Relics'?locked?false:null:undefined,sourceText:region.slice(0,500),confirmationStatus:'pending'});
  }
  return proposals;
 }
 function recognize(recognized,category,catalog){
  const map=new Map();
  for(const pass of recognized.passes||[]){
   const texts=[pass.text||''];
   // Column-local reading avoids pairing the next column's price/level with a name.
   if(pass.words?.length&&recognized.prepared?.width){const width=recognized.prepared.width*(pass.scale||1)/(recognized.prepared.scale||1);for(let col=0;col<2;col++){const words=pass.words.filter(w=>w.bbox&&w.bbox.x0>=col*width/2&&w.bbox.x0<(col+1)*width/2).sort((a,b)=>a.bbox.y0-b.bbox.y0);const groups=[];for(const w of words){const cy=(w.bbox.y0+w.bbox.y1)/2,h=w.bbox.y1-w.bbox.y0;let g=groups.find(g=>Math.abs(g.y-cy)<Math.max(h,g.h)*.55);if(!g){g={y:cy,h,words:[]};groups.push(g);}g.words.push(w);}texts.push(groups.sort((a,b)=>a.y-b.y).map(g=>g.words.sort((a,b)=>a.bbox.x0-b.bbox.x0).map(w=>w.text).join(' ')).join('\n'));}}
   for(const text of texts)for(const p of parse(text,category,catalog)){const old=map.get(p.knowledgeId);if(!old)map.set(p.knowledgeId,p);else{if(p.level!==null&&old.level===null&&!old.targetLevel)Object.assign(old,p);else if(p.level!==null&&old.level!==null&&p.level!==old.level){old.alternatives=[...new Set([...(old.alternatives||[]),old.level,p.level])];old.level=null;old.ambiguous=true;}if(old.ambiguous)old.level=null;}}
  }
  return [...map.values()];
 }
 function number(raw){const m=String(raw||'').trim().match(/^(?:x|×|\+)?\s*(\d+(?:[.,]\d+)?)\s*(%)?$/i);return m?{value:Number(m[1].replace(',','.')),percent:!!m[2]}:null;}
 function prepare(rows,{catalog,entries,playerId,at,makeId,source='ocr-reviewed'}){
  if(!Number.isFinite(Date.parse(at)))throw Error('Ungültiges Erfassungsdatum.');
  const seen=new Set(),prepared=[],previous=current(entries.filter(e=>e.playerId===playerId));
  for(const row of rows){const k=catalog.find(k=>k.id===row.knowledgeId&&k.category===row.category);if(!k||!['Labs','Relics'].includes(k.category))throw Error('Unbekannter Spieleintrag.');if(seen.has(k.id))throw Error('Doppelter Eintrag in dieser Bestätigung.');seen.add(k.id);
   let value;if(k.category==='Labs'){if(row.level===null||row.level===''||!Number.isInteger(Number(row.level))||Number(row.level)<0||Number(row.level)>(k.maxLevel??999))throw Error(k.name+': aktuelles ganzzahliges Level am Original prüfen.');value=String(Number(row.level));}else{if(typeof row.owned!=='boolean')throw Error(k.name+': Besitz ausdrücklich wählen.');value=row.owned?'owned':'not-owned';}
   const effectRaw=String(row.effectRaw||'').trim();if(effectRaw&&!number(effectRaw))throw Error(k.name+': Effekt als x1.20, +2.00 oder 2% eintragen.');
   const old=previous.find(e=>e.knowledgeId===k.id);if(old&&old.value===value&&String(old.confirmedEffect||'')===effectRaw&&String(old.researchStatus||'unknown')===String(row.researchStatus||'unknown'))continue;
   if(k.category==='Labs'&&old&&/^\d+$/.test(old.value)&&Number(value)<Number(old.value)&&!row.allowDecrease)throw Error(k.name+': niedrigeres Level benötigt ausdrückliche Korrekturfreigabe.');
   prepared.push({id:makeId(),playerId,category:k.category,knowledgeId:k.id,name:k.name,value,valueType:'confirmed',confirmationStatus:'confirmed',schemaVersion:2,confirmedEffect:effectRaw,researchStatus:row.researchStatus||'unknown',researchTargetLevel:row.targetLevel??null,sourceType:source,evidence:row.sourceText||'Am Original geprüft',capturedAt:at,updatedAt:at,effectiveAt:at,previousEntryId:old?.id||null,knowledgeVersion:VERSION});
  }return prepared;
 }
 function calculate(entries,catalog,at=Infinity){
  const selected=current(entries,at),contributions=[],unknown=[],issues=[],groups=new Map();
  for(const e of selected){const k=catalog.find(k=>k.id===e.knowledgeId);if(!k){unknown.push({entry:e,reason:'Kein zugeordnetes Regelwissen'});continue;}
   if(e.category==='Labs'){const rule=RULES[k.id],level=Number(e.value);if(!/^\d+$/.test(String(e.value))||level>(k.maxLevel??999)){issues.push({entry:e,reason:'Ungültiges bestätigtes Level'});continue;}if(!rule){unknown.push({entry:e,reason:'Level bekannt; Wirkungsformel noch nicht verifiziert'});continue;}
    const value=Number((rule.base+rule.step*level).toFixed(9)),visible=number(e.confirmedEffect);if(visible&&(visible.percent||Math.abs(visible.value-value)>.011)){issues.push({entry:e,reason:'Bestätigter sichtbarer Effekt widerspricht Level/Formel'});continue;}
    contributions.push({entry:e,effect:rule.effect,value,operation:rule.unit==='flat'?'lab-add':'lab-factor',source:SOURCE,rule:rule.base+' + '+rule.step+' × '+level});
   }else if(e.category==='Relics'){
    if(/^(?:not-owned|no|false|0|nicht)/i.test(e.value))continue;
    if(!/^(?:owned|yes|true|1|ja|besitz|vorhanden)$/i.test(e.value)){unknown.push({entry:e,reason:'Besitzangabe nicht eindeutig'});continue;}
    const effect=Object.keys(LABELS).find(id=>norm(LABELS[id])===norm(k.bonusType)||id==='critical_factor'&&norm(k.bonusType)==='critfactor');const bonus=number(k.bonusValue);
    if(!effect||!bonus?.percent){unknown.push({entry:e,reason:'Bonusart oder Rechenregel noch nicht unterstützt'});continue;}
    const visible=number(e.confirmedEffect);if(visible&&(!visible.percent||Math.abs(visible.value-bonus.value)>.001)){issues.push({entry:e,reason:'Relic-Bonus widerspricht versionierter Quelle'});continue;}
    contributions.push({entry:e,effect,value:bonus.value/100,operation:'relic-sum',source:'https://github.com/TmRxJD/TheTowerSDK/blob/6a6d3bc9101d68ad65b355122c6fe66af0a4610f/src/data/relics/data.ts',rule:k.bonusValue+' · Relics gleicher Art addieren'});
   }else unknown.push({entry:e,reason:'System außerhalb der integrierten Bonusberechnung'});
  }
  for(const c of contributions){if(!groups.has(c.effect))groups.set(c.effect,[]);groups.get(c.effect).push(c);}
  const effects=[...groups].map(([effect,parts])=>{const relicPercent=parts.filter(p=>p.operation==='relic-sum').reduce((s,p)=>s+p.value,0),lab=parts.find(p=>p.operation==='lab-factor'),flat=parts.find(p=>p.operation==='lab-add');let value=null,expression;
   if(effect==='orb_speed'){expression='Lab-Zuschlag '+(flat?.value??'?')+'; Relics +'+Number((relicPercent*100).toFixed(4))+'%. Workshop-Grundwert und weitere Einflüsse fehlen.';}
   else {value=Number(((lab?.value??1)*(1+relicPercent)).toFixed(9));expression=(lab?lab.value:'1')+' × (1 + '+Number(relicPercent.toFixed(6))+')';}
   return {effect,label:LABELS[effect],parts,value,expression,complete:false,scope:'Bekannter Teilbonus; kein vollständiger Kampf-Endwert',stackSource:STACK_SOURCE};});
  return {version:VERSION,selected,contributions,effects,unknown,issues};
 }
 return {VERSION,SOURCE,STACK_SOURCE,RULES,LABELS,ALIASES,current,confirmed,parse,recognize,prepare,calculate,number};
});

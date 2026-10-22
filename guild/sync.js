(function(root){
 'use strict';
 function stable(value){if(Array.isArray(value))return '['+value.map(stable).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).filter(k=>value[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';return JSON.stringify(value);}
 async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(typeof value==='string'?value:stable(value)));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
 function canonical(text){return String(text||'').replace(/\r\n?/g,'\n').split('\n').map(s=>s.trim().replace(/\s+/g,' ')).filter(Boolean).join('\n');}
 async function key(store,row){return store==='runs'&&row.recordType!=='history-observation'&&row.rawText?'report:'+await digest(canonical(row.rawText)):store+':'+row.id;}
 function equivalent(a,b){return stable(a)===stable(b);}
 // Three-way merge. An absent baseline never authorizes replacing either original.
 function decision(local,remote,base){
  if(!remote)return local?'push':'none';
  if(!local)return base?(remote.deleted?'none':equivalent(remote.data,base.data)?'delete':'conflict'):(remote.deleted?'none':'pull');
  if(remote.deleted)return base&&equivalent(local,base.data)?'remove':'conflict';
  if(equivalent(local,remote.data))return 'same';
  if(!base)return 'conflict';
  const lc=!equivalent(local,base.data),rc=!equivalent(remote.data,base.data);
  return lc&&rc?'conflict':lc?'push':rc?'pull':'same';
 }
 async function synchronize({local,remote,manifest,saveManifest,putLocal,removeLocal,writeRemote,guard}){
  const localMap=new Map();for(const item of local){const k=await key(item.store,item.data);if(localMap.has(k)&&!equivalent(localMap.get(k).data,item.data))throw Error('localDuplicate');localMap.set(k,item);}
  const remoteMap=new Map(remote.map(row=>[row.key,row]));
  const keys=new Set([...localMap.keys(),...remoteMap.keys(),...Object.keys(manifest.base)]);
  const result={pushed:0,pulled:0,conflicts:0};
  for(const k of keys){guard();const l=localMap.get(k),r=remoteMap.get(k),base=manifest.base[k],action=decision(l?.data,r,base);
   if(action==='conflict'){manifest.conflicts[k]={store:l?.store||r?.store||base?.store,local:l?.data??null,remote:r??null};result.conflicts++;await saveManifest(manifest);continue;}
   let next=r;
   if(action==='push'||action==='delete'){
    next=await writeRemote({key:k,store:l?.store||r?.store||base.store,data:l?.data||base.data,deleted:action==='delete'},r?.revision??null);guard();result.pushed++;
   }else if(action==='pull'){await putLocal(r.store,r.data);guard();result.pulled++;}
   else if(action==='remove'){await removeLocal(l.store,l.data.id);guard();result.pulled++;}
   if(next){manifest.base[k]={data:next.data,revision:next.revision,store:next.store,deleted:next.deleted};delete manifest.conflicts[k];await saveManifest(manifest);}
  }
  return result;
 }
 const api={stable,digest,key,decision,synchronize,canonical,equivalent};root.TowerSync=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

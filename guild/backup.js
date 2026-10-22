(function(root){
 'use strict';
 const stores=['runs','profiles','accountEntries'];
 function validate(data){
  if(data?.format!=='tower-guild-full-backup'||data.schemaVersion!==1)throw Error('Invalid full backup');
  for(const store of stores){if(!Array.isArray(data[store])||data[store].length>50000)throw Error('Invalid backup store');const seen=new Set();for(const row of data[store]){
   if(!row||typeof row.id!=='string'||!row.id||row.id.length>300||seen.has(row.id)||(row.recordType==='guild-sync'||row.id==='__guild_sync__'))throw Error('Invalid or duplicate backup ID');seen.add(row.id);
   if(store==='runs'&&(typeof row.playerId!=='string'||row.recordType!=='history-observation'&&typeof row.rawText!=='string'))throw Error('Invalid run');
   if(store==='profiles'&&!row.recordType&&(typeof row.name!=='string'||row.name.length>60))throw Error('Invalid profile');
   if(store==='accountEntries'&&(typeof row.playerId!=='string'||typeof row.name!=='string'||typeof row.value!=='string'))throw Error('Invalid account entry');
  }}
  const profiles=new Set(data.profiles.filter(p=>!p.recordType).map(p=>p.id));for(const store of ['runs','accountEntries'])if(data[store].some(r=>!profiles.has(r.playerId)))throw Error('Unknown profile');
  return data;
 }
 async function restore(db,source){const data=validate(source);return new Promise((ok,no)=>{const tx=db.transaction(stores,'readwrite');let added=0;for(const store of stores){const object=tx.objectStore(store),request=object.getAllKeys();request.onsuccess=()=>{const ids=new Set(request.result);for(const row of data[store])if(!ids.has(row.id)){object.add(row);added++;}};}tx.oncomplete=()=>ok(added);tx.onabort=()=>no(tx.error||Error('Restore aborted'));tx.onerror=()=>no(tx.error);});}
 const api={validate,restore};root.TowerBackup=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

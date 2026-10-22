(function(root){
 'use strict';
 const I=root.TowerI18n,S=root.TowerSync,t=k=>I.t(k);
 let client=null,session=null,owner=null,bridge=null,scope='legacy',busy=false,status='',manifest={base:{},conflicts:{}},backupReady=false;
 const stores=['profiles','runs','accountEntries'];
 const read=(db,store)=>new Promise((ok,no)=>{const tx=db.transaction(store),req=tx.objectStore(store).getAll();req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error);});
 const write=(db,store,data)=>new Promise((ok,no)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(data);tx.oncomplete=ok;tx.onerror=()=>no(tx.error);tx.onabort=()=>no(tx.error||Error('changed'));});
 const erase=(db,store,id)=>new Promise((ok,no)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(id);tx.oncomplete=ok;tx.onerror=()=>no(tx.error);});
 function get(key){try{return localStorage.getItem(key);}catch{return null;}}
 function set(key,value){localStorage.setItem(key,value);}
 function mask(){document.querySelector('#view')?.replaceChildren();bridge?.clear();}
 function scopeChange(id){mask();set('tower-guild-mode','isolated');if(id)set('tower-guild-owner',id);else localStorage.removeItem('tower-guild-owner');location.reload();}
 function errorMessage(e){if(['cloudConfig','backupRequired','sessionExpired','changed','localDuplicate'].includes(e?.message))return t(e.message);if(e?.status===401||e?.code==='PGRST301')return t('sessionExpired');if(e?.name==='TypeError'||e?.name==='TimeoutError')return t('network');return t('cloudError');}
 async function perform(fn){if(busy||locked())return;busy=true;status=t('busy');render();try{await fn();}catch(e){status=errorMessage(e);}finally{busy=false;render();}}
 async function init(){
  try{client=await root.TowerCloud.create(root.TOWER_CLOUD_CONFIG);}catch(e){status=errorMessage(e);}
  if(client){
   const {data,error}=await client.auth.getSession();session=data?.session||null;
   if(error)status=errorMessage(error);
   owner=session?.user?.id||(!navigator.onLine?get('tower-guild-owner'):null);
   if(owner){scope='account';set('tower-guild-mode','isolated');set('tower-guild-owner',owner);}
   client.auth.onAuthStateChange((event,next)=>{
    // Do not await Supabase calls inside its auth lock.
    const nextId=next?.user?.id||null;
    if(event==='INITIAL_SESSION'&&!nextId&&!navigator.onLine)return;
    if(nextId!==owner){scopeChange(nextId);return;}
    session=next;queueMicrotask(render);
   });
  }
  if(!client&&!navigator.onLine&&/^[0-9a-f-]{36}$/.test(get('tower-guild-owner')||'')){owner=get('tower-guild-owner');scope='account';}
  if(!owner&&get('tower-guild-mode')==='isolated')scope='guest';
  root.addEventListener('storage',event=>{if(event.key==='tower-guild-mode'||event.key==='tower-guild-owner'||event.key?.startsWith('tower-guild-auth-')){mask();location.reload();}});
  root.addEventListener('online',()=>{status='';render();});root.addEventListener('offline',render);
  return databaseName();
 }
 function databaseName(){return scope==='legacy'?'tower-analytics-alpha':scope==='account'?'tower-analytics-guild-'+owner:'tower-analytics-guild-signed-out';}
 function bind(appBridge){bridge=appBridge;render();}
 function escape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 function button(id,key){return '<button class="button" id="'+id+'" '+(busy?'disabled':'')+'>'+t(key)+'</button>';}
 function render(){
  if(!bridge)return;let panel=document.querySelector('#guild-panel');if(!panel){panel=document.createElement('section');panel.id='guild-panel';panel.className='card section';document.querySelector('#topnav').before(panel);}
  const signed=!!owner;const text=t(scope==='legacy'?'local':scope==='account'?'cloud':'guest');
  const wasOpen=panel.querySelector('details')?.open||!get('tower-language');
  panel.innerHTML='<details '+(wasOpen?'open':'')+'><summary>'+t('guild')+' · '+escape(text)+'</summary><label for="guild-language">'+t('language')+'</label><select id="guild-language"><option value="de">Deutsch</option><option value="en">English</option></select><p class="small">'+t(navigator.onLine?'online':'offline')+'</p>'+(client?(signed?'<p data-user-content>'+escape(session?.user?.email||owner)+'</p><div class="buttonrow">'+button('guild-logout','logout')+button('guild-sync','sync')+button('guild-migration','migrate')+'</div><label for="guild-name">'+t('profile')+'</label><input id="guild-name" maxlength="60" autocomplete="nickname"><div class="buttonrow">'+button('guild-profile','saveProfile')+'</div>':'<form id="guild-login"><label for="guild-email">'+t('email')+'</label><input id="guild-email" type="email" autocomplete="email" required><label class="review-check"><input id="guild-register" type="checkbox">'+t('register')+'</label><button class="button primary" '+(busy?'disabled':'')+'>'+t('send')+'</button></form>'):'<p>'+t('notConfigured')+'</p>')+'<div class="buttonrow">'+button('guild-backup','backup')+(scope==='guest'?button('guild-local','openLocal'):'')+'</div><label for="guild-restore">'+(I.language==='de'?'Vollständiges Backup wiederherstellen':'Restore full backup')+'</label><input id="guild-restore" type="file" accept=".json,application/json"><div id="guild-migration-area"></div><p id="guild-status" role="status" aria-live="polite">'+escape(status)+'</p>'+(Object.keys(manifest.conflicts).length?'<div class="notice warn">'+t('conflicts')+' '+Object.keys(manifest.conflicts).length+'</div>'+button('guild-conflicts','exportConflicts'):'')+'</details>';
  panel.querySelector('#guild-language').value=I.language;
  panel.querySelector('#guild-language').onchange=async e=>{if(busy||locked())return;const language=e.target.value;I.set(language);if(scope==='account')await write(bridge.db(),'profiles',{id:'__guild_settings__',recordType:'guild-settings',language});bridge.render();render();};
  const on=(id,fn)=>{const e=panel.querySelector('#'+id);if(e)e.onclick=()=>perform(fn);};
  on('guild-logout',async()=>{mask();scope='guest';owner=null;set('tower-guild-mode','isolated');localStorage.removeItem('tower-guild-owner');try{await client.auth.signOut({scope:'local'});}finally{location.reload();}});
  const form=panel.querySelector('#guild-login');if(form)form.onsubmit=e=>{e.preventDefault();const email=panel.querySelector('#guild-email').value,create=panel.querySelector('#guild-register').checked;perform(async()=>{const redirect=new URL(location.href);redirect.search='';redirect.hash='';const {error}=await client.auth.signInWithOtp({email,options:{shouldCreateUser:create,emailRedirectTo:redirect.href}});if(error)throw error;status=t('sent');});};
  on('guild-sync',sync);const migration=panel.querySelector('#guild-migration');if(migration)migration.onclick=()=>showMigration().catch(e=>{status=errorMessage(e);render();});
  on('guild-backup',async()=>{await exportDatabase(bridge.db());status='';});
  panel.querySelector('#guild-restore').onchange=e=>{const file=e.target.files?.[0];if(!file)return;perform(async()=>{if(file.size>30*1024*1024)throw Error('cloudError');const data=root.TowerBackup.validate(JSON.parse(await file.text()));if(!confirm(I.language==='de'?'Backup ausdrücklich in den aktuellen Speicher übernehmen? Vorhandene IDs bleiben unverändert.':'Explicitly restore into the current workspace? Existing IDs are preserved.'))return;const count=await root.TowerBackup.restore(bridge.db(),data);await bridge.reloadProfiles();await bridge.refresh();status=String(count)+' '+t('saved');});};
  on('guild-local',async()=>{if(confirm(t('localConsent'))){set('tower-guild-mode','legacy');scope='legacy';location.reload();}});
  on('guild-conflicts',async()=>bridge.download('tower-guild-conflicts.json',JSON.stringify(manifest.conflicts,null,2)));
  const name=panel.querySelector('#guild-name');on('guild-profile',async()=>{const value=name.value.trim();if(!value||value.length>60)throw Error('cloudError');await authenticated();const rows=await read(bridge.db(),'profiles'),profile=rows.find(p=>p.id==='local-player');await write(bridge.db(),'profiles',{...profile,id:'local-player',name:value,guildSeed:false});await bridge.refresh();await sync();status=t('saved');});
  I.apply(document.querySelector('#bottomnav'));I.apply(document.querySelector('#topnav'));
 }
 async function authenticated(){if(!client||!owner||scope!=='account')throw Error('sessionExpired');const {data,error}=await client.auth.getUser();if(error||data.user?.id!==owner){if(error?.status===401||error?.status===403){await client.auth.signOut({scope:'local'});}throw error||Error('sessionExpired');}return owner;}
 async function exportDatabase(db){const data={format:'tower-guild-full-backup',schemaVersion:1,exportedAt:new Date().toISOString()};for(const store of stores)data[store]=(await read(db,store)).filter(row=>row.recordType!=='guild-sync');bridge.download('tower-full-backup-'+Date.now()+'.json',JSON.stringify(data,null,2));return data;}
 async function getManifest(){const rows=await read(bridge.db(),'profiles');return rows.find(r=>r.id==='__guild_sync__')?.value||{base:{},conflicts:{}};}
 function checkOwner(id){if(owner!==id||scope!=='account')throw Error('changed');}
 async function allRemote(id){const result=[];for(const table of ['player_runs','player_documents']){for(let offset=0;;offset+=500){const {data,error}=await client.from(table).select('*').eq('user_id',id).order(table==='player_runs'?'client_run_id':'client_id').range(offset,offset+499);if(error)throw error;for(const row of data)result.push(table==='player_runs'?{key:row.client_run_id,store:'runs',data:row.run_data,revision:row.revision,deleted:row.deleted}:{key:row.client_id,store:row.kind,data:row.document,revision:row.revision,deleted:row.deleted});if(data.length<500)break;}}return result;}
 async function sync(){
  const id=await authenticated(),db=bridge.db();manifest=await getManifest();
  const lock=async()=>{
   const token=crypto.randomUUID();set('tower-sync-lock:'+id,JSON.stringify({token,until:Date.now()+120000}));
   const heartbeat=setInterval(()=>set('tower-sync-lock:'+id,JSON.stringify({token,until:Date.now()+120000})),30000);
   try{manifest=await getManifest();
   const local=[];for(const store of stores)for(const data of await read(db,store))if((!data.recordType||data.recordType==='guild-settings')&&!data.guildSeed)local.push({store,data});
   const initial=S.stable(local),remote=await allRemote(id);checkOwner(id);
   // Re-read after network I/O; user edits must never be overwritten by an old snapshot.
   const current=[];for(const store of stores)for(const data of await read(db,store))if((!data.recordType||data.recordType==='guild-settings')&&!data.guildSeed)current.push({store,data});if(S.stable(current)!==initial)throw Error('changed');
   const result=await S.synchronize({local,remote,manifest,guard:()=>checkOwner(id),
    saveManifest:value=>write(db,'profiles',{id:'__guild_sync__',recordType:'guild-sync',value}),
    putLocal:(store,data)=>write(db,store,data),removeLocal:(store,key)=>erase(db,store,key),
    writeRemote:async(row,revision)=>{
     const run=row.store==='runs',table=run?'player_runs':'player_documents',keyColumn=run?'client_run_id':'client_id';
     const payload=run?{user_id:id,client_run_id:row.key,source_hash:row.key.startsWith('report:')?row.key.slice(7):null,run_data:row.data,deleted:row.deleted}:{user_id:id,client_id:row.key,kind:row.store,document:row.data,deleted:row.deleted};
     let query=client.from(table);query=revision===null?query.insert(payload):query.update(payload).eq('user_id',id).eq(keyColumn,row.key).eq('revision',revision);
     const {data,error}=await query.select();if(error)throw error;if(data.length!==1)throw Error('changed');return {...row,revision:data[0].revision};
    }});
   checkOwner(id);const settings=(await read(db,'profiles')).find(p=>p.id==='__guild_settings__');if(settings)I.set(settings.language);await bridge.reloadProfiles();await bridge.refresh();status=t('synced')+': ↑'+result.pushed+' ↓'+result.pulled+' · '+t('conflicts').split(':')[0]+' '+result.conflicts;return result;
   }finally{clearInterval(heartbeat);localStorage.removeItem('tower-sync-lock:'+id);}
  };
  // Every writer in this app uses this lock; other tabs lock the workspace read-only during sync.
  root.document.documentElement.classList.add('guild-syncing');
  try{return navigator.locks?await navigator.locks.request('tower-guild-sync-'+id,lock):await lock();}finally{root.document.documentElement.classList.remove('guild-syncing');}
 }
 async function showMigration(){
  const id=await authenticated(),legacy=await bridge.openDB('tower-analytics-alpha');
  const profiles=(await read(legacy,'profiles')).filter(p=>!p.recordType),area=document.querySelector('#guild-migration-area');
  area.innerHTML='<p>'+t('backupFirst')+'</p><label for="guild-source">'+t('local')+'</label><select id="guild-source">'+profiles.map(p=>'<option value="'+escape(p.id)+'">'+escape(p.name)+'</option>').join('')+'</select><div class="buttonrow">'+button('guild-original-backup','backup')+'</div><label class="review-check"><input type="checkbox" id="guild-consent">'+t('consent')+'</label>'+button('guild-transfer','transfer');
  backupReady=false;
  area.querySelector('#guild-original-backup').onclick=async()=>{await exportDatabase(legacy);backupReady=true;};
  area.querySelector('#guild-transfer').onclick=async()=>{
   const selected=area.querySelector('#guild-source').value,consent=area.querySelector('#guild-consent').checked;
   if(!backupReady||!consent){document.querySelector('#guild-status').textContent=t('backupRequired');return;}
   await perform(async()=>{checkOwner(id);const db=bridge.db(),batch=[];const profile=profiles.find(p=>p.id===selected);if(!profile)throw Error('changed');
    // Stable imported profile namespace keeps retries deterministic without binding legacy data automatically.
    const target='legacy:'+selected;batch.push({store:'profiles',data:{...profile,id:target}});
    for(const store of ['runs','accountEntries'])for(const row of await read(legacy,store))if(row.playerId===selected)batch.push({store,data:{...row,id:'legacy:'+row.id,playerId:target}});
    // Insert-only copy. A retry must never overwrite edits already made in the account workspace.
    const existing={};for(const store of stores)existing[store]=new Map((await read(db,store)).map(row=>[row.id,row]));
    const reportKeys=new Map();for(const row of existing.runs.values())reportKeys.set(await S.key('runs',row),row);
    const semantic=row=>{const copy={...row};for(const field of ['id','playerId','importedAt','sourceHash'])delete copy[field];return S.stable(copy);};
    for(const item of batch)if(item.store==='runs'&&item.data.rawText){const duplicate=reportKeys.get(await S.key('runs',item.data));if(duplicate&&duplicate.id!==item.data.id){if(semantic(duplicate)!==semantic(item.data))throw Error('localDuplicate');item.data=duplicate;}}
    await new Promise((ok,no)=>{const tx=db.transaction(stores,'readwrite');for(const row of batch)if(!existing[row.store].has(row.data.id))tx.objectStore(row.store).add(row.data);tx.oncomplete=ok;tx.onerror=()=>no(tx.error);tx.onabort=()=>no(tx.error||Error('changed'));});
    const result=await sync();if(result.conflicts)throw Error('changed');const actual=await allRemote(id);
    for(const row of batch){const k=await S.key(row.store,row.data),local=(await read(db,row.store)).find(r=>r.id===row.data.id),cloud=actual.find(r=>r.key===k&&!r.deleted);if(!local||!cloud||!S.equivalent(local,cloud.data))throw Error('changed');}
    await bridge.reloadProfiles();await bridge.refresh();status=t('migrationDone');
   });
  };
 }
 function locked(){try{const value=JSON.parse(get('tower-sync-lock:'+owner)||'null');return !!value&&value.until>Date.now();}catch{return true;}}
 const api={init,bind,databaseName,render,sync,get locked(){return locked();},get scope(){return scope;},get busy(){return busy;},get owner(){return owner;}};root.TowerGuild=api;
})(window);

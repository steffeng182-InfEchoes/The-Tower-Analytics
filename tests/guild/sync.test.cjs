const {test}=require('node:test');const assert=require('node:assert/strict');
const {decision,synchronize,stable,key}=require('../../guild/sync.js');
const {validateConfig}=require('../../guild/client.js');
const row=(data,revision=1,deleted=false)=>({key:'runs:x',store:'runs',data,revision,deleted});
const a={id:'x',note:'original'},b={id:'x',note:'local'},c={id:'x',note:'remote'};
test('initial rows, pulls and equality are conservative',()=>{assert.equal(decision(a,null,null),'push');assert.equal(decision(null,row(a),null),'pull');assert.equal(decision(a,row(a),null),'same');assert.equal(decision(a,row(b),null),'conflict');});
test('three-way updates preserve both competing originals',()=>{assert.equal(decision(b,row(a),{data:a}),'push');assert.equal(decision(a,row(b),{data:a}),'pull');assert.equal(decision(b,row(c),{data:a}),'conflict');});
test('deletions conflict with concurrent updates',()=>{assert.equal(decision(null,row(a),{data:a}),'delete');assert.equal(decision(null,row(b),{data:a}),'conflict');assert.equal(decision(b,row(a,2,true),{data:a}),'conflict');assert.equal(decision(a,row(a,2,true),{data:a}),'remove');assert.equal(decision(null,row(a,2,true),null),'none');});
test('stable serialization avoids object ordering conflicts',()=>assert.equal(stable({b:2,a:1}),stable({a:1,b:2})));
test('canonical report keys are deterministic across repeat imports',async()=>{assert.equal(await key('runs',{id:'a',rawText:'Battle Report\r\n Wave  10 '}),await key('runs',{id:'b',rawText:'Battle Report\nWave 10'}));});
test('unsafe keys and the unrelated CRM project are rejected',()=>{assert.equal(validateConfig({url:'',publishableKey:''}),false);assert.throws(()=>validateConfig({url:'https://oxaisrilkngxlwudruhn.supabase.co',publishableKey:'sb_publishable_x'}));assert.throws(()=>validateConfig({url:'https://tower.supabase.co',publishableKey:'sb_secret_x'}));assert.equal(validateConfig({url:'https://tower.supabase.co',publishableKey:'sb_publishable_x'}),true);});
test('interrupted upload retries without duplicate writes',async()=>{
 const remote=[],manifest={base:{},conflicts:{}},local=[{store:'runs',data:a}];let writes=0;
 const opts={local,remote,manifest,guard(){},saveManifest:async()=>{},putLocal:async()=>{},removeLocal:async()=>{},writeRemote:async r=>{writes++;remote.push({...r,revision:1});throw Error('response lost');}};
 await assert.rejects(synchronize(opts));const result=await synchronize(opts);assert.equal(result.pushed,0);assert.equal(writes,1);assert.equal(Object.keys(manifest.base).length,1);
});
test('conflicts are persisted with both private versions; no writes happen',async()=>{const manifest={base:{'runs:x':{data:a}},conflicts:{}};let writes=0;const result=await synchronize({local:[{store:'runs',data:b}],remote:[row(c)],manifest,guard(){},saveManifest:async()=>{},putLocal:async()=>{writes++;},removeLocal:async()=>{writes++;},writeRemote:async()=>{writes++;}});assert.equal(result.conflicts,1);assert.equal(writes,0);assert.deepEqual(manifest.conflicts['runs:x'].local,b);assert.deepEqual(manifest.conflicts['runs:x'].remote.data,c);});
test('account switch guard aborts before writes',async()=>{await assert.rejects(synchronize({local:[{store:'runs',data:a}],remote:[],manifest:{base:{},conflicts:{}},guard(){throw Error('changed');}}),/changed/);});

'use strict';
// Real integration test: two independently authenticated Supabase users. No mocks.
const assert=require('node:assert/strict');const {randomUUID}=require('node:crypto');
async function run(){
 const url=process.env.TOWER_SUPABASE_URL,key=process.env.TOWER_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key||!process.env.TOWER_TEST_A_EMAIL||!process.env.TOWER_TEST_B_EMAIL||!process.env.TOWER_TEST_A_PASSWORD||!process.env.TOWER_TEST_B_PASSWORD)throw Error('Real RLS test NOT RUN: Tower URL, publishable key and two confirmed test-account credentials required.');
 const local=process.env.TOWER_ALLOW_LOCAL_TEST==='1'&&/^http:\/\/(127\.0\.0\.1|localhost):54321$/.test(url);
 if(!local&&!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||url.includes('oxaisrilkngxlwudruhn')||!local&&!key.startsWith('sb_publishable_'))throw Error('Separate Tower project required');
 async function request(path,{token,method='GET',body}={}){const response=await fetch(url+path,{method,headers:{apikey:key,...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(20000)});const text=await response.text();let data;try{data=JSON.parse(text);}catch{data=text;}return {status:response.status,ok:response.ok,data};}
 async function login(prefix){const r=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:process.env[prefix+'_EMAIL'],password:process.env[prefix+'_PASSWORD']}});assert.ok(r.ok,'Independent Auth login failed');assert.ok(r.data.access_token&&r.data.user?.id);return {token:r.data.access_token,id:r.data.user.id};}
 const a=await login('TOWER_TEST_A'),b=await login('TOWER_TEST_B');assert.notEqual(a.id,b.id,'Two distinct users required');
 const tag='rls-test:'+randomUUID(),tables=[['player_runs',{client_run_id:tag,source_hash:tag,run_data:{rawText:'RLS fixture',id:tag},deleted:false},'client_run_id'],['player_documents',{client_id:tag,kind:'profiles',document:{id:tag,name:'RLS fixture'},deleted:false},'client_id']];
 try{
  for(const [table,fields,keyColumn] of tables){
   const filter='?'+keyColumn+'=eq.'+encodeURIComponent(tag);
   for(const u of [a,b])assert.ok((await request('/rest/v1/'+table,{token:u.token,method:'POST',body:{...fields,user_id:u.id}})).ok,'Same report must exist in independent accounts');
   const own=await request('/rest/v1/'+table+filter,{token:a.token});assert.equal(own.data.length,1);assert.equal(own.data[0].user_id,a.id);
   const cross='/rest/v1/'+table+filter+'&user_id=eq.'+b.id;
   assert.deepEqual((await request(cross,{token:a.token})).data,[],'Manipulated owner SELECT must be empty');
   assert.deepEqual((await request(cross,{token:a.token,method:'PATCH',body:fields})).data,[],'Cross-owner UPDATE must affect zero rows');
   assert.deepEqual((await request(cross,{token:a.token,method:'DELETE'})).data,[],'Cross-owner DELETE must affect zero rows');
   assert.equal((await request('/rest/v1/'+table,{token:a.token,method:'POST',body:{...fields,[keyColumn]:tag+':forged',user_id:b.id}})).ok,false,'Forged owner INSERT denied');
   assert.equal((await request('/rest/v1/'+table+filter,{token:a.token,method:'PATCH',body:{user_id:b.id}})).ok,false,'Owner reassignment denied');
   assert.equal((await request('/rest/v1/'+table,{token:a.token,method:'POST',body:{...fields,user_id:a.id}})).status,409,'Duplicate insert rejected');
   const revision=own.data[0].revision;const update=await request('/rest/v1/'+table+filter+'&revision=eq.'+revision,{token:a.token,method:'PATCH',body:fields});assert.ok(update.ok);assert.equal(update.data[0].revision,revision+1);
   assert.deepEqual((await request('/rest/v1/'+table+filter+'&revision=eq.'+revision,{token:a.token,method:'PATCH',body:fields})).data,[],'Stale revision rejected');
   assert.equal((await request('/rest/v1/'+table+filter)).ok,false,'Anonymous read denied');
   assert.equal((await request('/rest/v1/'+table+filter,{token:b.token})).data.length,1,'Other user original survived all attacks');
  }
  // Profile table: use existing rows without altering their values, verify cross-account visibility.
  for(const u of [a,b]){const profile=await request('/rest/v1/player_profiles?user_id=eq.'+u.id,{token:u.token});assert.ok(profile.ok);}
  assert.deepEqual((await request('/rest/v1/player_profiles?user_id=eq.'+b.id,{token:a.token})).data,[]);
  console.log('PASS: two real Auth users; private CRUD, forged ownership, cross-account attacks, duplicate prevention and optimistic revisions.');
 }finally{
  for(const u of [a,b]){for(const [table,,keyColumn] of tables)for(const id of [tag,tag+':forged']){const cleanup=await request('/rest/v1/'+table+'?'+keyColumn+'=eq.'+encodeURIComponent(id),{token:u.token,method:'DELETE'});if(!cleanup.ok)console.error('Test-row cleanup failed: '+table);}await request('/auth/v1/logout?scope=local',{token:u.token,method:'POST'});}
 }
}
module.exports={run};
if(require.main===module)run().catch(error=>{console.error(error.message);process.exitCode=1;});

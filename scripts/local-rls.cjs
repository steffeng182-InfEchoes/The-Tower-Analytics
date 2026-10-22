'use strict';
// Runs only against an ephemeral loopback Supabase stack in CI. No hosted admin keys.
const {execFileSync}=require('node:child_process'),{randomUUID}=require('node:crypto');
const {run}=require('./test-rls.cjs');
async function main(){
 const status=JSON.parse(execFileSync('npx',['--yes','supabase@2.121.0','status','--output','json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
 const url=status.API_URL,key=status.ANON_KEY,admin=status.SERVICE_ROLE_KEY;
 if(!/^http:\/\/(127\.0\.0\.1|localhost):54321$/.test(url)||!key||!admin)throw Error('Ephemeral local Supabase credentials missing');
 for(const secret of [key,admin])console.log('::add-mask::'+secret);
 const users=[];
 const request=async(path,method,body)=>{const r=await fetch(url+'/auth/v1/admin/users'+path,{method,headers:{apikey:key,Authorization:'Bearer '+admin,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Local fixture administration failed: HTTP '+r.status);return r.status===204?null:r.json();};
 try{
  for(const label of ['A','B']){const email='tower-rls-'+randomUUID()+'@example.test',password=randomUUID()+randomUUID();const user=await request('','POST',{email,password,email_confirm:true});users.push(user.id);process.env['TOWER_TEST_'+label+'_EMAIL']=email;process.env['TOWER_TEST_'+label+'_PASSWORD']=password;console.log('::add-mask::'+password);}
  process.env.TOWER_ALLOW_LOCAL_TEST='1';process.env.TOWER_SUPABASE_URL=url;process.env.TOWER_SUPABASE_PUBLISHABLE_KEY=key;await run();
 }finally{for(const id of users)await request('/'+id,'DELETE').catch(()=>console.error('Local test-user cleanup failed'));}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});

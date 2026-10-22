'use strict';
// No service key, data writes, token logging or credential-bearing URLs.
async function health({url,key,email,password,fetcher=fetch}){
 const parsed=new URL(url);if(parsed.protocol!=='https:'||!parsed.hostname.endsWith('.supabase.co')||parsed.hostname==='oxaisrilkngxlwudruhn.supabase.co')throw Error('Separate Tower project HTTPS URL required');
 if(!key?.startsWith('sb_publishable_')||!email||!password)throw Error('Missing Tower health configuration');
 const auth=await fetcher(parsed.origin+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({email,password}),signal:AbortSignal.timeout(20000)});
 if(!auth.ok)throw Error('Health account authentication failed (HTTP '+auth.status+')');
 const session=await auth.json();if(!session.access_token||!session.user?.id)throw Error('Invalid health session');
 try{
  const response=await fetcher(parsed.origin+'/rest/v1/rpc/tower_health',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error('Database health check failed (HTTP '+response.status+')');
  const data=await response.json();if(data.database!==true||data.schema!=='guild-v1'||!Number.isInteger(data.own_rows))throw Error('Unexpected database health response');
  return {database:true,schema:data.schema};
 }finally{
  // Revoke this short-lived health session without touching other sessions.
  await fetcher(parsed.origin+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+session.access_token},signal:AbortSignal.timeout(10000)}).catch(()=>{});
 }
}
module.exports={health};
if(require.main===module)health({url:process.env.TOWER_SUPABASE_URL,key:process.env.TOWER_SUPABASE_PUBLISHABLE_KEY,email:process.env.TOWER_HEALTH_EMAIL,password:process.env.TOWER_HEALTH_PASSWORD}).then(()=>console.log('Tower database reachable; guild-v1 verified.')).catch(error=>{console.error('::error::'+error.message);process.exitCode=1;});

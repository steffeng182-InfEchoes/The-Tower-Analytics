// Temporary acceptance fixture service. No management or service keys leave the runtime.
// Authenticates GitHub OIDC itself, restricted to the owner's exact repository,
// branch, workflow and push event. Redeployed disabled after acceptance.
const project='tzgbsiwchzrkvntcnikx';
const repository='steffeng182-InfEchoes/The-Tower-Analytics';
const branch='refs/heads/feature/guild-supabase-foundation';
const audience='tower-analytics-hosted-acceptance';
const workflow=repository+'/.github/workflows/hosted-acceptance.yml@'+branch;
const deadline=Date.parse('2026-10-23T12:00:00Z');
const decode=(value:string)=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(value.length/4)*4,'=')),c=>c.charCodeAt(0));
let jwks:{keys:JsonWebKey[]}|null=null;
async function authorize(req:Request){
 const value=req.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
 if(value.length>16000)throw Error('unauthorized');
 const parts=value.split('.');if(parts.length!==3)throw Error('unauthorized');
 const header=JSON.parse(new TextDecoder().decode(decode(parts[0])));
 if(header.alg!=='RS256'||typeof header.kid!=='string')throw Error('unauthorized');
 if(!jwks){const result=await fetch('https://token.actions.githubusercontent.com/.well-known/jwks',{signal:AbortSignal.timeout(10000)});if(!result.ok)throw Error('unauthorized');jwks=await result.json();}
 const source=jwks!.keys.find((key:JsonWebKey&{kid?:string})=>key.kid===header.kid);if(!source)throw Error('unauthorized');
 const key=await crypto.subtle.importKey('jwk',source,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])))throw Error('unauthorized');
 const claims=JSON.parse(new TextDecoder().decode(decode(parts[1]))),now=Date.now()/1000;
 if(claims.iss!=='https://token.actions.githubusercontent.com'||claims.aud!==audience||claims.repository_id!=='1422993871'||claims.repository!==repository||claims.ref!==branch||claims.workflow_ref!==workflow||claims.event_name!=='push'||claims.actor_id!=='248187667'||!Number.isFinite(claims.exp)||claims.exp<=now||claims.iat>now+30||claims.iat<now-600||claims.nbf>now+30||!/^\d+$/.test(claims.run_id)||!/^\d+$/.test(claims.run_attempt))throw Error('unauthorized');
 return claims;
}
Deno.serve(async(req:Request)=>{
 if(Date.now()>deadline)return new Response('Acceptance service expired',{status:410});
 if(req.method!=='POST')return new Response('Method not allowed',{status:405});
 let claims;try{claims=await authorize(req);}catch{return new Response('Unauthorized',{status:401});}
 const run=claims.run_id+'-'+claims.run_attempt;
 const base=Deno.env.get('SUPABASE_URL')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
 if(new URL(base).hostname!==project+'.supabase.co')return new Response('Wrong project',{status:503});
 async function admin(path:string,method:string,body?:unknown){const response=await fetch(base+'/auth/v1/'+path,{method,headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Auth administration HTTP '+response.status);return response.status===204?null:response.json();}
 try{
  const body=await req.json();
  if(body.action==='provision'){
   const users=[];
   for(const label of ['a','b']){
    const email='tower-ci-'+run+'-'+label+'@example.test',password=crypto.randomUUID()+crypto.randomUUID();
    const user=await admin('admin/users','POST',{email,password,email_confirm:true,app_metadata:{tower_ci_run:run}});
    const link=await admin('admin/generate_link','POST',{type:'magiclink',email});
    users.push({id:user.id,email,password,action_link:link.action_link,email_otp:link.email_otp});
   }
   return Response.json({users},{headers:{'Cache-Control':'no-store'}});
  }
  if(body.action==='link'&&typeof body.id==='string'&&/^[0-9a-f-]{36}$/.test(body.id)){
   const user=await admin('admin/users/'+body.id,'GET');if(user.app_metadata?.tower_ci_run!==run||!user.email?.startsWith('tower-ci-'+run+'-'))throw Error('Fixture ownership mismatch');
   const link=await admin('admin/generate_link','POST',{type:'magiclink',email:user.email});
   return Response.json({action_link:link.action_link,email_otp:link.email_otp},{headers:{'Cache-Control':'no-store'}});
  }
  if(body.action==='cleanup'&&Array.isArray(body.ids)&&body.ids.length<=2){
   for(const id of body.ids){if(!/^[0-9a-f-]{36}$/.test(id))throw Error('Invalid fixture');const user=await admin('admin/users/'+id,'GET');if(user.app_metadata?.tower_ci_run!==run||!user.email?.startsWith('tower-ci-'+run+'-')||!user.email.endsWith('@example.test'))throw Error('Fixture ownership mismatch');await admin('admin/users/'+id,'DELETE');}
   return Response.json({cleaned:true});
  }
  return new Response('Invalid action',{status:400});
 }catch{return new Response('Acceptance fixture operation failed',{status:500});}
});

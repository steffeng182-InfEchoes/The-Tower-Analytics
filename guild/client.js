(function(root){
 'use strict';
 const FORBIDDEN_PROJECT='oxaisrilkngxlwudruhn';
 function validateConfig(config){
  if(!config?.url&&!config?.publishableKey)return false;
  const url=new URL(config.url);
  if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co')||url.hostname.includes(FORBIDDEN_PROJECT)||url.pathname!=='/'||url.search||url.hash||url.username||url.password)throw Error('cloudConfig');
  const key=config.publishableKey||'';
  if(!key.startsWith('sb_publishable_'))throw Error('cloudConfig');
  return true;
 }
 async function create(config){
  if(!validateConfig(config))return null;
  // Pinned SDK, loaded only for configured cloud mode. Local mode has no CDN dependency.
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/+esm');
  const storageKey='tower-guild-auth-'+new URL(config.url).hostname.split('.')[0];
  return createClient(config.url,config.publishableKey,{
   auth:{storageKey,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'},
   global:{fetch:(url,options={})=>fetch(url,{...options,signal:options.signal||AbortSignal.timeout(20000)})}
  });
 }
 const api={create,validateConfig};root.TowerCloud=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

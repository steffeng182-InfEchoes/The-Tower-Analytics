// UI/sync test adapter ONLY. This does not test or simulate database RLS security.
window.TowerCloud.create=async()=>{
 const A='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',B='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 const current=()=>{const id=localStorage.getItem('test-auth');return id?{user:{id,email:id===A?'a@example.test':'b@example.test'}}:null;};
 let callback=()=>{};
 window.testLogin=id=>{localStorage.setItem('test-auth',id);callback('SIGNED_IN',current());};
 const auth={getSession:async()=>({data:{session:current()}}),getUser:async()=>navigator.onLine?{data:{user:current()?.user}}:{data:{},error:{name:'TypeError'}},onAuthStateChange:fn=>{callback=fn;return {data:{subscription:{unsubscribe(){}}}};},signInWithOtp:async()=>({error:null}),signOut:async()=>{localStorage.removeItem('test-auth');callback('SIGNED_OUT',null);return {error:null};}};
 function from(table){let mode='read',payload,filters=[],offset=0,end=999;const query={select(){return query;},eq(k,v){filters.push([k,v]);return query;},order(){return query;},range(a,b){offset=a;end=b;return query;},insert(v){mode='insert';payload=v;return query;},update(v){mode='update';payload=v;return query;},then(resolve,reject){return Promise.resolve().then(()=>{if(!navigator.onLine)throw TypeError('Offline test');const all=JSON.parse(localStorage.getItem('test-cloud')||'{}'),rows=all[table]||[],matches=r=>filters.every(([k,v])=>r[k]===v);let data;
 if(mode==='read')data=rows.filter(matches).slice(offset,end+1);else if(mode==='insert'){data=[{...payload,revision:1}];rows.push(...data);}else{data=[];for(let i=0;i<rows.length;i++)if(matches(rows[i])){rows[i]={...rows[i],...payload,revision:rows[i].revision+1};data.push(rows[i]);}}
 all[table]=rows;localStorage.setItem('test-cloud',JSON.stringify(all));return {data,error:null};}).then(resolve,reject);}};return query;}
 return {auth,from};
};
